// ============================================================
// POST/GET /api/process-job  — the async capture worker.
//
// Drains the queue: each capture row IS a job (Step B/C schema). One sweep
// handles BOTH stragglers (ai_status='queued' the kick missed) AND retries
// (ai_status='failed' with attempts < MAX_ATTEMPTS) — never two systems.
//
// Trigger model (locked): kick + cron safety net.
//   - Kick:  the capture flow fires this once after enqueuing (fast path).
//   - Cron:  vercel.json runs it every minute (catches anything the kick
//            missed, plus retries). Same endpoint, same sweep.
//
// It reuses the existing /api/transcribe and /api/process-capture endpoints
// via internal fetch, so the transcription provider logic AND the gut-feel
// cost gate are reused unchanged. The worker's only new job is mapping the
// structured result back onto the capture row's columns.
//
// Concurrency-safe: rows are claimed with an optimistic lock (update ...
// where ai_status = <the value we read>), so an overlapping kick + cron
// can never both grab the same row.
// ============================================================

import { adminClient, supabaseConfigured } from './_supabase.js';

const BUCKET = 'capture-audio';
const MAX_ATTEMPTS = 3;
const BATCH = 5; // rows per invocation — keep within the function time budget

function baseUrl() {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return '';
}

// Authorize the sweep. If CRON_SECRET is set, require it (Vercel cron sends it
// as a Bearer token); otherwise the endpoint is open (fine for early testing).
function authorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers['authorization'] || req.headers['Authorization'] || '';
  return auth === `Bearer ${secret}` || req.headers['x-cron-secret'] === secret;
}

export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (!supabaseConfigured()) {
    return res.status(200).json({ status: 'placeholder', message: 'Supabase not configured.' });
  }
  const base = baseUrl();
  if (!base) {
    return res.status(500).json({ error: 'No base URL. Set PUBLIC_BASE_URL or run on Vercel (VERCEL_URL).' });
  }

  const db = adminClient();
  const summary = { claimed: 0, ready: 0, failed: 0, skipped: 0 };

  try {
    // Find candidates: queued, or failed-but-retryable. Oldest first.
    const { data: candidates, error } = await db
      .from('captures')
      .select('id, ai_status, attempts, audio_path, audio_mime, job_payload, transcript_confidence')
      .or(`ai_status.eq.queued,and(ai_status.eq.failed,attempts.lt.${MAX_ATTEMPTS})`)
      .order('enqueued_at', { ascending: true, nullsFirst: true })
      .limit(BATCH);
    if (error) throw error;

    for (const row of (candidates || [])) {
      const claimed = await claim(db, row);
      if (!claimed) { summary.skipped++; continue; } // lost the race to another invocation
      summary.claimed++;
      try {
        await processOne(db, base, claimed);
        summary.ready++;
      } catch (e) {
        await fail(db, claimed.id, e);
        summary.failed++;
      }
    }
    return res.status(200).json({ ok: true, ...summary });
  } catch (err) {
    console.error('[process-job] sweep error:', err);
    return res.status(500).json({ error: 'Sweep failed', detail: String(err.message || err), ...summary });
  }
}

