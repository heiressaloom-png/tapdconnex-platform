// ============================================================
// api/_analyzer.js — TAPDconnex deterministic relationship analyzer (v2.2)
//
// Engine scores. Reads describe. Labels guide attention. This module is PURE
// and DETERMINISTIC: no LLM, no network, no I/O. It consumes the LLM's
// structured evidence (tolerant of v2.2 / v2.1 / legacy shapes) and produces
// gated scores, bands, a behavioral read, and DETERMINISTIC attention labels.
// Its values WIN for anything that drives attention/priority.
//
// Anti-inflation is enforced HERE, not just asked of the prompt:
//   - warmth is low-weight and cannot manufacture commitment
//   - interest cannot become momentum without a state change
//   - opportunity readiness is capped by commitment
//   - positive-language-only evidence yields low confidence
//
// Fail-open: callers wrap analyze() in try/catch; on any error they fall back
// to the LLM-provided values (today's behaviour).
// ============================================================

export const BEH = {
  ACTIVE: 'Active Pursuit',
  MUTUAL: 'Mutual Exploration',
  POLITE: 'Polite Openness',
  FUTURE: 'Future Deferral',
  PATHWAY: 'Deferred with Pathway',
  LOW: 'Low Engagement',
  STALLED: 'Stalled / Contradicted'
};

const NEG = ['', 'unknown', 'none', 'n/a', 'na', 'unclear', 'not stated',
  'not mentioned', 'not provided', 'tbd', 'unspecified', 'null', 'no', 'false'];

function present(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.filter(present).length > 0;
  if (typeof v === 'object') {
    if ('present' in v) return v.present === true || present(v.present);
    return Object.keys(v).length > 0;
  }
  const s = String(v).trim().toLowerCase();
  return s !== '' && NEG.indexOf(s) < 0;
}

// Map a verdict/level (string, number 0-1/0-100, or family object) to 0..1.
function lvl(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return Math.max(0, Math.min(1, v > 1 ? v / 100 : v));
  if (typeof v === 'object') {
    if (typeof v.strength === 'number') return lvl(v.strength);
    if (v.strength) return lvl(v.strength);
    if (typeof v.score === 'number') return lvl(v.score);
    if (v.level) return lvl(v.level);
    if ('present' in v) return v.present ? 0.6 : 0;
    return present(v) ? 0.5 : 0;
  }
  const s = String(v).toLowerCase();
  if (/\bhigh\b|strong|active|reciprocal|\bdirect\b|\byes\b|true/.test(s)) return 1;
  if (/medium|moderate|some|forming|possible|partial|indirect|maybe/.test(s)) return 0.5;
  if (/\blow\b|weak|none|future|unclear|unknown|\bno\b/.test(s)) return 0.15;
  return present(v) ? 0.5 : 0;
}

const FUTURE_RE = /next quarter|later this year|when things settle|at some point|some\s?time|someday|eventually|after .*(review|budget)|come back after|q[1-4]\b|october|november|december|next year/i;
const VAGUE_NEXT_RE = /send me something|send something|let'?s connect|keep in touch|stay in touch|we should connect|reach out sometime|send it through/i;

// Read a Human Read sub-object tolerating v2.2 (snake) / legacy (camel) shapes.
function getRead(I, snake, camel) {
  const h = I.human_reads || I.humanReads || {};
  return h[snake] || h[camel] || {};
}

