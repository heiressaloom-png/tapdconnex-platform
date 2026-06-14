import { analyze, BEH } from '../api/_analyzer.js';
let pass=0, fail=0;
const ok=(l,c)=>{(c?pass++:fail++);console.log((c?'✅':'❌')+' '+l);};
const I = o => ({ intelligence: o });
const hasLabel = (r, name) => r.attention_labels.some(x=>x.label===name);

// 1. Polite but vague
let r = analyze(I({ behavioral_intelligence:{connection:'medium',commitment:'low',vagueness:'high',deflection:'high'},
  context_intelligence:{}, capture_intelligence:{raw_next_step_language:'send me something', person:{name:'Sam',name_confidence:'high',company:'X'}},
  opportunity_intelligence:{}, relationship_intelligence:{warmth_level:'medium'}, follow_up_intelligence:{follow_up_timing:'maybe next quarter', channel:'email'} }));
ok('1 polite/vague: commitment low', r.scores.commitment<30);
ok('1 polite/vague: momentum low', r.momentum_level==='low');
ok('1 polite/vague: read polite/future', [BEH.POLITE,BEH.FUTURE].includes(r.behavioral_read));
ok('1 polite/vague: opportunity not overstated', ['none','weak'].includes(r.opportunity_readiness));

// 2. Reserved but committed
r = analyze(I({ behavioral_intelligence:{commitment:'high',access:'high',investment:'high',specificity:'high'},
  context_intelligence:{timeline:'this Friday',next_step_owner:'contact',preferred_channel:'email'},
  capture_intelligence:{raw_next_step_language:'send it by Friday', person:{name:'Pat',company:'Acme',name_confidence:'high'}},
  opportunity_intelligence:{opportunity_type:'hiring',hiring_intent:'present'},
  follow_up_intelligence:{recommended_next_step:'Send the deck by Friday',channel:'email'},
  commitment_ledger:[{commitment_text:'forward to Sarah in HR',owned_by_name:'Sarah',due_date_or_timing:'next week',commitment_strength:'high',recipient_or_destination:'Sarah HR'}],
  relationship_intelligence:{warmth_level:'medium'} }));
ok('2 reserved/committed: commitment high', r.scores.commitment>=55);
ok('2 reserved/committed: momentum high', r.momentum_level==='high');
ok('2 reserved/committed: read Active Pursuit', r.behavioral_read===BEH.ACTIVE);
ok('2 reserved/committed: opportunity active', r.opportunity_readiness==='active');

// 3. Friendly but no movement
r = analyze(I({ behavioral_intelligence:{connection:'high',commitment:'low'}, context_intelligence:{},
  capture_intelligence:{raw_next_step_language:"let's keep in touch", person:{name:'Jo',company:'Y',name_confidence:'high'}},
  opportunity_intelligence:{}, relationship_intelligence:{warmth_level:'high'}, follow_up_intelligence:{channel:'email'} }));
ok('3 friendly: opportunity not overstated', ['none','weak'].includes(r.opportunity_readiness));
ok('3 friendly: read Polite Openness', r.behavioral_read===BEH.POLITE);

// 4. Future deferral with pathway
r = analyze(I({ behavioral_intelligence:{commitment:'low'},
  context_intelligence:{timeline:'after the October budget review', next_step_owner:'Sarah'},
  capture_intelligence:{raw_next_step_language:'come back after October budget review', person:{name:'Lee',company:'Z',name_confidence:'high'}},
  opportunity_intelligence:{opportunity_type:'partnership',partnership_potential:'present'}, relationship_intelligence:{warmth_level:'medium'}, follow_up_intelligence:{channel:'email'} }));
ok('4 deferral pathway: read Deferred with Pathway', r.behavioral_read===BEH.PATHWAY);
ok('4 deferral pathway: not dead (opportunity future)', r.opportunity_readiness==='future');

// 5. Broken micro-promise
r = analyze(I({ behavioral_intelligence:{contradiction:'high', commitment:'medium'},
  context_intelligence:{timeline:'tomorrow', next_step_owner:'contact'},
  capture_intelligence:{raw_next_step_language:"I'll send the invite tomorrow", person:{name:'Mo',company:'Q',name_confidence:'high'}},
  commitment_ledger:[{commitment_text:'send the invite tomorrow',status:'broken',commitment_strength:'medium'}],
  opportunity_intelligence:{opportunity_type:'partnership'}, relationship_intelligence:{warmth_level:'medium'} }));
ok('5 broken promise: read Stalled', r.behavioral_read===BEH.STALLED);
ok('5 broken promise: momentum low', r.momentum_level==='low');

// 6. Warm but misaligned
r = analyze(I({ behavioral_intelligence:{connection:'high',commitment:'low'},
  context_intelligence:{}, capture_intelligence:{person:{name:'Ash',company:'W',name_confidence:'high'}},
  profile_linkage_intelligence:{alignment_strength:'low'},
  human_reads:{goal_relevance_read:{alignedToCurrentFocus:'no'}},
  opportunity_intelligence:{}, relationship_intelligence:{warmth_level:'high'}, follow_up_intelligence:{channel:'email'} }));
ok('6 warm/misaligned: priority low', r.relationship_priority==='low');
ok('6 warm/misaligned: no Goal aligned label', !hasLabel(r,'Goal aligned'));

