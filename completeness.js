/*
  TAPDconnex Completeness Engine
  Browser-safe root file.
  Version: 1.4.0

  Purpose:
  - Identify what is captured, what is missing, what can be completed now, and what should be asked next time.
  - User-supplied data may improve completeness, but must never inflate score, confidence, authority, urgency, resource, or opportunity strength.
*/
(function () {
  'use strict';

  const I = window.TAPD_INTELLIGENCE || {};

  const PROVENANCE = I.PROVENANCE || Object.freeze({
    CONTACT_STATED: 'CONTACT_STATED',
    USER_SUPPLIED: 'USER_SUPPLIED',
    SYSTEM_DERIVED: 'SYSTEM_DERIVED'
  });

  const COMPLETENESS_VERSION = '1.4.0';

  const DEFAULT_FIELD_RECOVERY = Object.freeze({
    Owner: 'Who owns this next step?',
    Action: 'What exactly needs to happen next?',
    Date: 'When should this happen?',
    Channel: 'Where should this happen — email, LinkedIn, call, or another channel?',
    'Decision maker': 'Who else would need to be involved in a decision like this?',
    'Budget owner': 'How are decisions like this usually funded?',
    Timeline: "What's your timeline around this?",
    'Success criteria': 'What would success look like for you?',
    'Preferred channel': "What's the best way to stay in touch?",
    'Implementation owner': 'Who would actually run this on your side?'
  });

  function unique(arr) {
    return Array.from(new Set((arr || []).filter(Boolean)));
  }

  function normaliseFieldName(field) {
    if (!field) return null;
    const s = String(field).trim();
    const map = {
      owner: 'Owner',
      action: 'Action',
      date: 'Date',
      channel: 'Channel',
      decisionMaker: 'Decision maker',
      decision_maker: 'Decision maker',
      budgetOwner: 'Budget owner',
      budget_owner: 'Budget owner',
      timeline: 'Timeline',
      successCriteria: 'Success criteria',
      success_criteria: 'Success criteria',
      preferredChannel: 'Preferred channel',
      preferred_channel: 'Preferred channel',
      implementationOwner: 'Implementation owner',
      implementation_owner: 'Implementation owner'
    };
    return map[s] || s;
  }

  function requiredFieldsFromSignals(analysis) {
    const req = [];
    const categories = unique([
      analysis && analysis.primarySignalCategory,
      ...(analysis && analysis.signalCategories || []),
      ...(analysis && analysis.detectedCategories || []),
      ...((analysis && analysis.signals || []).map(s => s.category))
    ]);

    const requirements = I.SIGNAL_FIELD_REQUIREMENTS || {};
    categories.forEach(cat => {
      (requirements[cat] || []).forEach(field => req.push(field));
    });

    if (analysis && analysis.nextStep) {
      ['Owner', 'Action', 'Date', 'Channel'].forEach(field => req.push(field));
    }

    return unique(req.map(normaliseFieldName));
  }

  function missingFieldsFromAnalysis(analysis) {
    const missing = [];
    (analysis && analysis.missingComponents || []).forEach(f => missing.push(normaliseFieldName(f)));
    (analysis && analysis.missingContext || []).forEach(f => missing.push(normaliseFieldName(f)));
    (analysis && analysis.completenessData && analysis.completenessData.gaps || []).forEach(g => missing.push(normaliseFieldName(g.field || g.gap || g)));
    return unique(missing);
  }

  function capturedFieldsFromAnalysis(analysis) {
    const captured = new Set();
    const task = analysis && analysis.task;
    if (task) {
      if (task.owner || task.closureOwner) captured.add('Owner');
      if (task.action || analysis.nextStep) captured.add('Action');
      if (task.date) captured.add('Date');
      if (task.channel) captured.add('Channel');
    }
    if (analysis && analysis.nextStep) captured.add('Action');

    const explicit = analysis && (analysis.capturedFields || analysis.presentContext || analysis.contextCaptured);
    if (Array.isArray(explicit)) {
      explicit.forEach(f => captured.add(normaliseFieldName(f)));
    } else if (explicit && typeof explicit === 'object') {
      Object.entries(explicit).forEach(([k, v]) => {
        if (v) captured.add(normaliseFieldName(k));
      });
    }

    return Array.from(captured).filter(Boolean);
  }

  function recoveryQuestionFor(field, template) {
    const normal = normaliseFieldName(field);
    const templateQuestions = I.TEMPLATE_QUESTIONS && I.TEMPLATE_QUESTIONS[template] || [];
    const bridge = {
      'Success criteria': 'success',
      Timeline: 'timeline',
      'Preferred channel': 'stay',
      'Decision maker': 'involved',
      'Budget owner': 'fund',
      'Implementation owner': 'run'
    }[normal];

    if (bridge && templateQuestions.length) {
      const preferred = templateQuestions.find(item =>
        item.tag === 'discriminating' && item.q && item.q.toLowerCase().includes(bridge)
      ) || templateQuestions.find(item => item.q && item.q.toLowerCase().includes(bridge));
      if (preferred) return preferred.q;
    }

    return (I.RECOVERY_QUESTIONS && I.RECOVERY_QUESTIONS[normal]) || DEFAULT_FIELD_RECOVERY[normal] || `Can you clarify ${String(normal).toLowerCase()}?`;
  }

  function fillabilityFor(field) {
    const normal = normaliseFieldName(field);
    const fill = I.FIELD_FILLABILITY || {};
    return fill[normal] || 'contact_required';
  }

  function splitFocus(gaps) {
    const completeNow = [];
    const askNextTime = [];
    gaps.forEach(gap => {
      if (gap.fillability === 'self_fillable' || gap.fillability === 'either') completeNow.push(gap);
      else askNextTime.push(gap);
    });
    return { completeNow, askNextTime };
  }

  function computeCompleteness(analysis, options) {
    const opts = options || {};
    const template = opts.template || (analysis && analysis.primaryTemplate) || null;
    const tier = opts.tier || (analysis && analysis.tier) || (I.TIER && I.TIER.PRO) || 'pro';

    const required = requiredFieldsFromSignals(analysis);
    const missing = missingFieldsFromAnalysis(analysis);
    const captured = capturedFieldsFromAnalysis(analysis);

    // If a field is explicitly missing, it is not captured even if heuristics guessed it.
    const capturedSet = new Set(captured.filter(f => !missing.includes(f)));
    const requiredSet = new Set(required);
    missing.forEach(f => requiredSet.add(f));

    const allRequired = Array.from(requiredSet);
    const gaps = allRequired
      .filter(field => !capturedSet.has(field) || missing.includes(field))
      .map(field => ({
        field,
        gap: field,
        fillability: fillabilityFor(field),
        recoveryQuestion: recoveryQuestionFor(field, template),
        advisory: true
      }));

    const total = allRequired.length;
    const capturedCount = total === 0 ? 0 : Math.max(0, total - gaps.length);
    const score = total === 0 ? 100 : Math.round((capturedCount / total) * 100);
    const focus = splitFocus(gaps);

    return {
      version: COMPLETENESS_VERSION,
      score,
      capturedCount,
      totalFields: total,
      requiredFields: allRequired,
      capturedFields: Array.from(capturedSet),
      gaps,
      focus,
      eligibleForCompleteCapture: tier === 'pro' && focus.completeNow.length > 0,
      principle: 'Completeness may improve relationship memory; it never inflates signal score, confidence, authority, urgency, resource, or opportunity strength.'
    };
  }

  function applyUserSuppliedCompletion(analysis, userFields) {
    const fields = userFields || {};
    const completed = Object.entries(fields).map(([key, value]) => ({
      field: normaliseFieldName(key),
      value,
      provenance: PROVENANCE.USER_SUPPLIED,
      scoreImpact: 0,
      confidenceImpact: 0
    }));

    return {
      ...(analysis || {}),
      userSuppliedCompletion: completed,
      completenessData: computeCompleteness({ ...(analysis || {}), capturedFields: [
        ...capturedFieldsFromAnalysis(analysis || {}),
        ...completed.map(item => item.field)
      ] }, { template: analysis && analysis.primaryTemplate, tier: analysis && analysis.tier })
    };
  }

  window.TAPD_COMPLETENESS = Object.freeze({
    VERSION: COMPLETENESS_VERSION,
    computeCompleteness,
    applyUserSuppliedCompletion,
    requiredFieldsFromSignals,
    capturedFieldsFromAnalysis,
    missingFieldsFromAnalysis,
    recoveryQuestionFor,
    fillabilityFor
  });
})();
