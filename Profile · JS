// ============================================================
// /api/profile — owner style + plan persistence.
//   GET  /api/profile?userId=...     -> { profile: { data, plan } | null }
//   POST /api/profile                -> upsert { userId, data, plan }
//
// Same MVP auth caveat as /api/captures: keyed by client userId via the
// service-role key. Move to Supabase Auth + RLS before production.
// ============================================================

import { adminClient, supabaseConfigured } from './_supabase.js';

const TABLE = 'profiles';

export default async function handler(req, res) {
  if (!supabaseConfigured()) {
    return res.status(200).json({ status: 'placeholder', message: 'Supabase not configured.' });
  }
  const db = adminClient();

  try {
    if (req.method === 'GET') {
      const userId = req.query.userId;
      if (!userId) return res.status(400).json({ error: 'Missing userId' });
      const { data, error } = await db.from(TABLE).select('data, plan').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return res.status(200).json({ profile: data || null });
    }

    if (req.method === 'POST') {
      const { userId, data, plan } = req.body || {};
      if (!userId) return res.status(400).json({ error: 'Missing userId' });
      const row = {
        user_id: userId,
        data: data ?? {},
        plan: plan || 'starter',
        updated_at: new Date().toISOString()
      };
      const { error } = await db.from(TABLE).upsert(row, { onConflict: 'user_id' });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[profile] error:', err);
    return res.status(500).json({ error: 'Persistence failed', detail: String(err.message || err) });
  }
}