// 7. Missing name
r = analyze(I({ capture_intelligence:{person:{name:'', name_confidence:'low'}}, behavioral_intelligence:{}, context_intelligence:{} }));
ok('7 missing name: Needs name label', hasLabel(r,'Needs name'));

// 8. Missing contact path
r = analyze(I({ capture_intelligence:{person:{name:'Kim',company:'C',name_confidence:'high'}}, context_intelligence:{}, behavioral_intelligence:{}, follow_up_intelligence:{} }));
ok('8 missing contact: Needs contact path', hasLabel(r,'Needs contact path'));

// 9. Strong memory anchor + weak opportunity
r = analyze(I({ memory_intelligence:{personal_hooks:['rescue greyhound owner']}, behavioral_intelligence:{commitment:'low'},
  context_intelligence:{}, capture_intelligence:{person:{name:'Ren',company:'D',name_confidence:'high'}}, opportunity_intelligence:{}, follow_up_intelligence:{channel:'email'} }));
ok('9 memory rich/weak opp: opportunity low', ['none','weak'].includes(r.opportunity_readiness));
ok('9 memory rich/weak opp: Personal hook captured', hasLabel(r,'Personal hook captured'));

// 10. Strong opportunity + low warmth
r = analyze(I({ behavioral_intelligence:{commitment:'high',access:'high',investment:'high',specificity:'high'},
  context_intelligence:{timeline:'Friday', next_step_owner:'contact', preferred_channel:'email'},
  capture_intelligence:{raw_next_step_language:'send the proposal Friday', person:{name:'Val',company:'E',name_confidence:'high'}},
  opportunity_intelligence:{opportunity_type:'buying',buying_intent:'present'},
  follow_up_intelligence:{recommended_next_step:'Send proposal Friday',channel:'email'},
  relationship_intelligence:{warmth_level:'low'} }));
ok('10 strong opp/low warmth: still reads strong', r.behavioral_read===BEH.ACTIVE && r.opportunity_readiness==='active');

// 11. Goal aligned dual evidence
let aDual = analyze(I({ human_reads:{goal_relevance_read:{alignedToCurrentFocus:'yes',energyRecommendation:'act_now'}},
  behavioral_intelligence:{commitment:'high',specificity:'high'}, context_intelligence:{timeline:'Friday',next_step_owner:'contact',preferred_channel:'email'},
  capture_intelligence:{raw_next_step_language:'send proposal', person:{name:'Gee',company:'F',name_confidence:'high'}},
  opportunity_intelligence:{opportunity_type:'partnership',partnership_potential:'present'}, follow_up_intelligence:{recommended_next_step:'Send proposal'} }));
let aProfileOnly = analyze(I({ human_reads:{goal_relevance_read:{alignedToCurrentFocus:'yes'}},
  behavioral_intelligence:{commitment:'low'}, context_intelligence:{}, capture_intelligence:{person:{name:'Hal',company:'G',name_confidence:'high'}}, opportunity_intelligence:{} }));
ok('11 Goal aligned: present with dual evidence', hasLabel(aDual,'Goal aligned'));
ok('11 Goal aligned: ABSENT with profile-only (no conversation evidence)', !hasLabel(aProfileOnly,'Goal aligned'));

// 12. Recovery needed only with regretRisk + bestRecoveryMove
let recA = analyze(I({ human_reads:{recovery_read:{regretRisk:'high',bestRecoveryMove:'Ask when they are planning the initiative.'}},
  behavioral_intelligence:{commitment:'medium'}, context_intelligence:{}, capture_intelligence:{person:{name:'Ivy',company:'H',name_confidence:'high'}} }));
let recB = analyze(I({ human_reads:{recovery_read:{regretRisk:'high'}}, behavioral_intelligence:{}, context_intelligence:{}, capture_intelligence:{person:{name:'Jay',company:'I',name_confidence:'high'}} }));
ok('12 Recovery needed: present with regretRisk+move', hasLabel(recA,'Recovery needed'));
ok('12 Recovery needed: ABSENT without bestRecoveryMove', !hasLabel(recB,'Recovery needed'));

// 13. Do not chase overrides warmth
r = analyze(I({ behavioral_intelligence:{connection:'high',commitment:'low',deflection:'high'},
  context_intelligence:{}, capture_intelligence:{person:{name:'Kit',company:'J',name_confidence:'high'}}, relationship_intelligence:{warmth_level:'high'}, follow_up_intelligence:{channel:'email'} }));
ok('13 do-not-chase overrides warmth', hasLabel(r,'Do not chase yet') && !hasLabel(r,'Follow up while warm'));

// 14. Follow up while warm requires commitment/readiness
r = analyze(I({ behavioral_intelligence:{commitment:'medium',specificity:'high'},
  context_intelligence:{timeline:'next week',next_step_owner:'contact',preferred_channel:'email'},
  capture_intelligence:{raw_next_step_language:'send the case study', person:{name:'Liv',company:'K',name_confidence:'high'}},
  opportunity_intelligence:{opportunity_type:'partnership',partnership_potential:'present'},
  follow_up_intelligence:{recommended_next_step:'Send case study'}, relationship_intelligence:{warmth_level:'medium'} }));
ok('14 follow-up-while-warm with commitment', hasLabel(r,'Follow up while warm'));

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
