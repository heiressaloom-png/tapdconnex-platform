/* TAPDconnex Complete Capture Window
   Orchestrates the Pro 5-minute gap-fill flow.
   Current static version stores appended segments locally and exposes a browser API.
*/
(function(){
  'use strict';
  const F = window.TAPD_INTELLIGENCE || {};
  const C = window.TAPD_COMPLETENESS || {};
  const PROVENANCE = F.PROVENANCE || {CONTACT_STATED:'contact_stated', USER_SUPPLIED:'user_supplied'};
  const TIER = F.TIER || {PRO:'pro'};
  const SECONDS = F.COMPLETION_WINDOW_SECONDS || 300;

  function open(meetingId, completeness, options){
    options = options || {};
    const tier = options.tier || TIER.PRO;
    if (tier !== TIER.PRO) return { eligible:false, reason:'Pro feature' };
    if (!completeness || !completeness.eligibleForCapture) return { eligible:false, reason:'No self-fillable gaps' };
    return {
      eligible:true,
      secondsAllowed:SECONDS,
      targetGaps: completeness.focus ? completeness.focus.completeNow : [],
      mode: pickMode(options.meetingState || {})
    };
  }

  function pickMode(state){
    if (state.live || state.justEnded) return 'extend_merge';
    return 'self_fill';
  }

  function complete(meetingId, segments, beforeCompleteness, options){
    options = options || {};
    const provenance = options.mode === 'extend_merge' ? PROVENANCE.CONTACT_STATED : PROVENANCE.USER_SUPPLIED;
    const stored = readSegments(meetingId);
    const appended = (segments || []).map(seg => ({
      text: typeof seg === 'string' ? seg : (seg.text || ''),
      createdAt: new Date().toISOString(),
      provenance
    })).filter(s => s.text);
    writeSegments(meetingId, stored.concat(appended));
    const afterCompleteness = options.afterCompleteness || beforeCompleteness || {score:0, focus:{carryForward:[]}};
    return {
      before: beforeCompleteness ? beforeCompleteness.score : 0,
      after: afterCompleteness.score,
      gain: afterCompleteness.score - (beforeCompleteness ? beforeCompleteness.score : 0),
      stillOpen: afterCompleteness.focus ? afterCompleteness.focus.carryForward : [],
      provenance,
      appendedCount: appended.length
    };
  }

  function readSegments(meetingId){
    try { return JSON.parse(localStorage.getItem(key(meetingId)) || '[]'); } catch(e) { return []; }
  }
  function writeSegments(meetingId, segments){
    localStorage.setItem(key(meetingId), JSON.stringify(segments || []));
  }
  function key(meetingId){ return 'tapd_complete_capture_segments_' + (meetingId || 'draft'); }

  function provenanceWeight(evidence){
    if (!evidence) return 1;
    if (evidence.provenance === PROVENANCE.USER_SUPPLIED && evidence.aboutContact) return 0;
    return 1;
  }

  window.TAPD_CAPTURE_WINDOW = { open, complete, pickMode, readSegments, writeSegments, provenanceWeight };
})();
