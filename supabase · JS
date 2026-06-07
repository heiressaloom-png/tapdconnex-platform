// ============================================================
// Shared Supabase clients (server-side only).
// - adminClient(): uses the SERVICE ROLE key. Never expose to the browser.
//   Bypasses RLS — use only in trusted serverless code.
// - userClient(jwt): uses the anon key + the caller's JWT, so Row Level
//   Security applies. Preferred once Supabase Auth is wired up.
// ============================================================

import { createClient } from '@supabase/supabase-js';

export function adminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export function userClient(jwt) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false },
      global: { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} }
    }
  );
}

export function supabaseConfigured() {
  return !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
}
