/* TAPDconnex Intelligence Framework — Complete Capture additions v1.3.1
   Non-module browser-friendly constants for current static HTML build.
   Keeps intelligence rules separate from capture.html UI.
*/
(function(){
  'use strict';
  const SIGNAL_CATEGORY = Object.freeze({
    PAIN:'Pain',
    URGENCY:'Urgency',
    AUTHORITY:'Authority',
    RESOURCE:'Resource',
    ACTION_INTENT:'Action Intent',
    WARMTH:'Relationship Warmth'
  });
  const MISSING_CONTEXT = Object.freeze({
    DECISION_MAKER:'Decision maker',
    BUDGET_OWNER:'Budget owner',
    TIMELINE:'Timeline',
    SUCCESS_CRITERIA:'Success criteria',
    PREFERRED_CHANNEL:'Preferred channel',
    IMPLEMENTATION_OWNER:'Implementation owner'
  });
  const NEXT_STEP_COMPONENT = Object.freeze({
    OWNER:'Owner',
    ACTION:'Action',
    DATE:'Date',
    CHANNEL:'Channel'
  });
  const TIER = Object.freeze({STARTER:'starter', PRO:'pro'});
  const PROVENANCE = Object.freeze({
    CONTACT_STATED:'contact_stated',
    USER_SUPPLIED:'user_supplied'
  });
  const COMPLETION_WINDOW_SECONDS = 300;

  const SIGNAL_FIELD_REQUIREMENTS = Object.freeze({
    [SIGNAL_CATEGORY.ACTION_INTENT]: [NEXT_STEP_COMPONENT.OWNER, NEXT_STEP_COMPONENT.DATE, NEXT_STEP_COMPONENT.CHANNEL],
    [SIGNAL_CATEGORY.RESOURCE]: [MISSING_CONTEXT.BUDGET_OWNER],
    [SIGNAL_CATEGORY.AUTHORITY]: [MISSING_CONTEXT.DECISION_MAKER],
    [SIGNAL_CATEGORY.URGENCY]: [MISSING_CONTEXT.TIMELINE],
    [SIGNAL_CATEGORY.PAIN]: [MISSING_CONTEXT.SUCCESS_CRITERIA],
    [SIGNAL_CATEGORY.WARMTH]: [MISSING_CONTEXT.PREFERRED_CHANNEL]
  });

  const FIELD_FILLABILITY = Object.freeze({
    [NEXT_STEP_COMPONENT.OWNER]:'self',
    [NEXT_STEP_COMPONENT.ACTION]:'self',
    [NEXT_STEP_COMPONENT.DATE]:'self',
    [NEXT_STEP_COMPONENT.CHANNEL]:'self',
    [MISSING_CONTEXT.PREFERRED_CHANNEL]:'self',
    [MISSING_CONTEXT.BUDGET_OWNER]:'contact',
    [MISSING_CONTEXT.DECISION_MAKER]:'contact',
    [MISSING_CONTEXT.IMPLEMENTATION_OWNER]:'contact',
    [MISSING_CONTEXT.TIMELINE]:'either',
    [MISSING_CONTEXT.SUCCESS_CRITERIA]:'either'
  });

  const TEMPLATE = Object.freeze({
    OPPORTUNITY:'opportunity',
    CONNECTOR:'connector',
    STAY_IN_TOUCH:'stay_in_touch',
    STRATEGIC_PARTNERSHIP:'strategic_partnership',
    SPEAKING:'speaking',
    CAREER:'career',
    PRODUCT_DISCOVERY:'product_discovery',
    PILOT_BETA:'pilot_beta',
    ADVISORY:'advisory',
    COMMUNITY_ACCESS:'community_access'
  });

  const TEMPLATE_QUESTIONS = Object.freeze({
    [TEMPLATE.OPPORTUNITY]: [
      'What are you focused on at the moment?',
      'What has been taking up most of your time recently?',
      'What is working well and what is proving challenging?',
      'Is there anything you are actively trying to improve?',
      'Have you looked at other ways of solving that?',
      'What would success look like for you?',
      'What is your timeline around this?',
      'What is the best next step from here?'
    ],
    [TEMPLATE.CONNECTOR]: [
      'What kind of people do you enjoy connecting?',
      'Who are you currently working with?',
      'What communities are you involved in?',
      'Who should I know in your world?',
      'Who do you think would benefit from what I do?',
      'What is the best way to approach them?',
      'Would you be comfortable introducing us?',
      'What would make that introduction easier?'
    ],
    [TEMPLATE.STAY_IN_TOUCH]: [
      'What projects are exciting you right now?',
      'Where do you see things heading?',
      'What are you keeping an eye on?',
      'What are you hoping to achieve this year?',
      'Is there anything you would like help with?',
      'How can I support you?',
      'What is the best way to stay connected?',
      'When should we reconnect?'
    ],
    [TEMPLATE.PILOT_BETA]: [
      'Would you be open to testing something new?',
      'What would make it worth trying?',
      'Who would use it?',
      'What would success look like?',
      'What concerns would you have?',
      'What support would you need?',
      'How long would you want to test it?',
      'What would happen if it worked?'
    ]
  });

  window.TAPD_INTELLIGENCE = Object.assign({}, window.TAPD_INTELLIGENCE || {}, {
    version:'1.3.1-complete-capture',
    SIGNAL_CATEGORY,
    MISSING_CONTEXT,
    NEXT_STEP_COMPONENT,
    TIER,
    PROVENANCE,
    TEMPLATE,
    TEMPLATE_QUESTIONS,
    SIGNAL_FIELD_REQUIREMENTS,
    FIELD_FILLABILITY,
    COMPLETION_WINDOW_SECONDS
  });
})();
