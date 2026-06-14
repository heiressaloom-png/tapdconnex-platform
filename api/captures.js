// ============================================================
// /api/captures — persistence for the Relationship Hub.
//
//   GET    /api/captures?userId=...        -> { captures: [...] }
//   POST   /api/captures                   -> upsert one capture   (body = capture object + userId)
//   PATCH  /api/captures                   -> { id, userId, outcome?, name?, needsNameConfirmation? }
//
// MVP NOTE ON AUTH:
// This uses the service-role client keyed by an explicit `userId` so the Hub
// can move off localStorage immediately. That is fine for testing but is NOT
// secure for production — any caller could pass any userId.
// Production path: wire Supabase Auth, send the user's JWT in Authorization,
// switch to userClient(jwt), and enable the RLS policies in supabase/schema.sql.
// ============================================================

import { adminClient, supabaseConfigured } from './_supabase.js';

const TABLE = 'captures';

// Map our capture object <-> DB columns (snake_case).
function toRow(c, userId) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name ?? null,
    company: c.company ?? null,
    role: c.role ?? null,
    signal: c.signal ?? null,
    signal_label: c.signalLabel ?? null,
    evidence: c.evidence ?? null,
    secondary_thread: c.secondaryThread ?? null,
    priority: c.priority ?? null,
    action: c.action ?? null,
    draft_message: c.draftMessage ?? null,
    context: c.context ?? null,
    captured_at: c.capturedAt ?? new Date().toISOString(),
    event: c.event ?? null,
    event_key: c.eventKey ?? null,
    outcome: c.outcome ?? 'active',
    template: c.template ?? null,
    template_name: c.templateName ?? null,
    needs_name_confirmation: !!c.needsNameConfirmation,
    name_confidence: c.nameConfidence ?? null,
    completeness: c.completeness ?? null,
    channel_preference: c.channelPreference ?? null,
    transcript_confidence: c.transcriptConfidence ?? null,
    next_steps: c.nextSteps ?? null,
    gut_feel: c.gutFeel ? {
      value: c.gutFeel,
      label: c.gutFeelLabel ?? null,
      momentumHint: c.gutMomentumHint ?? null
    } : null,
    initial_gut_feel: c.initialGutFeel ?? c.gutFeel ?? null,
    gut_feel_label: c.gutFeelLabel ?? null,
    gut_momentum_hint: c.gutMomentumHint ?? null,
    outcome_status: c.outcomeStatus ?? null,
    outcome_updated_at: c.outcomeUpdatedAt ?? null,
    ai_momentum: c.aiMomentum ?? null,
    ai_confidence: c.aiConfidence ?? null,
    ai_primary_signals: c.aiPrimarySignals ?? null,
    current_relationship_sense: c.currentRelationshipSense ?? null,
    relationship_movement: c.relationshipMovement ?? null,
    movement_reason: c.movementReason ?? null,
    relationship_sense_updated_at: c.relationshipSenseUpdatedAt ?? null,
    relationship_sense_result: c.relationshipSenseResult ?? null,
    relationship_read: c.relationshipRead ?? null,
    commitment_level: c.commitmentLevel ?? null,
    reciprocity_read: c.reciprocityRead ?? null,
    moving_toward_signals: c.movingTowardSignals ?? null,
    moving_away_signals: c.movingAwaySignals ?? null,
    relationship_read_summary: c.relationshipReadSummary ?? null,
    safe_to_send: c.safeToSend ?? null,
    safe_to_send_reason: c.safeToSendReason ?? null,
    needs_you_reasons: c.needsYouReasons ?? null,
    memory_anchors: c.memoryAnchors ?? null,
    why_follow_up: c.whyFollowUp ?? null,
    human_reads: c.humanReads ?? null,
    anchor_read: c.anchorRead ?? null,
    imprint_read: c.imprintRead ?? null,
    opening_read: c.openingRead ?? null,
    intelligence_read: c.intelligenceRead ?? null,
    intelligence_json: c.intelligence ?? c.intelligenceJson ?? null,
    momentum_level: c.momentumLevel ?? null,
    behavioral_read: c.behavioralRead ?? null,
    opportunity_readiness: c.opportunityReadiness ?? null,
    relationship_priority: c.relationshipPriority ?? null,
    attention_labels: c.attentionLabels ?? null,
    human_read_summary: c.humanReadSummary ?? null,
    commitment_ledger: c.commitmentLedger ?? null,
    outcome_ledger: c.outcomeLedger ?? null,
    updated_at: new Date().toISOString()
  };
}