// Optimistic-lock claim: only succeeds if the row is still in the state we read.
async function claim(db, row) {
  const { data, error } = await db
    .from('captures')
    .update({
      ai_status: 'transcribing',
      attempts: (row.attempts || 0) + 1,
      processing_started_at: new Date().toISOString(),
      last_error: null
    })
    .eq('id', row.id)
    .eq('ai_status', row.ai_status)
    .select('id, audio_path, audio_mime, job_payload, transcript_confidence')
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

async function processOne(db, base, row) {
  const payload = row.job_payload || {};

  // 1) Pull the audio from storage and transcribe it.
  if (!row.audio_path) throw new Error('No audio_path on job row.');
  const { data: blob, error: dlErr } = await db.storage.from(BUCKET).download(row.audio_path);
  if (dlErr || !blob) throw new Error(`Audio download failed: ${dlErr && dlErr.message}`);
  const audioBase64 = Buffer.from(await blob.arrayBuffer()).toString('base64');

  const tx = await postJSON(`${base}/api/transcribe`, {
    audioBase64,
    mime: row.audio_mime || 'audio/webm'
  });

  // No transcript (provider unconfigured / placeholder / empty) -> finish honestly
  // as a light, unstructured capture rather than retry-looping on a config issue.
  if (!tx || !tx.transcript) {
    await finishUnstructured(db, row.id, '', null, payload);
    return;
  }

  const transcript = tx.transcript;
  const confidence = tx.confidence || row.transcript_confidence || 'medium';
  await db.from('captures').update({ transcript, transcript_confidence: confidence, ai_status: 'structuring' }).eq('id', row.id);

  // 2) Structure via the existing endpoint (gutFeel { momentum, receptivity }
  //    flows through as a prompt prior; structuring always runs).
  const ai = await postJSON(`${base}/api/process-capture`, {
    transcript,
    template: payload.template || {},
    ownerStyle: payload.ownerStyle || {},
    userIntent: payload.userIntent || null,
    eventContext: payload.eventContext || null,
    transcriptConfidence: confidence,
    gutFeel: payload.gutFeel || null
  });

  if (!ai || !ai.person) {
    // Unusable / placeholder result -> ready, transcript preserved, no deep AI.
    await finishUnstructured(db, row.id, transcript, confidence, payload);
    return;
  }

  // 3) Map the structured result onto the row and mark ready.
  await db.from('captures').update(mapStructure(ai, transcript, confidence, payload)).eq('id', row.id);
}

// Ready, but without AI structure (gated or transcription unavailable).
async function finishUnstructured(db, id, transcript, confidence, payload) {
  await db.from('captures').update({
    transcript: transcript || null,
    transcript_confidence: confidence,
    context: transcript ? transcript.slice(0, 600) : null,
    priority: gutPriority(payload.gutFeel, 'worth-exploring'),
    ai_status: 'ready',
    processed_at: new Date().toISOString(),
    last_error: null
  }).eq('id', id);
}

function mapStructure(ai, transcript, confidence, payload) {
  const steps = (ai.draft && Array.isArray(ai.draft.nextSteps) ? ai.draft.nextSteps : []).filter(Boolean);
  const firstStep = (ai.draft && ai.draft.nextStep) || steps[0] || 'Review and decide the next step';
  const templateName = (payload.template && payload.template.name) || null;
  return {
    name: (ai.person && ai.person.name) || null,
    company: (ai.person && ai.person.company) || null,
    role: (ai.person && ai.person.role) || null,
    signal: (ai.signal && ai.signal.primary) || null,
    signal_label: (ai.signal && ai.signal.primaryLabel) || (templateName ? `${templateName} capture` : null),
    evidence: (ai.signal && ai.signal.evidence) || null,
    secondary_thread: (ai.signal && ai.signal.secondary) || null,
    priority: aiPriority(ai, gutPriority(payload.gutFeel, 'worth-exploring')),
    action: firstStep,
    next_steps: steps.length ? steps : [firstStep],
    draft_message: (ai.draft && ai.draft.message) || null,
    context: (ai.draft && ai.draft.context) || (transcript ? transcript.slice(0, 600) : null),
    needs_name_confirmation: ai.verification ? !!ai.verification.needsNameConfirmation : !((ai.person && ai.person.name)),
    name_confidence: (ai.person && ai.person.nameConfidence) || null,
    completeness: (ai.intelligence && ai.intelligence.completeness_intelligence && typeof ai.intelligence.completeness_intelligence.overall_score === 'number')
      ? ai.intelligence.completeness_intelligence.overall_score
      : ((ai.completeness && typeof ai.completeness.score === 'number') ? ai.completeness.score : (ai.completeness || null)),
    ai_momentum: ai.ai_momentum || ai.momentum || ai.relationshipMomentum || null,
    ai_confidence: (
      typeof ai.ai_confidence === 'number'
        ? ai.ai_confidence
        : typeof ai.confidence === 'number'
          ? ai.confidence
          : ai.confidence && typeof ai.confidence.score === 'number'
            ? ai.confidence.score
            : null
    ),
    ai_primary_signals: (
      ai.ai_primary_signals
        || ai.primarySignals
        || (ai.signal && ai.signal.primary
          ? [ai.signal.primary].concat(ai.signal.primarySubtype ? [ai.signal.primarySubtype] : [])
          : null)
    ),
    relationship_read: ai.relationshipRead && ai.relationshipRead.level ? ai.relationshipRead.level : null,
    commitment_level: ai.relationshipRead && ai.relationshipRead.commitmentLevel ? ai.relationshipRead.commitmentLevel : null,
    reciprocity_read: ai.relationshipRead && ai.relationshipRead.reciprocity ? ai.relationshipRead.reciprocity : null,
    moving_toward_signals: ai.relationshipRead && ai.relationshipRead.movingTowardSignals ? ai.relationshipRead.movingTowardSignals : null,
    moving_away_signals: ai.relationshipRead && ai.relationshipRead.movingAwaySignals ? ai.relationshipRead.movingAwaySignals : null,
    relationship_read_summary: ai.relationshipRead && ai.relationshipRead.summary ? ai.relationshipRead.summary : null,
    safe_to_send: ai.safeToSend && ai.safeToSend.status === 'yes',
    safe_to_send_reason: ai.safeToSend && ai.safeToSend.reason ? ai.safeToSend.reason : null,
    needs_you_reasons: ai.needsYouReasons || null,
    memory_anchors: ai.memoryAnchors || null,
    why_follow_up: ai.whyFollowUp || null,
    human_reads: ai.humanReads || null,
    anchor_read: (ai.humanReads && ai.humanReads.anchorRead) || null,
    imprint_read: (ai.humanReads && ai.humanReads.imprintRead) || null,
    opening_read: (ai.humanReads && ai.humanReads.openingRead) || null,
    intelligence_read: (ai.humanReads && ai.humanReads.intelligenceRead) || null,
    intelligence_json: ai.intelligence || null,
    momentum_level: (ai.intelligence && ai.intelligence.relationship_hub_record && ai.intelligence.relationship_hub_record.momentumLevel)
      || (ai.intelligence && ai.intelligence.behavioral_intelligence && ai.intelligence.behavioral_intelligence.momentum)
      || null,
    transcript,
    transcript_confidence: confidence,
    ai_status: 'ready',
    processed_at: new Date().toISOString(),
    last_error: null
  };
}

async function fail(db, id, err) {
  console.error('[process-job] job failed:', id, err);
  await db.from('captures').update({
    ai_status: 'failed',
    last_error: String((err && err.message) || err).slice(0, 500)
  }).eq('id', id);
}

// Mirror of the client's priority logic so async captures rank like sync ones.
function aiPriority(ai, fallback) {
  if (!ai || !ai.signal) return fallback;
  const primary = ai.signal.primary, sub = ai.signal.primarySubtype;
  const hi = ['direct_opportunity', 'pilot_beta', 'investor', 'speaking_opportunity'];
  if (primary === 'opportunity' && hi.indexOf(sub) >= 0) return 'act-soon';
  if (primary === 'stay') return 'keep-warm';
  if (primary === 'opportunity' || primary === 'collaboration') return 'worth-exploring';
  return fallback;
}
function gutPriority(g, fb) {
  const value = typeof g === 'string'
    ? g
    : (g && typeof g === 'object' ? g.value : null);
  if (!value) return fb;
  if (value === 'something_here') return 'act-soon';
  if (value === 'good_connection') return 'worth-exploring';
  if (value === 'no_spark') return 'keep-warm';
  if (value === 'hard_to_read') return fb;
  return fb;
}

async function postJSON(url, body) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) return null;
    const j = await res.json();
    if (j && (j.status === 'placeholder' || j.status === 'gated')) return null;
    return j;
  } catch (e) {
    console.error('[process-job] postJSON error:', url, e);
    return null;
  }
}
