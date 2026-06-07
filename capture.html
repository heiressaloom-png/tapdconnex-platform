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
