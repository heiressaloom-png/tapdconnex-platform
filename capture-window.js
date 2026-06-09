/*
  TAPDconnex Complete Capture Window
  Browser-safe root file.
  Version: 1.4.0

  Complete Capture lets the user fill safe gaps after the conversation.
  It is not a rerecord. It is a relationship-memory completion step.
*/
(function () {
  'use strict';

  const I = window.TAPD_INTELLIGENCE || {};
  const C = window.TAPD_COMPLETENESS || {};
  const VERSION = '1.4.0';
  const DEFAULT_WINDOW_SECONDS = 300;

  const STORAGE_KEY = 'tapd_complete_capture_sessions_v14';

  const PROVENANCE = I.PROVENANCE || Object.freeze({
    CONTACT_STATED: 'CONTACT_STATED',
    USER_SUPPLIED: 'USER_SUPPLIED',
    SYSTEM_DERIVED: 'SYSTEM_DERIVED'
  });

  function nowISO() { return new Date().toISOString(); }

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store || {}));
  }

  function sessionId(prefix) {
    return `${prefix || 'cc'}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  }

  function openCompleteCapture(relationshipId, completeness, options) {
    const opts = options || {};
    const store = readStore();
    const id = sessionId('complete');
    const fields = completeness && completeness.focus && completeness.focus.completeNow || [];

    const session = {
      id,
      relationshipId: relationshipId || null,
      state: 'open',
      openedAt: nowISO(),
      expiresAt: new Date(Date.now() + (opts.windowSeconds || DEFAULT_WINDOW_SECONDS) * 1000).toISOString(),
      fields: fields.map(g => ({
        field: g.field || g.gap,
        recoveryQuestion: g.recoveryQuestion,
        fillability: g.fillability,
        value: null,
        provenance: null
      })),
      principle: 'User-supplied completion can improve completeness, but never inflates intelligence scores.'
    };

    store[id] = session;
    writeStore(store);
    return session;
  }

  function updateCompleteCapture(sessionIdValue, values) {
    const store = readStore();
    const session = store[sessionIdValue];
    if (!session) return null;
    const supplied = values || {};

    session.fields = (session.fields || []).map(item => {
      const nextValue = supplied[item.field];
      if (nextValue == null || nextValue === '') return item;
      return {
        ...item,
        value: nextValue,
        provenance: PROVENANCE.USER_SUPPLIED,
        scoreImpact: 0,
        confidenceImpact: 0,
        updatedAt: nowISO()
      };
    });
    session.updatedAt = nowISO();
    store[sessionIdValue] = session;
    writeStore(store);
    return session;
  }

  function closeCompleteCapture(sessionIdValue, analysis) {
    const store = readStore();
    const session = store[sessionIdValue];
    if (!session) return null;

    session.state = 'closed';
    session.closedAt = nowISO();
    store[sessionIdValue] = session;
    writeStore(store);

    const userFields = {};
    (session.fields || []).forEach(item => {
      if (item.value != null && item.value !== '') userFields[item.field] = item.value;
    });

    const updatedAnalysis = C.applyUserSuppliedCompletion
      ? C.applyUserSuppliedCompletion(analysis || {}, userFields)
      : { ...(analysis || {}), userSuppliedCompletion: userFields };

    return {
      session,
      analysis: updatedAnalysis,
      completionSummary: {
        completedFields: Object.keys(userFields),
        completedCount: Object.keys(userFields).length,
        principle: 'Complete Capture filled memory gaps. It did not change signal strength, confidence, or opportunity status.'
      }
    };
  }

  function abandonCompleteCapture(sessionIdValue) {
    const store = readStore();
    const session = store[sessionIdValue];
    if (!session) return null;
    session.state = 'abandoned';
    session.closedAt = nowISO();
    store[sessionIdValue] = session;
    writeStore(store);
    return session;
  }

  function listCompleteCaptureSessions(relationshipId) {
    const store = readStore();
    return Object.values(store).filter(s => !relationshipId || s.relationshipId === relationshipId);
  }

  window.TAPD_CAPTURE_WINDOW = Object.freeze({
    VERSION,
    DEFAULT_WINDOW_SECONDS,
    openCompleteCapture,
    updateCompleteCapture,
    closeCompleteCapture,
    abandonCompleteCapture,
    listCompleteCaptureSessions
  });
})();
