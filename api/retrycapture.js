// ============================================================
// POST /api/retry-capture — one-tap retry for a failed capture.
// Body (JSON): { id, userId }
//
// Idempotent by design: it RESETS the existing capture row (by id) back to
// 'queued', clears the error, and zeroes attempts so the worker/cron will
// pick it up again — then re-kicks the worker. It never creates a new row or
// a duplicate card. The audio is already in storage from the first enqueue.
// ============================================================

import { adminClient, supabaseConfigured } from './_supabase.js';

function baseUrl() {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!supabaseConfigured()) {
    return res.status(200).json({ status: 'placeholder', message: 'Supabase not configured.' });
  }

  const { id, userId } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const db = adminClient();
  try {
    // Reset the existing row so it is eligible again. Scoped by user_id when
    // provided (defence-in-depth), but keyed on the capture id either way.
    let q = db.from('captures').update({
      ai_status: 'queued',
      last_error: null,
      attempts: 0,
      enqueued_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (userId) q = q.eq('user_id', userId);
    const { error } = await q;
    if (error) throw error;

    kick();
    return res.status(200).json({ ok: true, id, aiStatus: 'queued' });
  } catch (err) {
    console.error('[retry-capture] error:', err);
    return res.status(500).json({ error: 'Retry failed', detail: String(err.message || err) });
  }
}

function kick() {
  const base = baseUrl();
  if (!base) return;
  const headers = {};
  if (process.env.CRON_SECRET) headers['Authorization'] = `Bearer ${process.env.CRON_SECRET}`;
  try { fetch(`${base}/api/process-job`, { method: 'POST', headers }).catch(() => {}); } catch (e) {}
}