function toCapture(r) {
  return {
    id: r.id, name: r.name, company: r.company, role: r.role,
    signal: r.signal, signalLabel: r.signal_label, evidence: r.evidence,
    secondaryThread: r.secondary_thread, priority: r.priority, action: r.action,
    draftMessage: r.draft_message, context: r.context,
    capturedAt: r.captured_at, event: r.event, eventKey: r.event_key,
    outcome: r.outcome, template: r.template, templateName: r.template_name,
    needsNameConfirmation: r.needs_name_confirmation, nameConfidence: r.name_confidence,
    completeness: r.completeness, channelPreference: r.channel_preference,
    transcriptConfidence: r.transcript_confidence,
    nextSteps: r.next_steps ?? null,
    initialGutFeel: r.initial_gut_feel ?? (r.gut_feel && r.gut_feel.value) ?? null,
    gutFeel: r.initial_gut_feel ?? (r.gut_feel && r.gut_feel.value) ?? null,
    gutFeelLabel: r.gut_feel_label ?? (r.gut_feel && r.gut_feel.label) ?? null,
    gutMomentumHint: r.gut_momentum_hint ?? (r.gut_feel && r.gut_feel.momentumHint) ?? null,
    outcomeStatus: r.outcome_status ?? null,
    outcomeUpdatedAt: r.outcome_updated_at ?? null,
    aiMomentum: r.ai_momentum ?? null,
    aiConfidence: r.ai_confidence ?? null,
    aiPrimarySignals: r.ai_primary_signals ?? null,
    currentRelationshipSense: r.current_relationship_sense ?? null,
    relationshipMovement: r.relationship_movement ?? null,
    movementReason: r.movement_reason ?? null,
    relationshipSenseUpdatedAt: r.relationship_sense_updated_at ?? null,
    relationshipSenseResult: r.relationship_sense_result ?? null,
    relationshipRead: r.relationship_read ?? null,
    commitmentLevel: r.commitment_level ?? null,
    reciprocityRead: r.reciprocity_read ?? null,
    movingTowardSignals: r.moving_toward_signals ?? null,
    movingAwaySignals: r.moving_away_signals ?? null,
    relationshipReadSummary: r.relationship_read_summary ?? null,
    safeToSend: r.safe_to_send ?? null,
    safeToSendReason: r.safe_to_send_reason ?? null,
    needsYouReasons: r.needs_you_reasons ?? null,
    memoryAnchors: r.memory_anchors ?? null,
    whyFollowUp: r.why_follow_up ?? null,
    humanReads: r.human_reads ?? null,
    anchorRead: r.anchor_read ?? null,
    imprintRead: r.imprint_read ?? null,
    openingRead: r.opening_read ?? null,
    intelligenceRead: r.intelligence_read ?? null,
    intelligence: r.intelligence_json ?? null,
    momentumLevel: r.momentum_level ?? null,
    behavioralRead: r.behavioral_read ?? null,
    opportunityReadiness: r.opportunity_readiness ?? null,
    relationshipPriority: r.relationship_priority ?? null,
    attentionLabels: r.attention_labels ?? null,
    humanReadSummary: r.human_read_summary ?? null,
    commitmentLedger: r.commitment_ledger ?? null,
    outcomeLedger: r.outcome_ledger ?? null,
    aiStatus: r.ai_status ?? null, audioIncomplete: r.audio_incomplete ?? false,
    capturedDaysAgo: r.captured_at
      ? Math.floor((Date.now() - new Date(r.captured_at).getTime()) / 86400000)
      : 0
  };
}

export default async function handler(req, res) {
  if (!supabaseConfigured()) {
    return res.status(200).json({ status: 'placeholder', message: 'Supabase not configured.' });
  }
  const db = adminClient();

  try {
    if (req.method === 'GET') {
      const userId = req.query.userId;
      if (!userId) return res.status(400).json({ error: 'Missing userId' });
      const { data, error } = await db.from(TABLE).select('*')
        .eq('user_id', userId).order('captured_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ captures: (data || []).map(toCapture) });
    }

    if (req.method === 'POST') {
      const { userId, ...capture } = req.body || {};
      if (!userId || !capture.id) return res.status(400).json({ error: 'Missing userId or capture.id' });
      const { error } = await db.from(TABLE).upsert(toRow(capture, userId), { onConflict: 'id' });
      if (error) throw error;
      return res.status(200).json({ ok: true, id: capture.id });
    }

    if (req.method === 'PATCH') {
      const { id, userId, ...patch } = req.body || {};
      if (!id || !userId) return res.status(400).json({ error: 'Missing id or userId' });
      const allowed = {};
      if (patch.outcome !== undefined) allowed.outcome = patch.outcome;
      if (patch.name !== undefined) allowed.name = patch.name;
      if (patch.needsNameConfirmation !== undefined) allowed.needs_name_confirmation = patch.needsNameConfirmation;
      if (patch.nameConfidence !== undefined) allowed.name_confidence = patch.nameConfidence;
      if (patch.gutFeel !== undefined) {
        allowed.initial_gut_feel = patch.gutFeel;
        allowed.gut_feel = {
          value: patch.gutFeel,
          label: patch.gutFeelLabel ?? null,
          momentumHint: patch.gutMomentumHint ?? null
        };
      }
      if (patch.gutFeelLabel !== undefined) allowed.gut_feel_label = patch.gutFeelLabel;
      if (patch.gutMomentumHint !== undefined) allowed.gut_momentum_hint = patch.gutMomentumHint;
      if (patch.outcomeStatus !== undefined) {
        allowed.outcome_status = patch.outcomeStatus;
        allowed.outcome_updated_at = new Date().toISOString();
      }
      if (patch.currentRelationshipSense !== undefined) allowed.current_relationship_sense = patch.currentRelationshipSense;
      if (patch.relationshipMovement !== undefined) allowed.relationship_movement = patch.relationshipMovement;
      if (patch.movementReason !== undefined) allowed.movement_reason = patch.movementReason;
      if (
        patch.currentRelationshipSense !== undefined ||
        patch.relationshipMovement !== undefined ||
        patch.movementReason !== undefined
      ) {
        allowed.relationship_sense_updated_at = new Date().toISOString();
      }
      if (patch.relationshipSenseResult !== undefined) allowed.relationship_sense_result = patch.relationshipSenseResult;
      allowed.updated_at = new Date().toISOString();
      const { error } = await db.from(TABLE).update(allowed).eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[captures] error:', err);
    return res.status(500).json({ error: 'Persistence failed', detail: String(err.message || err) });
  }
}
