/*
  TAPDconnex Relationship Intelligence Framework
  Browser-safe root file for current static build.
  Version: 1.4.0-architecture / v1.3 runtime compatible

  Purpose:
  - Keep intelligence constants, template questions, card states, and feedback learning signals in one safe browser global.
  - Avoid exposing internal scoring logic publicly in UI copy.
  - Preserve the product principle: observe and inform, never force an outcome.
*/
(function () {
  'use strict';

  const VERSION = '1.4.0';

  const TIER = Object.freeze({ STARTER: 'starter', PRO: 'pro' });

  const SIGNAL_CATEGORY = Object.freeze({
    PAIN: 'Pain',
    URGENCY: 'Urgency',
    AUTHORITY: 'Authority',
    RESOURCE: 'Resource',
    ACTION_INTENT: 'Action Intent',
    WARMTH: 'Relationship Warmth',
    STRONG_TEMPLATE_SIGNAL: 'Strong Template Signal'
  });

  const SIGNAL_STATUS = Object.freeze({
    DETECTED: 'Detected',
    WEAK: 'Weak',
    BLOCKED: 'Blocked',
    CONTRADICTED: 'Contradicted',
    NO_SIGNAL: 'No Signal'
  });

  const MOMENTUM = Object.freeze({
    DORMANT: 'Dormant',
    WARM: 'Warm',
    ACTIVE: 'Active',
    ADVANCING: 'Advancing',
    OPPORTUNITY: 'Opportunity',
    BLOCKED: 'Blocked',
    AT_RISK: 'At Risk'
  });

  const CARD_STATE = Object.freeze({
    ACT: 'ACT',
    PROBE: 'PROBE',
    LOG: 'LOG',
    LOW_PRIORITY: 'LOW PRIORITY',
    BLOCKED: 'BLOCKED',
    AT_RISK: 'AT RISK'
  });

  const CARD_THRESHOLDS = Object.freeze({
    STRENGTH_HIGH: 50,
    CONFIDENCE_HIGH: 70,
    OPPORTUNITY_SCORE: 70
  });

  const STRENGTH_BANDS = Object.freeze([
    { band: 'Low', min: 0, max: 24 },
    { band: 'Light', min: 25, max: 49 },
    { band: 'Medium', min: 50, max: 69 },
    { band: 'High', min: 70, max: 84 },
    { band: 'Very High', min: 85, max: 100 }
  ]);

  const NEGATIVE_SIGNAL = Object.freeze({
    NO_PRIORITY: 'No Priority',
    NO_BUDGET: 'No Budget',
    NO_AUTHORITY: 'No Authority',
    NO_NEED: 'No Need',
    TIMING_NOT_NOW: 'Timing Not Now',
    POLITE_INTEREST_ONLY: 'Polite Interest Only'
  });

  const HARD_BLOCKERS = Object.freeze([
    NEGATIVE_SIGNAL.NO_BUDGET,
    NEGATIVE_SIGNAL.NO_AUTHORITY,
    NEGATIVE_SIGNAL.NO_NEED,
    NEGATIVE_SIGNAL.NO_PRIORITY,
    NEGATIVE_SIGNAL.TIMING_NOT_NOW
  ]);

  const MISSING_CONTEXT = Object.freeze({
    DECISION_MAKER: 'Decision maker',
    BUDGET_OWNER: 'Budget owner',
    TIMELINE: 'Timeline',
    SUCCESS_CRITERIA: 'Success criteria',
    PREFERRED_CHANNEL: 'Preferred channel',
    IMPLEMENTATION_OWNER: 'Implementation owner'
  });

  const NEXT_STEP_COMPONENT = Object.freeze({
    OWNER: 'Owner',
    ACTION: 'Action',
    DATE: 'Date',
    CHANNEL: 'Channel'
  });

  const FIELD_FILLABILITY = Object.freeze({
    [NEXT_STEP_COMPONENT.OWNER]: 'self_fillable',
    [NEXT_STEP_COMPONENT.ACTION]: 'self_fillable',
    [NEXT_STEP_COMPONENT.DATE]: 'self_fillable',
    [NEXT_STEP_COMPONENT.CHANNEL]: 'self_fillable',
    [MISSING_CONTEXT.PREFERRED_CHANNEL]: 'self_fillable',
    [MISSING_CONTEXT.TIMELINE]: 'either',
    [MISSING_CONTEXT.SUCCESS_CRITERIA]: 'either',
    [MISSING_CONTEXT.DECISION_MAKER]: 'contact_required',
    [MISSING_CONTEXT.BUDGET_OWNER]: 'contact_required',
    [MISSING_CONTEXT.IMPLEMENTATION_OWNER]: 'contact_required'
  });

  const SIGNAL_FIELD_REQUIREMENTS = Object.freeze({
    [SIGNAL_CATEGORY.ACTION_INTENT]: [NEXT_STEP_COMPONENT.OWNER, NEXT_STEP_COMPONENT.ACTION, NEXT_STEP_COMPONENT.DATE, NEXT_STEP_COMPONENT.CHANNEL],
    [SIGNAL_CATEGORY.AUTHORITY]: [MISSING_CONTEXT.DECISION_MAKER],
    [SIGNAL_CATEGORY.RESOURCE]: [MISSING_CONTEXT.BUDGET_OWNER],
    [SIGNAL_CATEGORY.URGENCY]: [MISSING_CONTEXT.TIMELINE],
    [SIGNAL_CATEGORY.PAIN]: [MISSING_CONTEXT.SUCCESS_CRITERIA],
    [SIGNAL_CATEGORY.WARMTH]: [MISSING_CONTEXT.PREFERRED_CHANNEL]
  });

  const TEMPLATE = Object.freeze({
    OPPORTUNITY: 'Opportunity',
    CONNECTOR: 'Connector',
    STAY_IN_TOUCH: 'Stay in Touch',
    STRATEGIC_PARTNERSHIP: 'Strategic Partnership',
    SPEAKING: 'Speaking Opportunity',
    CAREER: 'Career Opportunity',
    PRODUCT_DISCOVERY: 'Product Discovery',
    PILOT_BETA: 'Pilot / Beta Opportunity',
    ADVISORY: 'Advisory / Mentor',
    COMMUNITY_ACCESS: 'Community Access'
  });

  const STARTER_TEMPLATES = Object.freeze([
    TEMPLATE.OPPORTUNITY,
    TEMPLATE.CONNECTOR,
    TEMPLATE.STAY_IN_TOUCH
  ]);

  const PRO_TEMPLATES = Object.freeze([
    TEMPLATE.STRATEGIC_PARTNERSHIP,
    TEMPLATE.SPEAKING,
    TEMPLATE.CAREER,
    TEMPLATE.PRODUCT_DISCOVERY,
    TEMPLATE.PILOT_BETA,
    TEMPLATE.ADVISORY,
    TEMPLATE.COMMUNITY_ACCESS
  ]);

  const TEMPLATE_QUESTIONS = Object.freeze({
    [TEMPLATE.OPPORTUNITY]: Object.freeze([
      { q: 'What are you focused on at the moment?', tag: 'discriminating' },
      { q: "What's been taking up most of your time recently?", tag: 'discriminating' },
      { q: "What's working well and what's proving challenging?", tag: 'discriminating' },
      { q: "Is there anything you're actively trying to improve?", tag: 'discriminating' },
      { q: 'Have you looked at other ways of solving that?', tag: 'discriminating' },
      { q: 'What would success look like for you?', tag: 'shared', sharedWith: [TEMPLATE.STRATEGIC_PARTNERSHIP, TEMPLATE.CAREER, TEMPLATE.PILOT_BETA] },
      { q: "What's your timeline around this?", tag: 'discriminating' },
      { q: "What's the best next step from here?", tag: 'shared', sharedWith: [TEMPLATE.STRATEGIC_PARTNERSHIP, TEMPLATE.SPEAKING, TEMPLATE.CAREER] }
    ]),
    [TEMPLATE.CONNECTOR]: Object.freeze([
      { q: 'What kind of people do you enjoy connecting?', tag: 'discriminating' },
      { q: 'Who are you currently working with?', tag: 'discriminating' },
      { q: 'What communities are you involved in?', tag: 'shared', sharedWith: [TEMPLATE.COMMUNITY_ACCESS] },
      { q: 'Who should I know in your world?', tag: 'shared', sharedWith: [TEMPLATE.STRATEGIC_PARTNERSHIP] },
      { q: 'Who do you think would benefit from what I do?', tag: 'discriminating' },
      { q: "What's the best way to approach them?", tag: 'discriminating' },
      { q: 'Would you be comfortable introducing us?', tag: 'discriminating' },
      { q: 'What would make that introduction easier?', tag: 'discriminating' }
    ]),
    [TEMPLATE.STAY_IN_TOUCH]: Object.freeze([
      { q: 'What projects are exciting you right now?', tag: 'discriminating' },
      { q: 'Where do you see things heading?', tag: 'discriminating' },
      { q: 'What are you keeping an eye on?', tag: 'discriminating' },
      { q: 'What are you hoping to achieve this year?', tag: 'discriminating' },
      { q: "Is there anything you'd like help with?", tag: 'discriminating' },
      { q: 'How can I support you?', tag: 'discriminating' },
      { q: "What's the best way to stay connected?", tag: 'discriminating' },
      { q: 'When should we reconnect?', tag: 'discriminating' }
    ]),
    [TEMPLATE.STRATEGIC_PARTNERSHIP]: Object.freeze([
      { q: 'What are you building at the moment?', tag: 'discriminating' },
      { q: 'Where do you see opportunities for collaboration?', tag: 'discriminating' },
      { q: 'What strengths does your organisation bring?', tag: 'discriminating' },
      { q: "What's missing today that would help you move faster?", tag: 'discriminating' },
      { q: 'What partnerships have worked well for you before?', tag: 'discriminating' },
      { q: 'What would success look like together?', tag: 'shared', sharedWith: [TEMPLATE.OPPORTUNITY, TEMPLATE.CAREER, TEMPLATE.PILOT_BETA] },
      { q: 'Who else should be involved?', tag: 'shared', sharedWith: [TEMPLATE.CONNECTOR] },
      { q: 'What should we explore next?', tag: 'shared', sharedWith: [TEMPLATE.OPPORTUNITY, TEMPLATE.SPEAKING, TEMPLATE.CAREER] }
    ]),
    [TEMPLATE.SPEAKING]: Object.freeze([
      { q: 'What events are you involved with?', tag: 'discriminating' },
      { q: 'What topics resonate most with your audience?', tag: 'discriminating' },
      { q: 'What challenges are people talking about?', tag: 'discriminating' },
      { q: 'What type of speakers do you usually look for?', tag: 'discriminating' },
      { q: 'What outcomes do you want attendees to leave with?', tag: 'discriminating' },
      { q: 'What events are coming up?', tag: 'discriminating' },
      { q: 'How do you select speakers?', tag: 'discriminating' },
      { q: 'What should happen next?', tag: 'shared', sharedWith: [TEMPLATE.OPPORTUNITY, TEMPLATE.STRATEGIC_PARTNERSHIP, TEMPLATE.CAREER] }
    ]),
    [TEMPLATE.CAREER]: Object.freeze([
      { q: 'What initiatives are you focused on?', tag: 'discriminating' },
      { q: 'What skills are hardest to find right now?', tag: 'discriminating' },
      { q: 'What types of people do well in your environment?', tag: 'discriminating' },
      { q: 'What projects are coming up?', tag: 'discriminating' },
      { q: 'Where are you looking for support?', tag: 'discriminating' },
      { q: 'What experience would be most valuable?', tag: 'discriminating' },
      { q: 'What would success look like?', tag: 'shared', sharedWith: [TEMPLATE.OPPORTUNITY, TEMPLATE.STRATEGIC_PARTNERSHIP, TEMPLATE.PILOT_BETA] },
      { q: "What's the next step?", tag: 'shared', sharedWith: [TEMPLATE.OPPORTUNITY, TEMPLATE.STRATEGIC_PARTNERSHIP, TEMPLATE.SPEAKING] }
    ]),
    [TEMPLATE.PRODUCT_DISCOVERY]: Object.freeze([
      { q: 'How are you currently solving that?', tag: 'discriminating' },
      { q: "What's frustrating about the current approach?", tag: 'discriminating' },
      { q: 'How often does this happen?', tag: 'discriminating' },
      { q: 'What impact does it have?', tag: 'discriminating' },
      { q: 'What have you already tried?', tag: 'discriminating' },
      { q: 'What would an ideal solution look like?', tag: 'discriminating' },
      { q: 'How would you know it worked?', tag: 'discriminating' },
      { q: 'Would you be open to testing something new?', tag: 'blendHinge', sharedWith: [TEMPLATE.PILOT_BETA], blendPath: 'Product Discovery → Pilot/Beta' }
    ]),
    [TEMPLATE.PILOT_BETA]: Object.freeze([
      { q: 'Would you be open to testing something new?', tag: 'blendHinge', sharedWith: [TEMPLATE.PRODUCT_DISCOVERY], blendPath: 'Product Discovery → Pilot/Beta' },
      { q: 'What would make it worth trying?', tag: 'discriminating' },
      { q: 'Who would use it?', tag: 'discriminating' },
      { q: 'What would success look like?', tag: 'shared', sharedWith: [TEMPLATE.OPPORTUNITY, TEMPLATE.STRATEGIC_PARTNERSHIP, TEMPLATE.CAREER] },
      { q: 'What concerns would you have?', tag: 'discriminating' },
      { q: 'What support would you need?', tag: 'discriminating' },
      { q: 'How long would you want to test it?', tag: 'discriminating' },
      { q: 'What would happen if it worked?', tag: 'discriminating' }
    ]),
    [TEMPLATE.ADVISORY]: Object.freeze([
      { q: 'What trends are you seeing?', tag: 'discriminating' },
      { q: 'What lessons have shaped your career?', tag: 'discriminating' },
      { q: 'If you were starting today, what would you do differently?', tag: 'discriminating' },
      { q: "What's a mistake people commonly make?", tag: 'discriminating' },
      { q: 'What opportunities do you think are overlooked?', tag: 'discriminating' },
      { q: 'What would you focus on if you were in my position?', tag: 'discriminating' },
      { q: 'How can I learn more about this area?', tag: 'discriminating' },
      { q: 'Would you be open to continuing the conversation?', tag: 'discriminating' }
    ]),
    [TEMPLATE.COMMUNITY_ACCESS]: Object.freeze([
      { q: 'What communities are you involved in?', tag: 'shared', sharedWith: [TEMPLATE.CONNECTOR] },
      { q: 'What makes that community valuable?', tag: 'discriminating' },
      { q: 'Who tends to thrive there?', tag: 'discriminating' },
      { q: 'How do people usually get involved?', tag: 'discriminating' },
      { q: 'What opportunities come from being part of it?', tag: 'discriminating' },
      { q: 'What do members contribute?', tag: 'discriminating' },
      { q: "Do you think I'd be a good fit?", tag: 'discriminating' },
      { q: 'What would be the best way to get involved?', tag: 'discriminating' }
    ])
  });

  const RECOVERY_QUESTIONS = Object.freeze({
    [MISSING_CONTEXT.DECISION_MAKER]: 'Who else would need to be involved in a decision like this?',
    [MISSING_CONTEXT.BUDGET_OWNER]: 'How are decisions like this usually funded?',
    [MISSING_CONTEXT.TIMELINE]: "What's your timeline around this?",
    [MISSING_CONTEXT.SUCCESS_CRITERIA]: 'What would success look like for you?',
    [MISSING_CONTEXT.PREFERRED_CHANNEL]: "What's the best way to stay in touch?",
    [MISSING_CONTEXT.IMPLEMENTATION_OWNER]: 'Who would actually run this on your side?'
  });

  const PROVENANCE = Object.freeze({
    CONTACT_STATED: 'CONTACT_STATED',
    USER_SUPPLIED: 'USER_SUPPLIED',
    SYSTEM_DERIVED: 'SYSTEM_DERIVED'
  });

  const HUB_ACTION = Object.freeze({
    TAKE_NEXT_STEP: 'take_next_step',
    ASK_CLARIFYING_QUESTION: 'ask_clarifying_question',
    MARK_DONE_OFF_PLATFORM: 'mark_done_off_platform',
    KEEP_ON_RADAR: 'keep_on_radar',
    SNOOZE: 'snooze',
    MOVE_LOW_PRIORITY: 'move_low_priority',
    LET_GO: 'let_go'
  });

  const FEEDBACK_CHIPS = Object.freeze([
    { key: 'wrong_priority', label: 'Wrong priority', learning: 'Possible over-prioritisation for this user/context.' },
    { key: 'missing_context', label: 'Missing context', learning: 'Improve missing-context and completeness prompts for this template.' },
    { key: 'not_an_opportunity', label: 'Not an opportunity', learning: 'Separate warmth/polite interest from true opportunity more carefully.' },
    { key: 'already_handled', label: 'Already handled', learning: 'Improve closure and off-platform handling.' },
    { key: 'wrong_next_step', label: 'Wrong next step', learning: 'Improve next-step extraction and follow-up wording.' },
    { key: 'other', label: 'Other', learning: 'Qualitative review bucket.' }
  ]);

  const LOADING_MESSAGES = Object.freeze([
    'Finding what was actually said...',
    'Checking what needs your attention...',
    'Separating strong signals from polite interest...',
    'Looking for missing next-step details...',
    'Preparing your relationship memory...'
  ]);

  function clampNumber(n, lo, hi) {
    const num = Number.isFinite(Number(n)) ? Number(n) : 0;
    return Math.max(lo, Math.min(hi, num));
  }

  function bandFor(score) {
    const s = clampNumber(score, 0, 100);
    const found = STRENGTH_BANDS.find(b => s >= b.min && s <= b.max);
    return found ? found.band : 'Low';
  }

  function isHardBlocker(value) {
    if (!value) return false;
    if (Array.isArray(value)) return value.some(isHardBlocker);
    const name = typeof value === 'string' ? value : value.name || value.signal || value.type;
    return HARD_BLOCKERS.includes(name);
  }

  function hasSlippedOrAbandonedTask(result) {
    const state = result && result.task && result.task.state;
    return state === 'Slipped' || state === 'Abandoned';
  }

  function resolveCardState(result, tier) {
    const safeTier = tier || (result && result.tier) || TIER.PRO;
    const signalScore = clampNumber(result && result.signalScore, 0, 100);
    const confidence = result && result.confidence;
    const hardBlocked =
      (result && result.signalStatus === SIGNAL_STATUS.BLOCKED) ||
      (result && result.momentum === MOMENTUM.BLOCKED) ||
      hasSlippedOrAbandonedTask(result) ||
      isHardBlocker(result && (result.hardBlockers || result.blockers || result.negativeSignals));

    if (hardBlocked) return CARD_STATE.BLOCKED;
    if (result && (result.momentum === MOMENTUM.AT_RISK || result.task && result.task.state === 'Slipped')) return CARD_STATE.AT_RISK;

    const strengthHigh = signalScore >= CARD_THRESHOLDS.STRENGTH_HIGH;
    if (safeTier === TIER.STARTER || confidence == null) {
      return strengthHigh ? CARD_STATE.ACT : CARD_STATE.LOG;
    }

    const confidenceHigh = clampNumber(confidence, 0, 100) >= CARD_THRESHOLDS.CONFIDENCE_HIGH;
    if (strengthHigh && confidenceHigh) return CARD_STATE.ACT;
    if (strengthHigh && !confidenceHigh) return CARD_STATE.PROBE;
    if (!strengthHigh && confidenceHigh) return CARD_STATE.LOG;
    return CARD_STATE.LOW_PRIORITY;
  }

  function userFacingCardState(state) {
    return state === 'DEPRIORITISE' ? CARD_STATE.LOW_PRIORITY : state;
  }

  function questionText(template) {
    return (TEMPLATE_QUESTIONS[template] || []).map(item => item.q);
  }

  function discriminatingQuestions(template) {
    return (TEMPLATE_QUESTIONS[template] || [])
      .filter(item => item.tag === 'discriminating')
      .map(item => item.q);
  }

  function sharedQuestions(template) {
    return (TEMPLATE_QUESTIONS[template] || [])
      .filter(item => item.tag === 'shared' || item.tag === 'blendHinge')
      .map(item => item.q);
  }

  function questionsByTag(template, tag) {
    return (TEMPLATE_QUESTIONS[template] || []).filter(item => item.tag === tag);
  }

  function getLoadingMessage(index) {
    if (index == null) return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    return LOADING_MESSAGES[Math.abs(Number(index)) % LOADING_MESSAGES.length];
  }

  function buildFeedbackEvent(action, card, feedback) {
    return {
      type: 'relationship_intelligence_feedback',
      action: action || null,
      cardState: card ? resolveCardState(card, card.tier) : null,
      primarySignal: card && card.primarySignal || null,
      primaryTemplate: card && card.primaryTemplate || null,
      signalScore: card && card.signalScore || null,
      confidence: card && card.confidence || null,
      feedback: feedback || null,
      createdAt: new Date().toISOString(),
      rule: 'One action creates a learning signal; it does not rewrite transcript evidence or intelligence scores.'
    };
  }

  function learningHintForFeedback(feedbackKey) {
    const hit = FEEDBACK_CHIPS.find(chip => chip.key === feedbackKey);
    return hit ? hit.learning : null;
  }

  const TAPD_INTELLIGENCE = Object.freeze({
    VERSION,
    TIER,
    SIGNAL_CATEGORY,
    SIGNAL_STATUS,
    MOMENTUM,
    CARD_STATE,
    CARD_THRESHOLDS,
    STRENGTH_BANDS,
    NEGATIVE_SIGNAL,
    HARD_BLOCKERS,
    MISSING_CONTEXT,
    NEXT_STEP_COMPONENT,
    FIELD_FILLABILITY,
    SIGNAL_FIELD_REQUIREMENTS,
    TEMPLATE,
    STARTER_TEMPLATES,
    PRO_TEMPLATES,
    TEMPLATE_QUESTIONS,
    RECOVERY_QUESTIONS,
    PROVENANCE,
    HUB_ACTION,
    FEEDBACK_CHIPS,
    LOADING_MESSAGES,
    bandFor,
    resolveCardState,
    userFacingCardState,
    questionText,
    discriminatingQuestions,
    sharedQuestions,
    questionsByTag,
    getLoadingMessage,
    buildFeedbackEvent,
    learningHintForFeedback
  });

  window.TAPD_INTELLIGENCE = TAPD_INTELLIGENCE;
})();
