/* ============================================================
 * tapd-sync.js — local-first sync layer for TAPDconnex.
 *
 * The pages keep using localStorage exactly as before (synchronous,
 * always works offline). This module adds OPTIONAL background sync to the
 * Supabase-backed API when it's reachable. Every method is best-effort:
 * if the API is missing, unconfigured, or offline, it silently no-ops.
 * Nothing here ever throws or blocks the UI.
 * ============================================================ */
(function () {
  const USER_KEY = 'tapd_user_id';

  function userId() {
    let id = localStorage.getItem(USER_KEY);
    if (!id) {
      id = (crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'u-' + Date.now() + '-' + Math.random().toString(16).slice(2);
      localStorage.setItem(USER_KEY, id);
    }
    return id;
  }

  // Returns parsed JSON on success, or null if the endpoint is missing/placeholder/offline.
  async function call(method, url, body) {
    try {
      const opts = { method, headers: {} };
      if (body !== undefined) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(url, opts);
      if (!res.ok) return null;
      const json = await res.json();
      if (json && json.status === 'placeholder') return null; // backend not configured yet
      return json;
    } catch (e) {
      return null; // offline / no /api / file:// — fall back to localStorage silently
    }
  }

  const TapdSync = {
    userId,

    // Fire-and-forget: save one capture to the server.
    pushCapture(capture) {
      if (!capture || !capture.id) return;
      call('POST', '/api/captures', { userId: userId(), ...capture });
    },

    // Fire-and-forget: patch outcome / name on the server.
    patchCapture(id, patch) {
      if (!id) return;
      call('PATCH', '/api/captures', { id, userId: userId(), ...patch });
    },

    // Returns an array of server captures, or null if unavailable.
    async pullCaptures() {
      const json = await call('GET', '/api/captures?userId=' + encodeURIComponent(userId()));
      return json && Array.isArray(json.captures) ? json.captures : null;
    },

    // Fire-and-forget: save the profile (owner style + plan).
    pushProfile(data, plan) {
      call('POST', '/api/profile', { userId: userId(), data: data || {}, plan: plan || 'starter' });
    },

    async pullProfile() {
      const json = await call('GET', '/api/profile?userId=' + encodeURIComponent(userId()));
      return json && json.profile ? json.profile : null;
    }
  };

  window.TapdSync = TapdSync;
})();
