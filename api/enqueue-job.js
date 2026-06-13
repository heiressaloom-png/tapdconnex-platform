// ============================================================
// POST /api/enqueue-job — the split-moment enqueue.
//
// The capture flow calls this instead of processing in the browser:
// it uploads the audio to the private capture-audio bucket, inserts the
// capture row as ai_status='queued' (the row IS the job), and fires a
// best-effort kick at the worker. The user is freed immediately — the
// card appears in the Hub and fills in as the worker runs.
//
// Honest fallback: if Supabase isn't configured it returns a placeholder
// so the client falls back to the in-browser pipeline (capture still works).
// ============================================================

import { adminClient, supabaseConfigured } from './_supabase.js';

export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

const BUCKET = 'capture-audio';

function baseUrl() {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return '';
}
function extFor(mime) {
  if (!mime) return 'webm';
  if (mime.includes('mp4') || mime.includes('m4a')) return 'mp4';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  if (mime.includes('ogg')) return 'ogg';
  return 'webm';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!supabaseConfigured()) {
    return res.status(200).json({ status: 'placeholder', message: 'Supabase not configured.' });
  }

  const { userId, capture, audioBase64, mime, jobPayload } = req.body || {};
  if (!userId || !capture || !capture.id) {
    return res.status(400).json({ error: 'Missing userId or capture.id' });
  }
  if (!audioBase64) return res.status(400).json({ error: 'Missing audioBase64' });

  const db = adminClient();
  try {
    // 1) Upload the audio to a private, per-user path.
    const audioPath = `${userId}/${capture.id}.${extFor(mime)}`;
    const buffer = Buffer.from(audioBase64, 'base64');
    const up = await db.storage.from(BUCKET).upload(audioPath, buffer, {
      contentType: mime || 'audio/webm',
      upsert: true
    });
    if (up.error) throw up.error;

    // 2) Insert the queued capture row (the job).
    const now = new Date().toISOString();
    const row = {
      id: capture.id,
      user_id: userId,
      name: capture.name ?? null,
      company: capture.company ?? null,
      role: capture.role ?? null,
      event: capture.event ?? null,
      event_key: capture.eventKey ?? null,
      template: capture.template ?? null,
      template_name: capture.templateName ?? null,
      captured_at: capture.capturedAt || now,
      priority: capture.priority ?? null,
      gut_feel: capture.gutFeel ?? null,
      outcome: 'active',
      completeness: capture.completeness ?? 0,
      ai_status: 'queued',
      audio_path: audioPath,
      audio_mime: mime || 'audio/webm',
      audio_incomplete: !!capture.audioIncomplete,
      job_payload: jobPayload || {},
      attempts: 0,
      enqueued_at: now,
      updated_at: now
    };
    const ins = await db.from('captures').upsert(row, { onConflict: 'id' });
    if (ins.error) throw ins.error;

    // 3) Best-effort kick. Not awaited — the 1-minute cron is the guarantee,
    //    so a frozen function or dropped request can never orphan the job.
    kick();

    return res.status(200).json({ ok: true, id: capture.id, audioPath, aiStatus: 'queued' });
  } catch (err) {
    console.error('[enqueue-job] error:', err);
    return res.status(500).json({ error: 'Enqueue failed', detail: String(err.message || err) });
  }
}

function kick() {
  const base = baseUrl();
  if (!base) return;
  const headers = {};
  if (process.env.CRON_SECRET) headers['Authorization'] = `Bearer ${process.env.CRON_SECRET}`;
  // fire-and-forget; swallow everything — the cron safety net guarantees the sweep
  try { fetch(`${base}/api/process-job`, { method: 'POST', headers }).catch(() => {}); } catch (e) {}
}
enqueuejob.js
