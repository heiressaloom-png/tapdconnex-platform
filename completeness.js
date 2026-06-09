/* TAPDconnex Completeness Engine
   Sits on top of Layer 8 Missing Context + Layer 9 Missing Next Steps.
   Computes Engagement Completeness, gaps, Complete Now, Ask Next Time, and Pro eligibility.
*/
(function(){
  'use strict';
  const F = window.TAPD_INTELLIGENCE || {};
  const {
    SIGNAL_CATEGORY = {}, MISSING_CONTEXT = {}, NEXT_STEP_COMPONENT = {}, TIER = {},
    SIGNAL_FIELD_REQUIREMENTS = {}, FIELD_FILLABILITY = {}, TEMPLATE_QUESTIONS = {}
  } = F;

  function computeCompleteness(analysis, options){
    options = options || {};
    const tier = options.tier || TIER.PRO || 'pro';
    const guided = !!options.guided;
    const askedQuestionIndices = options.askedQuestionIndices || [];
    const capturedFields = options.capturedFields || {};
    const categories = new Set((analysis && analysis._presentCategories) || []);

    const required = new Set();
    categories.forEach(cat => (SIGNAL_FIELD_REQUIREMENTS[cat] || []).forEach(f => required.add(f)));

    const gaps = [];
    required.forEach(field => {
      if (capturedFields[field]) return;
      const fillability = FIELD_FILLABILITY[field] || 'either';
      const type = fillability === 'contact' ? 'carry_forward' : 'self_fillable';
      gaps.push({
        field,
        type,
        prompt: guided ? questionForField(field, analysis && analysis.primaryTemplate, askedQuestionIndices) : signalPhrasingForField(field),
        source: guided ? 'template' : 'signal',
        fillability
      });
    });

    const totalFields = required.size || 1;
    const capturedCount = required.size ? totalFields - gaps.length : 1;
    const score = required.size ? Math.round((capturedCount / totalFields) * 100) : 100;
    const completeNow = gaps.filter(g => g.type === 'self_fillable');
    const carryForward = gaps.filter(g => g.type !== 'self_fillable');

    return {
      score,
      capturedCount,
      totalFields,
      gaps,
      focus: { completeNow, carryForward },
      eligibleForCapture: tier === (TIER.PRO || 'pro') && completeNow.length > 0
    };
  }

  function extractCapturedFields(analysis){
    analysis = analysis || {};
    const captured = {};
    const allComponents = Object.values(NEXT_STEP_COMPONENT || {});
    const missingComponents = new Set(analysis.missingComponents || []);
    if (analysis.nextStep) {
      allComponents.forEach(comp => { if (!missingComponents.has(comp)) captured[comp] = true; });
    }
    const allContext = Object.values(MISSING_CONTEXT || {});
    const missingContext = new Set((analysis.missingContext || []).map(x => typeof x === 'string' ? x : x.field));
    allContext.forEach(field => { if (!missingContext.has(field)) captured[field] = true; });
    return captured;
  }

  function questionForField(field, template, askedIdx){
    const qs = TEMPLATE_QUESTIONS[template] || TEMPLATE_QUESTIONS[F.TEMPLATE && F.TEMPLATE.OPPORTUNITY] || [];
    const bridge = {
      [NEXT_STEP_COMPONENT.DATE]:'timeline',
      [NEXT_STEP_COMPONENT.CHANNEL]:'best way',
      [NEXT_STEP_COMPONENT.OWNER]:'next step',
      [MISSING_CONTEXT.TIMELINE]:'timeline',
      [MISSING_CONTEXT.SUCCESS_CRITERIA]:'success',
      [MISSING_CONTEXT.PREFERRED_CHANNEL]:'stay connected',
      [MISSING_CONTEXT.DECISION_MAKER]:'involved',
      [MISSING_CONTEXT.BUDGET_OWNER]:'budget',
      [MISSING_CONTEXT.IMPLEMENTATION_OWNER]:'run this'
    }[field];
    if (bridge) {
      const i = qs.findIndex(q => String(q).toLowerCase().includes(bridge));
      if (i >= 0 && !askedIdx.includes(i)) return qs[i];
    }
    return signalPhrasingForField(field);
  }

  function signalPhrasingForField(field){
    const map = {
      [NEXT_STEP_COMPONENT.OWNER]:'No owner was captured for the agreed action — who is doing it?',
      [NEXT_STEP_COMPONENT.DATE]:'A next step was discussed but no date was captured — by when?',
      [NEXT_STEP_COMPONENT.CHANNEL]:'How will the follow-up happen — email, WhatsApp, call, or intro?',
      [NEXT_STEP_COMPONENT.ACTION]:'A next step was implied, but the action itself is not clear.',
      [MISSING_CONTEXT.TIMELINE]:'Urgency came through, but no concrete timeline was captured.',
      [MISSING_CONTEXT.BUDGET_OWNER]:'Budget or resources were mentioned, but no budget owner was identified.',
      [MISSING_CONTEXT.DECISION_MAKER]:'Authority surfaced, but the decision maker was not named.',
      [MISSING_CONTEXT.SUCCESS_CRITERIA]:'A problem was discussed, but what “success” looks like was not captured.',
      [MISSING_CONTEXT.PREFERRED_CHANNEL]:'No preferred way to stay in touch was captured.',
      [MISSING_CONTEXT.IMPLEMENTATION_OWNER]:'No one was identified to actually run this.'
    };
    return map[field] || `${field} was not captured in this conversation.`;
  }

  window.TAPD_COMPLETENESS = {
    computeCompleteness,
    extractCapturedFields,
    questionForField,
    signalPhrasingForField
  };
})();