export function analyze(ai, profileFocus) {
  ai = ai || {};
  const I = ai.intelligence || {};
  const beh = I.behavioral_intelligence || {};
  const ctx = I.context_intelligence || {};
  const opp = I.opportunity_intelligence || {};
  const rel = I.relationship_intelligence || {};
  const link = I.profile_linkage_intelligence || {};
  const mem = I.memory_intelligence || {};
  const fu = I.follow_up_intelligence || {};
  const cap = I.capture_intelligence || {};
  const ledgerIn = Array.isArray(I.commitment_ledger) ? I.commitment_ledger : [];
  const person = cap.person || ai.person || {};

  const goalRel = getRead(I, 'goal_relevance_read', 'goalRelevanceRead');
  const recovery = getRead(I, 'recovery_read', 'recoveryRead');
  const opening = getRead(I, 'opening_read', 'openingRead');

  // ---- identity / contactability ----
  const nameConf = String(person.name_confidence
    || (ai.verification && ai.verification.needsNameConfirmation ? 'low' : '') || '').toLowerCase();
  const hasName = present(person.name) && ['low', 'none', 'unknown'].indexOf(nameConf) < 0;
  const hasCompany = present(person.company);
  const hasChannel = present(ctx.preferred_channel) || present(fu.channel)
    || present(I.relationship_hub_record && I.relationship_hub_record.contact_path);

  // ---- evidence flags ----
  const timelineStr = String(ctx.timeline || '').toLowerCase();
  const futureWords = FUTURE_RE.test([ctx.timeline, cap.raw_next_step_language, fu.follow_up_timing].join(' '));
  const hasTimeline = present(ctx.timeline) && !FUTURE_RE.test(timelineStr);
  const hasOwner = present(ctx.next_step_owner) || present(ctx.decision_maker)
    || ledgerIn.some(c => present(c.owned_by_name)) || lvl(beh.ownership) >= 0.6;
  const namedRecipient = ledgerIn.some(c => present(c.recipient_or_destination)) || present(ctx.decision_maker);
  const hasAccess = lvl(beh.access) >= 0.5 || present(opp.audience_access)
    || present(opp.community_access) || present(opp.distribution_potential) || namedRecipient;
  const rawNext = String(cap.raw_next_step_language || '');
  const hasSpecificNextStep = present(fu.recommended_next_step)
    || (present(rawNext) && !VAGUE_NEXT_RE.test(rawNext));
  const ledgerInvest = ledgerIn.reduce((m, c) =>
    Math.max(m, ({ high: 1, medium: 0.6, low: 0.2 }[String(c.commitment_strength || '').toLowerCase()] || 0)), 0);
  const investment = Math.max(lvl(beh.investment), ledgerInvest);
  const reciprocity = lvl(beh.reciprocity);
  const warmth = Math.max(lvl(rel.warmth_level), lvl(beh.connection));
  const specificity = hasSpecificNextStep ? 1 : lvl(beh.specificity);
  const vagueness = lvl(beh.vagueness);
  const deflection = lvl(beh.deflection);
  const followThroughEv = lvl(beh.follow_through);
  const contradiction = lvl(beh.contradiction) >= 0.5
    || ledgerIn.some(c => String(c.status || '').toLowerCase() === 'broken');

  // ---- commitment score (weighted; warmth low) ----
  const followThrough = followThroughEv >= 0.5 ? 1
    : (hasOwner && hasTimeline && hasSpecificNextStep) ? 1
      : (hasTimeline && hasSpecificNextStep) ? 0.5 : 0;
  let commitment = Math.round(
    25 * followThrough +
    20 * specificity +
    20 * investment +
    15 * (hasOwner ? 1 : 0) +
    10 * (hasAccess ? 1 : 0) +
    5 * reciprocity +
    5 * warmth
  );
  const qualifying = hasOwner || hasTimeline || hasAccess || hasSpecificNextStep || investment >= 0.5;
  if (!qualifying) commitment = Math.min(commitment, 25);     // GATE: warmth alone can't manufacture commitment
  if (contradiction) commitment = Math.min(commitment, 30);
  commitment = Math.max(0, Math.min(100, commitment));

  // ---- momentum (state change) ----
  let momentum_level = 'low';
  if (!contradiction) {
    if (commitment >= 55 && hasOwner && (hasTimeline || hasAccess)) momentum_level = 'high';
    else if (commitment >= 35 || hasSpecificNextStep || hasAccess) momentum_level = 'medium';
  }
  if (futureWords && !hasTimeline) momentum_level = 'low';

  // ---- behavioral read ----
  const pathway = futureWords && hasOwner;
  let behavioral_read = BEH.LOW;
  if (contradiction) behavioral_read = BEH.STALLED;
  else if (commitment >= 55 && hasOwner && hasSpecificNextStep && (hasTimeline || hasAccess)) behavioral_read = BEH.ACTIVE;
  else if (reciprocity >= 0.5 && specificity >= 0.5 && commitment >= 30) behavioral_read = BEH.MUTUAL;
  else if (pathway) behavioral_read = BEH.PATHWAY;
  else if (futureWords) behavioral_read = BEH.FUTURE;
  else if (warmth >= 0.5 && commitment < 30) behavioral_read = BEH.POLITE;

  // ---- opportunity readiness (capped by commitment) ----
  const oppType = present(opp.opportunity_type) || present(opp.partnership_potential)
    || present(opp.buying_intent) || present(opp.hiring_intent) || present(opp.referral_potential)
    || present(opp.funding_or_sponsorship_potential);
  let opportunity_readiness = 'none';
  if (oppType) {
    if (behavioral_read === BEH.PATHWAY || (futureWords && !hasTimeline)) opportunity_readiness = 'future';
    else if (commitment >= 55) opportunity_readiness = 'active';
    else if (commitment >= 30) opportunity_readiness = 'forming';
    else opportunity_readiness = 'weak';
  }

  // ---- alignment (profile linkage + goal relevance read) ----
  const alignedFocus = String(goalRel.alignedToCurrentFocus || '').toLowerCase();
  const goalAligned = alignedFocus === 'yes' || alignedFocus === 'partial'
    || lvl(link.alignment_strength) >= 0.5 || lvl(link.linkage_type) >= 0.5;
  const alignment = Math.max(lvl(link.alignment_strength), lvl(link.linkage_type),
    alignedFocus === 'yes' ? 1 : alignedFocus === 'partial' ? 0.5 : 0);

  // ---- relationship priority ----
  let relationship_priority = 'medium';
  if ((behavioral_read === BEH.ACTIVE || opportunity_readiness === 'active') && alignment >= 0.5) relationship_priority = 'high';
  else if (behavioral_read === BEH.POLITE || behavioral_read === BEH.LOW || behavioral_read === BEH.STALLED || alignment < 0.3) relationship_priority = 'low';
  const priority_band = relationship_priority === 'high' ? 'act-soon'
    : relationship_priority === 'low' ? 'keep-warm' : 'worth-exploring';

  // ---- confidence ----
  let confidence = 'low';
  if (hasOwner && hasTimeline) confidence = 'high';
  else if (hasSpecificNextStep || hasAccess || investment >= 0.5) confidence = 'medium';

  // ---- safe to send ----
  const safe_to_send = hasName && (hasChannel || hasCompany) && !contradiction && behavioral_read !== BEH.LOW;

  // ---- recovery / goal evidence ----
  const regretRisk = String(recovery.regretRisk || '').toLowerCase();
  const recoveryNeeded = (regretRisk === 'high' || regretRisk === 'medium') && present(recovery.bestRecoveryMove);
  const goalAlignedLabel = goalAligned && (commitment >= 35
    || opportunity_readiness === 'active' || opportunity_readiness === 'forming');
  const openLevel = String(opening.level || '').toLowerCase();
  const strongOpening = ['world_entry', 'trusted', 'collaborative'].indexOf(openLevel) >= 0;

  // ---- deterministic attention labels (ordered: blocking, missing, opp/goal, caution, hook, ready) ----
  const labels = [];
  const add = (label, type, priority, reason, suggestedAction) =>
    labels.push({ label, type, priority, reason, suggestedAction });

  if (!hasName) add('Needs name', 'blocking', 'high', 'No reliable name captured.', 'Confirm their name before reaching out.');
  if (!hasChannel) add('Needs contact path', 'blocking', 'high', 'No contact channel captured.', 'Capture an email, WhatsApp, or LinkedIn.');
  if (!hasOwner) add('Clarify decision owner', 'missing_context', 'medium', 'No next-step owner is clear.', 'Find out who owns the next move.');
  if (!hasTimeline) add('Clarify timeline', 'missing_context', 'medium', 'No concrete timeline.', 'Ask when this would happen.');
  if (oppType && !present(ctx.budget_or_resource_context)) add('Clarify budget/resource', 'missing_context', 'low', 'Opportunity present but no budget/resource context.', 'Probe budget or resourcing gently.');
  if (goalAlignedLabel) add('Goal aligned', 'opportunity', 'high', 'Connects to your current focus with real conversation evidence.', goalRel.energyRecommendation === 'act_now' ? 'Act on this while it is warm.' : 'Follow up thoughtfully toward your focus.');
  if (strongOpening) add('Strong opening', 'opportunity', 'medium', 'They let you into their world.', 'Build on the access they offered.');
  if (recoveryNeeded) add('Recovery needed', 'caution', regretRisk === 'high' ? 'high' : 'medium', recovery.whatCouldBeLost || 'Something worth clarifying while it is warm.', recovery.bestRecoveryMove || 'Ask the clarifying question soon.');
  if (warmth >= 0.5 && commitment < 30 && (vagueness >= 0.3 || deflection >= 0.4)) add('Warm but vague', 'caution', 'medium', 'Warm, but no concrete next step yet.', 'Keep it human; do not over-read the warmth.');

  // energy verdict (mutually exclusive)
  const doNotChase = contradiction || commitment < 30 || deflection >= 0.6 || (momentum_level === 'low' && commitment < 35);
  if (doNotChase) add('Do not chase yet', 'caution', 'high', 'Low commitment / weak movement.', 'Keep it warm; wait for a clearer signal before investing.');
  else if (commitment >= 35 || opportunity_readiness === 'active' || opportunity_readiness === 'forming') add('Follow up while warm', 'action', 'high', 'Real movement — act before it cools.', 'Send the follow-up now while it is fresh.');

  if (present(mem.personal_hooks)) add('Personal hook captured', 'human_hook', 'low', 'A personal detail to remember them by.', 'Reference it to make the follow-up human.');
  if (present(mem.open_threads)) add('Open thread', 'human_hook', 'low', 'An unfinished thread to re-enter on.', 'Pick the thread back up.');
  if (!doNotChase && safe_to_send && hasName && hasChannel) add('Ready to send', 'ready', 'high', 'Enough context to send.', 'Send the draft.');

  // ---- completeness (prefer LLM evaluator; normalize to v2.2 status) ----
  const ci = I.completeness_intelligence || {};
  const overall = (typeof ci.overall_score === 'number')
    ? Math.max(0, Math.min(100, Math.round(ci.overall_score))) : null;
  let cstatus = null;
  if (overall != null) {
    cstatus = overall >= 65 ? 'ready' : overall >= 45 ? 'needs_context'
      : overall >= 25 ? 'thin' : 'blocked';
  }
  const completeness = { overall_score: overall, status: cstatus };

  // ---- human read summary (analyzer selects; never writes) ----
  const intel = getRead(I, 'intelligence_read', 'intelligenceRead');
  const anchor = getRead(I, 'anchor_read', 'anchorRead');
  const human_read_summary = goalRel.relevanceSummary || intel.whatUserMightMiss || intel.why
    || anchor.whatTheyCaredAbout || (I.human_reads && I.human_reads.what_mattered)
    || (ai.relationshipRead && ai.relationshipRead.summary)
    || (ai.draft && ai.draft.context) || '';

  // ---- commitment ledger (pass through / normalize; MVP1 create-store only) ----
  const commitment_ledger = ledgerIn.map((c, i) => ({
    commitment_id: c.commitment_id || ('c' + (i + 1)),
    commitment_text: c.commitment_text || '',
    owner: c.owner || 'unknown',
    owned_by_name: c.owned_by_name || '',
    due_date_or_timing: c.due_date_or_timing || '',
    recipient_or_destination: c.recipient_or_destination || '',
    purpose: c.purpose || '',
    evidence_required_for_completion: c.evidence_required_for_completion || '',
    commitment_strength: (c.commitment_strength || 'low').toLowerCase(),
    status: (c.status || 'pending').toLowerCase()
  }));

  return {
    scores: {
      commitment,
      momentum: momentum_level,
      opportunity_readiness,
      alignment: Math.round(alignment * 100),
      deflection: Math.round(deflection * 100),
      confidence
    },
    momentum_level,
    behavioral_read,
    opportunity_readiness,
    relationship_priority,
    priority_band,
    attention_labels: labels,
    completeness,
    safe_to_send,
    human_read_summary,
    commitment_ledger,
    outcome_ledger: [],
    evidence: {
      hasName, hasCompany, hasChannel, hasOwner, hasTimeline, hasAccess,
      hasSpecificNextStep, investment, reciprocity, warmth, specificity,
      vagueness, deflection, contradiction, futureWords, alignment, qualifying,
      goalAligned: goalAlignedLabel, recoveryNeeded, strongOpening
    }
  };
}

export default { analyze, BEH };
