/* ============================================================
   TAPDconnex · Relationship Intelligence Framework
   Engine v1.4.0 — standalone module (extracted from the reference
   harness tapd-intelligence-framework.html).

   This is the deterministic scoring/gating/completeness engine.
   It exposes window.TAPD_REF_ENGINE (canonical) and a back-compat
   alias window.TAPD_INTELLIGENCE pointing at the same object.

   No UI, no self-tests in this file — the .html harness keeps those
   for verification. Where the harness and this file disagree, that
   disagreement is the bug.
   ============================================================ */
(function(root){
'use strict';
var VERSION='1.4.0';
var TIER={STARTER:'starter',PRO:'pro'};
var SIGNAL_CATEGORY={PAIN:'Pain',URGENCY:'Urgency',AUTHORITY:'Authority',RESOURCE:'Resource',ACTION_INTENT:'Action Intent',WARMTH:'Relationship Warmth',STRONG_TEMPLATE_SIGNAL:'Strong Template Signal'};
var SIGNAL_STATUS={DETECTED:'Detected',WEAK:'Weak',BLOCKED:'Blocked',CONTRADICTED:'Contradicted',NO_SIGNAL:'No Signal'};
var MOMENTUM={DORMANT:'Dormant',WARM:'Warm',ACTIVE:'Active',ADVANCING:'Advancing',OPPORTUNITY:'Opportunity',BLOCKED:'Blocked',AT_RISK:'At Risk'};
var CARD_STATE={ACT:'ACT',PROBE:'PROBE',LOG:'LOG',LOW_PRIORITY:'LOW PRIORITY',BLOCKED:'BLOCKED',AT_RISK:'AT RISK'};
var CARD_THRESHOLDS={STRENGTH_HIGH:50,CONFIDENCE_HIGH:70,OPPORTUNITY_SCORE:70};
var STRENGTH_BANDS=[{band:'Low',min:0,max:24},{band:'Light',min:25,max:49},{band:'Medium',min:50,max:69},{band:'High',min:70,max:84},{band:'Very High',min:85,max:100}];
var NEGATIVE_SIGNAL={NO_PRIORITY:'No Priority',NO_BUDGET:'No Budget',NO_AUTHORITY:'No Authority',NO_NEED:'No Need',TIMING_NOT_NOW:'Timing Not Now',POLITE_INTEREST_ONLY:'Polite Interest Only'};
var HARD_BLOCKERS=[NEGATIVE_SIGNAL.NO_BUDGET,NEGATIVE_SIGNAL.NO_AUTHORITY,NEGATIVE_SIGNAL.NO_NEED,NEGATIVE_SIGNAL.NO_PRIORITY,NEGATIVE_SIGNAL.TIMING_NOT_NOW];
var MISSING_CONTEXT={DECISION_MAKER:'Decision maker',BUDGET_OWNER:'Budget owner',TIMELINE:'Timeline',SUCCESS_CRITERIA:'Success criteria',PREFERRED_CHANNEL:'Preferred channel',IMPLEMENTATION_OWNER:'Implementation owner'};
var NEXT_STEP_COMPONENT={OWNER:'Owner',ACTION:'Action',DATE:'Date',CHANNEL:'Channel'};
var FIELD_FILLABILITY={};FIELD_FILLABILITY[NEXT_STEP_COMPONENT.OWNER]='self_fillable';FIELD_FILLABILITY[NEXT_STEP_COMPONENT.ACTION]='self_fillable';FIELD_FILLABILITY[NEXT_STEP_COMPONENT.DATE]='self_fillable';FIELD_FILLABILITY[NEXT_STEP_COMPONENT.CHANNEL]='self_fillable';FIELD_FILLABILITY[MISSING_CONTEXT.PREFERRED_CHANNEL]='self_fillable';FIELD_FILLABILITY[MISSING_CONTEXT.TIMELINE]='either';FIELD_FILLABILITY[MISSING_CONTEXT.SUCCESS_CRITERIA]='either';FIELD_FILLABILITY[MISSING_CONTEXT.DECISION_MAKER]='contact_required';FIELD_FILLABILITY[MISSING_CONTEXT.BUDGET_OWNER]='contact_required';FIELD_FILLABILITY[MISSING_CONTEXT.IMPLEMENTATION_OWNER]='contact_required';
var SIGNAL_FIELD_REQUIREMENTS={};SIGNAL_FIELD_REQUIREMENTS[SIGNAL_CATEGORY.ACTION_INTENT]=[NEXT_STEP_COMPONENT.OWNER,NEXT_STEP_COMPONENT.ACTION,NEXT_STEP_COMPONENT.DATE,NEXT_STEP_COMPONENT.CHANNEL];SIGNAL_FIELD_REQUIREMENTS[SIGNAL_CATEGORY.AUTHORITY]=[MISSING_CONTEXT.DECISION_MAKER];SIGNAL_FIELD_REQUIREMENTS[SIGNAL_CATEGORY.RESOURCE]=[MISSING_CONTEXT.BUDGET_OWNER];SIGNAL_FIELD_REQUIREMENTS[SIGNAL_CATEGORY.URGENCY]=[MISSING_CONTEXT.TIMELINE];SIGNAL_FIELD_REQUIREMENTS[SIGNAL_CATEGORY.PAIN]=[MISSING_CONTEXT.SUCCESS_CRITERIA];SIGNAL_FIELD_REQUIREMENTS[SIGNAL_CATEGORY.WARMTH]=[MISSING_CONTEXT.PREFERRED_CHANNEL];
var TEMPLATE={OPPORTUNITY:'Opportunity',CONNECTOR:'Connector',STAY_IN_TOUCH:'Stay in Touch',STRATEGIC_PARTNERSHIP:'Strategic Partnership',SPEAKING:'Speaking Opportunity',CAREER:'Career Opportunity',PRODUCT_DISCOVERY:'Product Discovery',PILOT_BETA:'Pilot / Beta Opportunity',ADVISORY:'Advisory / Mentor',COMMUNITY_ACCESS:'Community Access'};
var STARTER_TEMPLATES=[TEMPLATE.OPPORTUNITY,TEMPLATE.CONNECTOR,TEMPLATE.STAY_IN_TOUCH];
var PRO_TEMPLATES=[TEMPLATE.STRATEGIC_PARTNERSHIP,TEMPLATE.SPEAKING,TEMPLATE.CAREER,TEMPLATE.PRODUCT_DISCOVERY,TEMPLATE.PILOT_BETA,TEMPLATE.ADVISORY,TEMPLATE.COMMUNITY_ACCESS];
var ALL_TEMPLATES=STARTER_TEMPLATES.concat(PRO_TEMPLATES);
var RECOVERY_QUESTIONS={};RECOVERY_QUESTIONS[MISSING_CONTEXT.DECISION_MAKER]='Who else would need to be involved in a decision like this?';RECOVERY_QUESTIONS[MISSING_CONTEXT.BUDGET_OWNER]='How are decisions like this usually funded?';RECOVERY_QUESTIONS[MISSING_CONTEXT.TIMELINE]="What's your timeline around this?";RECOVERY_QUESTIONS[MISSING_CONTEXT.SUCCESS_CRITERIA]='What would success look like for you?';RECOVERY_QUESTIONS[MISSING_CONTEXT.PREFERRED_CHANNEL]="What's the best way to stay in touch?";RECOVERY_QUESTIONS[MISSING_CONTEXT.IMPLEMENTATION_OWNER]='Who would actually run this on your side?';
var PROVENANCE={CONTACT_STATED:'CONTACT_STATED',USER_SUPPLIED:'USER_SUPPLIED',SYSTEM_DERIVED:'SYSTEM_DERIVED'};

function clampNumber(n,lo,hi){var x=isFinite(Number(n))?Number(n):0;return Math.max(lo,Math.min(hi,x));}
function bandFor(s){s=clampNumber(s,0,100);for(var i=0;i<STRENGTH_BANDS.length;i++){if(s>=STRENGTH_BANDS[i].min&&s<=STRENGTH_BANDS[i].max)return STRENGTH_BANDS[i].band;}return'Low';}

var CATEGORY_BASE_SCORE={};CATEGORY_BASE_SCORE[SIGNAL_CATEGORY.ACTION_INTENT]=40;CATEGORY_BASE_SCORE[SIGNAL_CATEGORY.AUTHORITY]=30;CATEGORY_BASE_SCORE[SIGNAL_CATEGORY.RESOURCE]=30;CATEGORY_BASE_SCORE[SIGNAL_CATEGORY.URGENCY]=25;CATEGORY_BASE_SCORE[SIGNAL_CATEGORY.STRONG_TEMPLATE_SIGNAL]=25;CATEGORY_BASE_SCORE[SIGNAL_CATEGORY.PAIN]=20;CATEGORY_BASE_SCORE[SIGNAL_CATEGORY.WARMTH]=10;
var QUALIFYING_CATEGORIES=[SIGNAL_CATEGORY.ACTION_INTENT,SIGNAL_CATEGORY.URGENCY,SIGNAL_CATEGORY.AUTHORITY,SIGNAL_CATEGORY.RESOURCE,SIGNAL_CATEGORY.STRONG_TEMPLATE_SIGNAL];
var GATE_CAP=49;
var EVIDENCE_MULTIPLIER={DIRECT_SPECIFIC:1.0,DIRECT_VAGUE:0.8,INDIRECT:0.5};
var NEGATIVE_PENALTY={HARD:25,STANDARD:15};
var CONFIDENCE_FLOOR_CAP=70,CONFIDENCE_MIN_EVIDENCE=2,CONTRADICTION_CONFIDENCE_PENALTY=20;

function _evMult(ev){if(!ev)return EVIDENCE_MULTIPLIER.INDIRECT;if(ev.direct&&ev.specific)return EVIDENCE_MULTIPLIER.DIRECT_SPECIFIC;if(ev.direct&&!ev.specific)return EVIDENCE_MULTIPLIER.DIRECT_VAGUE;return EVIDENCE_MULTIPLIER.INDIRECT;}
function _provW(ev){if(ev&&ev.provenance===PROVENANCE.USER_SUPPLIED&&ev.aboutContact)return 0;return 1;}
function scoreStrength(signals,negatives){
  var sigs=signals||[],negs=negatives||[],raw=0;
  sigs.forEach(function(s){var base=CATEGORY_BASE_SCORE[s&&s.category]||0;raw+=base*_evMult(s&&s.evidence)*_provW(s&&s.evidence);});
  raw=clampNumber(Math.round(raw),0,100);
  var cats=sigs.map(function(s){return s&&s.category;});
  var hasQ=cats.some(function(c){return QUALIFYING_CATEGORIES.indexOf(c)>=0;});
  var score=hasQ?raw:Math.min(raw,GATE_CAP);
  negs.forEach(function(n){var hard=n&&(n.hardBlocker||HARD_BLOCKERS.indexOf(n.name)>=0);score-=hard?NEGATIVE_PENALTY.HARD:NEGATIVE_PENALTY.STANDARD;});
  score=clampNumber(score,0,100);
  return{signalScore:score,signalStrength:bandFor(score),rawScore:raw,gateLifted:hasQ};
}
function scoreConfidence(evidence,contradictions){
  var ev=evidence||[],contra=contradictions||[];
  if(ev.length===0)return{confidence:0,confidenceReason:'No evidence captured.',floorApplied:false};
  var total=0;
  ev.forEach(function(e){
    var f=[e.specific?1:0,(e.clarity!=null?e.clarity:(e.specific?1:0)),(e.repetition!=null?e.repetition:0),e.direct?1:0,(e.context!=null?e.context:(e.direct?1:0))];
    total+=f.reduce(function(a,b){return a+b;},0)/f.length;
  });
  var base=clampNumber(Math.round((total/ev.length)*100),0,100);
  var thin=ev.length<CONFIDENCE_MIN_EVIDENCE||ev.every(function(e){return!e.direct;});
  var floored=thin?Math.min(base,CONFIDENCE_FLOOR_CAP):base;
  var conf=clampNumber(floored-contra.length*CONTRADICTION_CONFIDENCE_PENALTY,0,100);
  var dc=ev.filter(function(e){return e.direct;}).length,parts=[];
  parts.push(dc>=2?dc+' direct statements support this':dc===1?'one direct statement supports this':'only indirect evidence');
  if(thin)parts.push('held by the confidence floor');
  if(contra.length)parts.push('lowered by '+contra.length+' contradiction(s)');
  return{confidence:conf,confidenceReason:parts.join('; ')+'.',floorApplied:thin};
}

var _CUES={};
_CUES[SIGNAL_CATEGORY.PAIN]=['keep losing','manual','frustrat','struggle','slow','broken','painful','nightmare','bottleneck','falls through','drop the ball',"doesn't scale",'tripping over'];
_CUES[SIGNAL_CATEGORY.URGENCY]=['before the','deadline','this month','this quarter','next quarter','launch','asap','urgent','by end of','running out of time','time-sensitive','deciding'];
_CUES[SIGNAL_CATEGORY.AUTHORITY]=['i own','i manage','my team','i approve','i decide','i can introduce','i sign off','my call','i lead','i head up'];
_CUES[SIGNAL_CATEGORY.RESOURCE]=['we have budget','budget for','funding','procurement','sponsor','allocated','evaluating vendors','we can fund'];
_CUES[SIGNAL_CATEGORY.ACTION_INTENT]=['send pricing','send the proposal','send me','schedule a call',"let's set up",'book a','introduce us','set up a demo','next step','follow up',"let's talk",'share the deck',"i'll send","let's schedule"];
_CUES[SIGNAL_CATEGORY.WARMTH]=['stay in touch','keep in touch','like what','interesting','love what','great chat','enjoyed','we should connect','keep me posted','sounds good'];
var _DIRECT=['i ','we ',"let's",'my ','send','schedule','book',"i'll","we'll"];
var _SPEC=['this week','friday','monday','tuesday','wednesday','thursday','tomorrow','next week','$','percent','%','pricing','proposal','demo','q1','q2','q3','q4',' by '];
var _NEG={};
_NEG[NEGATIVE_SIGNAL.NO_PRIORITY]=['not a focus','not a priority','not important','not on our roadmap','back burner'];
_NEG[NEGATIVE_SIGNAL.NO_BUDGET]=['no budget','no funding','nothing allocated','not in our budget',"can't fund",'budget is frozen','headcount freeze'];
_NEG[NEGATIVE_SIGNAL.NO_AUTHORITY]=['not my decision','not my call','wrong person',"i'm not involved",'someone else decides','run it by','need sign-off','need procurement'];
_NEG[NEGATIVE_SIGNAL.NO_NEED]=['already solved','already have','no requirement',"don't need","we're covered",'already using'];
_NEG[NEGATIVE_SIGNAL.TIMING_NOT_NOW]=['maybe later','next year','not this quarter','not right now','down the line','revisit later','a bit early'];
_NEG[NEGATIVE_SIGNAL.POLITE_INTEREST_ONLY]=['keep me posted','sounds good','good to know','send me something',"we'll see","send the deck"];
function _segs(t){return String(t||'').split(/(?<=[.!?])\s+|\n+/).map(function(s){return s.trim();}).filter(Boolean);}
function _isDir(t){t=t.toLowerCase();return _DIRECT.some(function(m){return t.indexOf(m)>=0;});}
function _isSpec(t){t=t.toLowerCase();return _SPEC.some(function(m){return t.indexOf(m)>=0;});}
function detectUniversalSignals(tr){
  var segs=_segs(tr),out=[],seen={};
  segs.forEach(function(seg){var low=seg.toLowerCase();Object.keys(_CUES).forEach(function(cat){
    if(_CUES[cat].some(function(c){return low.indexOf(c)>=0;})){var k=cat+'|'+seg;if(seen[k])return;seen[k]=1;
      out.push({name:cat,category:cat,evidence:{quote:seg,direct:_isDir(seg),specific:_isSpec(seg),provenance:PROVENANCE.CONTACT_STATED,aboutContact:true}});}
  });});
  return out;
}
function detectNegatives(tr){
  var segs=_segs(tr),out=[],seen={};
  segs.forEach(function(seg){var low=seg.toLowerCase();Object.keys(_NEG).forEach(function(name){
    if(_NEG[name].some(function(c){return low.indexOf(c)>=0;})){var k=name+'|'+seg;if(seen[k])return;seen[k]=1;
      out.push({name:name,quote:seg,hardBlocker:HARD_BLOCKERS.indexOf(name)>=0});}
  });});
  return out;
}
function _guard(signals,tr){var hay=String(tr||'').toLowerCase();return signals.filter(function(s){var q=s&&s.evidence&&s.evidence.quote;return q&&hay.indexOf(String(q).toLowerCase())>=0;});}
var _CP=[{pos:SIGNAL_CATEGORY.RESOURCE,neg:NEGATIVE_SIGNAL.NO_BUDGET},{pos:SIGNAL_CATEGORY.AUTHORITY,neg:NEGATIVE_SIGNAL.NO_AUTHORITY},{pos:SIGNAL_CATEGORY.ACTION_INTENT,neg:NEGATIVE_SIGNAL.TIMING_NOT_NOW},{pos:SIGNAL_CATEGORY.URGENCY,neg:NEGATIVE_SIGNAL.TIMING_NOT_NOW},{pos:SIGNAL_CATEGORY.ACTION_INTENT,neg:NEGATIVE_SIGNAL.POLITE_INTEREST_ONLY}];
function detectContradictions(signals,negatives){var cats={},negs={},out=[];(signals||[]).forEach(function(s){cats[s.category]=1;});(negatives||[]).forEach(function(n){negs[n.name]=1;});_CP.forEach(function(p){if(cats[p.pos]&&negs[p.neg])out.push({positive:p.pos,negative:p.neg});});return out;}
function signalStatus(signals,negatives,contra){if(negatives&&negatives.some(function(n){return n.hardBlocker;}))return SIGNAL_STATUS.BLOCKED;if(contra&&contra.length)return SIGNAL_STATUS.CONTRADICTED;if(!signals||!signals.length)return SIGNAL_STATUS.NO_SIGNAL;return signals.some(function(s){return s.evidence&&s.evidence.direct;})?SIGNAL_STATUS.DETECTED:SIGNAL_STATUS.WEAK;}
function deriveMomentum(score,status,hasAction){if(status===SIGNAL_STATUS.BLOCKED)return MOMENTUM.BLOCKED;if(score>=CARD_THRESHOLDS.OPPORTUNITY_SCORE&&hasAction)return MOMENTUM.OPPORTUNITY;if(score>=CARD_THRESHOLDS.STRENGTH_HIGH)return MOMENTUM.ADVANCING;if(score>=25)return MOMENTUM.ACTIVE;if(score>0)return MOMENTUM.WARM;return MOMENTUM.DORMANT;}

var _NSF=[NEXT_STEP_COMPONENT.OWNER,NEXT_STEP_COMPONENT.ACTION,NEXT_STEP_COMPONENT.DATE,NEXT_STEP_COMPONENT.CHANNEL];
var TEMPLATE_COMPLETENESS={};
TEMPLATE_COMPLETENESS[TEMPLATE.OPPORTUNITY]={key:MISSING_CONTEXT.TIMELINE,context:[MISSING_CONTEXT.SUCCESS_CRITERIA,MISSING_CONTEXT.DECISION_MAKER,MISSING_CONTEXT.TIMELINE]};
TEMPLATE_COMPLETENESS[TEMPLATE.CONNECTOR]={key:MISSING_CONTEXT.PREFERRED_CHANNEL,context:[MISSING_CONTEXT.PREFERRED_CHANNEL]};
TEMPLATE_COMPLETENESS[TEMPLATE.STAY_IN_TOUCH]={key:MISSING_CONTEXT.PREFERRED_CHANNEL,context:[MISSING_CONTEXT.PREFERRED_CHANNEL,MISSING_CONTEXT.TIMELINE]};
TEMPLATE_COMPLETENESS[TEMPLATE.STRATEGIC_PARTNERSHIP]={key:MISSING_CONTEXT.DECISION_MAKER,context:[MISSING_CONTEXT.DECISION_MAKER,MISSING_CONTEXT.SUCCESS_CRITERIA,MISSING_CONTEXT.IMPLEMENTATION_OWNER]};
TEMPLATE_COMPLETENESS[TEMPLATE.SPEAKING]={key:MISSING_CONTEXT.TIMELINE,context:[MISSING_CONTEXT.TIMELINE,MISSING_CONTEXT.DECISION_MAKER]};
TEMPLATE_COMPLETENESS[TEMPLATE.CAREER]={key:MISSING_CONTEXT.SUCCESS_CRITERIA,context:[MISSING_CONTEXT.SUCCESS_CRITERIA,MISSING_CONTEXT.DECISION_MAKER,MISSING_CONTEXT.TIMELINE]};
TEMPLATE_COMPLETENESS[TEMPLATE.PRODUCT_DISCOVERY]={key:MISSING_CONTEXT.SUCCESS_CRITERIA,context:[MISSING_CONTEXT.SUCCESS_CRITERIA]};
TEMPLATE_COMPLETENESS[TEMPLATE.PILOT_BETA]={key:MISSING_CONTEXT.SUCCESS_CRITERIA,context:[MISSING_CONTEXT.SUCCESS_CRITERIA,MISSING_CONTEXT.IMPLEMENTATION_OWNER,MISSING_CONTEXT.TIMELINE]};
TEMPLATE_COMPLETENESS[TEMPLATE.ADVISORY]={key:MISSING_CONTEXT.PREFERRED_CHANNEL,context:[MISSING_CONTEXT.PREFERRED_CHANNEL]};
TEMPLATE_COMPLETENESS[TEMPLATE.COMMUNITY_ACCESS]={key:MISSING_CONTEXT.DECISION_MAKER,context:[MISSING_CONTEXT.DECISION_MAKER,MISSING_CONTEXT.PREFERRED_CHANNEL]};
function fillabilityOf(f){return FIELD_FILLABILITY[f]||'either';}
function computeCompleteness(template,captured){
  var cfg=TEMPLATE_COMPLETENESS[template];if(!cfg)return{ok:false,error:'No config: '+template};
  captured=captured||{};var ns=captured.nextStep||{},ctx=captured.context||{},required=[];
  _NSF.forEach(function(f){required.push({field:f,captured:!!ns[f]});});
  cfg.context.forEach(function(f){required.push({field:f,captured:!!ctx[f]});});
  var total=required.length,have=required.filter(function(r){return r.captured;}).length;
  var pct=Math.round((have/total)*100),gaps=required.filter(function(r){return!r.captured;});
  var fillNow=[],askNextTime=[];
  gaps.forEach(function(g){var fill=fillabilityOf(g.field),item={field:g.field,fillability:fill,prompt:RECOVERY_QUESTIONS[g.field]||null};if(fill==='contact_required')askNextTime.push(item);else fillNow.push(item);});
  var keyField=cfg.key,keyCaptured=(ctx[keyField]===true)||(_NSF.indexOf(keyField)>=0&&ns[keyField]===true);
  return{ok:true,template:template,pct:pct,have:have,total:total,keyField:keyField,keyCaptured:keyCaptured,fillNow:fillNow,askNextTime:askNextTime,gaps:gaps.map(function(g){return g.field;})};
}
function isHardBlocker(v){if(!v)return false;if(Array.isArray(v))return v.some(isHardBlocker);var n=typeof v==='string'?v:(v.name||v.signal||v.type);return HARD_BLOCKERS.indexOf(n)>=0;}
function resolveCardState(result,tier){
  var t=tier||(result&&result.tier)||TIER.PRO;var ss=clampNumber(result&&result.signalScore,0,100);var conf=result&&result.confidence;
  var hb=(result&&result.signalStatus===SIGNAL_STATUS.BLOCKED)||(result&&result.momentum===MOMENTUM.BLOCKED)||isHardBlocker(result&&(result.hardBlockers||result.blockers||result.negativeSignals));
  if(hb)return CARD_STATE.BLOCKED;if(result&&result.momentum===MOMENTUM.AT_RISK)return CARD_STATE.AT_RISK;
  var sh=ss>=CARD_THRESHOLDS.STRENGTH_HIGH;
  if(t===TIER.STARTER||conf==null)return sh?CARD_STATE.ACT:CARD_STATE.LOG;
  var ch=clampNumber(conf,0,100)>=CARD_THRESHOLDS.CONFIDENCE_HIGH;
  if(sh&&ch)return CARD_STATE.ACT;if(sh&&!ch)return CARD_STATE.PROBE;if(!sh&&ch)return CARD_STATE.LOG;return CARD_STATE.LOW_PRIORITY;
}
function _topic(signals){var order=[SIGNAL_CATEGORY.PAIN,SIGNAL_CATEGORY.ACTION_INTENT,SIGNAL_CATEGORY.URGENCY];for(var i=0;i<order.length;i++){var hit=signals.find(function(s){return s.category===order[i]&&s.evidence&&s.evidence.quote;});if(hit){var q=hit.evidence.quote.replace(/[.!?]+$/,'').toLowerCase().replace(/^(we|i|they)\s+/,'');return q.length>70?null:q;}}return null;}
function _close(t){switch(t){case TEMPLATE.OPPORTUNITY:return'Would it make sense to set up a short call next week?';case TEMPLATE.CONNECTOR:return'Happy to make those introductions whenever useful.';case TEMPLATE.STAY_IN_TOUCH:return"Let's keep in touch — I'll check back in a little while.";case TEMPLATE.STRATEGIC_PARTNERSHIP:return'Shall we find time to explore where this could go together?';case TEMPLATE.PILOT_BETA:return'Would you be open to a short trial to see how it performs?';default:return'Would a quick follow-up call be useful?';}}
function buildDraft(o){o=o||{};var owner=o.ownerStyle||{};var name=o.contactName||'{first name}';var event=o.eventName||'{event}';var template=o.template||TEMPLATE.OPPORTUNITY;var signals=o.signals||[];var comp=o.completeness||{};
  var topic=_topic(signals);var intro=owner.intro||('Great connecting at '+event+'.');var body=topic?('I enjoyed our conversation about '+topic+'.'):'I enjoyed our conversation.';var pos=owner.positioning?(' '+owner.positioning):'';var close=owner.close||_close(template);
  var draft=['Hi '+name+',','',intro+' '+body+pos,'',close,'',owner.signoff||''].join('\n').replace(/\n{3,}/g,'\n\n').trim();
  var rf=[];(comp.fillNow||[]).forEach(function(f){if(f.field===NEXT_STEP_COMPONENT.DATE)rf.push('No date set for the next step.');if(f.field===NEXT_STEP_COMPONENT.CHANNEL)rf.push('No send channel chosen yet.');});
  return{draft:draft,topic:topic,reviewFlags:rf,humanInLoop:true};
}
function _inferCaptured(signals){var ns={},ctx={};if(signals.some(function(s){return s.category===SIGNAL_CATEGORY.ACTION_INTENT;})){ns[NEXT_STEP_COMPONENT.OWNER]=true;ns[NEXT_STEP_COMPONENT.ACTION]=true;if(signals.some(function(s){return s.evidence&&s.evidence.specific;}))ns[NEXT_STEP_COMPONENT.DATE]=true;}signals.forEach(function(s){(SIGNAL_FIELD_REQUIREMENTS[s.category]||[]).forEach(function(f){if(_NSF.indexOf(f)<0)ctx[f]=true;});});return{nextStep:ns,context:ctx};}
function analyze(tr,template,opts){
  opts=opts||{};var tier=(opts.tier===TIER.PRO||opts.tier==='pro')?TIER.PRO:((opts.tier===TIER.STARTER||opts.tier==='starter')?TIER.STARTER:TIER.PRO);template=template||TEMPLATE.OPPORTUNITY;
  var signals=_guard(detectUniversalSignals(tr),tr);var negatives=detectNegatives(tr);var contra=detectContradictions(signals,negatives);var status=signalStatus(signals,negatives,contra);
  var strength=scoreStrength(signals,negatives);
  var evidence=signals.map(function(s){return{direct:!!(s.evidence&&s.evidence.direct),specific:!!(s.evidence&&s.evidence.specific)};});
  var conf=tier===TIER.PRO?scoreConfidence(evidence,contra):{confidence:null,confidenceReason:'Confidence is a Pro signal.',floorApplied:false};
  var hasAction=signals.some(function(s){return s.category===SIGNAL_CATEGORY.ACTION_INTENT;});var momentum=deriveMomentum(strength.signalScore,status,hasAction);
  var captured=opts.captured||_inferCaptured(signals);var completeness=computeCompleteness(template,captured);
  var cardInput={tier:tier,signalScore:strength.signalScore,confidence:tier===TIER.PRO?conf.confidence:null,signalStatus:status,momentum:momentum,negativeSignals:negatives.map(function(n){return n.name;})};
  var cardState=resolveCardState(cardInput,tier);
  var draft=buildDraft({ownerStyle:opts.ownerStyle,contactName:opts.contactName,eventName:opts.eventName,template:template,signals:signals,completeness:completeness});
  return{tier:tier,template:template,signals:signals,negatives:negatives,contradictions:contra,signalStatus:status,signalScore:strength.signalScore,signalStrength:strength.signalStrength,gateLifted:strength.gateLifted,confidence:conf.confidence,confidenceReason:conf.confidenceReason,floorApplied:conf.floorApplied,momentum:momentum,completeness:completeness,cardState:cardState,draft:draft};
}
/* ---- resurface + capture window (the Pro +5-min feature) ---- */
function buildResurfacePayload(analysis,template,opts){
  opts=opts||{};var tier=opts.tier||TIER.PRO;
  if(tier!==TIER.PRO)return{eligible:false,reason:'Pro feature'};
  var comp=analysis&&analysis.completeness;if(!comp||!comp.ok)return{eligible:false,reason:'No completeness data'};
  var keyField=comp.keyField;
  var tagKey=function(items){return items.map(function(g){return{field:g.field,prompt:g.prompt,key:(g.field===keyField),fillability:g.fillability};});};
  var keyFirst=function(arr){return arr.slice().sort(function(a,b){return(b.key===true)-(a.key===true);});};
  var completeNow=keyFirst(tagKey(comp.fillNow));
  var askNextTime=keyFirst(tagKey(comp.askNextTime));
  if(completeNow.length===0&&askNextTime.length===0)return{eligible:false,reason:'Engagement already complete',completenessScore:comp.pct};
  var eligible=completeNow.length>0;
  var topPriority=completeNow.filter(function(g){return g.key;})[0]||completeNow[0]||askNextTime.filter(function(g){return g.key;})[0]||askNextTime[0]||null;
  return{eligible:eligible,template:template,completenessScore:comp.pct,
    completeNow:{heading:'A few things worth capturing while it\u2019s fresh',windowSeconds:300,items:completeNow},
    askNextTime:{heading:'Worth asking them next time',items:askNextTime},topPriority:topPriority};
}
var CAPTURE_STATE={IDLE:'idle',OFFERED:'offered',CAPTURING:'capturing',MERGING:'merging',REANALYSING:'reanalysing',COMPLETE:'complete',SKIPPED:'skipped',EXPIRED:'expired'};
function createCaptureMachine(ports){
  function init(payload,cfg){cfg=cfg||{};return{state:payload&&payload.eligible?CAPTURE_STATE.OFFERED:CAPTURE_STATE.IDLE,meetingId:cfg.meetingId,template:cfg.template,tier:cfg.tier||TIER.PRO,mode:cfg.mode||'self_fill',payload:payload,beforeScore:payload?payload.completenessScore:null,afterScore:null,filled:[],result:null,error:null};}
  function guard(ctx,exp){if(ctx.state!==exp)throw new Error('Illegal transition from '+ctx.state+' (expected '+exp+')');}
  function accept(ctx){guard(ctx,CAPTURE_STATE.OFFERED);ports.startRecording&&ports.startRecording();var c=Object.assign({},ctx,{state:CAPTURE_STATE.CAPTURING});return c;}
  function skip(ctx){guard(ctx,CAPTURE_STATE.OFFERED);return Object.assign({},ctx,{state:CAPTURE_STATE.SKIPPED});}
  function markFilled(ctx,field){guard(ctx,CAPTURE_STATE.CAPTURING);if(ctx.filled.indexOf(field)>=0)return ctx;return Object.assign({},ctx,{filled:ctx.filled.concat([field])});}
  function done(ctx){guard(ctx,CAPTURE_STATE.CAPTURING);return finish(ctx,false);}
  function expire(ctx){if(ctx.state!==CAPTURE_STATE.CAPTURING)return ctx;return finish(ctx,true);}
  function finish(ctx,expired){
    var cap=ports.stopRecording?ports.stopRecording():{segments:[]};var segments=cap&&cap.segments||[];
    if(!segments.length)return Object.assign({},ctx,{state:expired?CAPTURE_STATE.EXPIRED:CAPTURE_STATE.SKIPPED});
    var provenance=ctx.mode==='extend_merge'?'contact_stated':'user_supplied';var analysis;
    try{analysis=ports.reanalyse(ctx.meetingId,segments,provenance);}
    catch(err){return Object.assign({},ctx,{state:CAPTURE_STATE.COMPLETE,error:err.message,afterScore:ctx.beforeScore,gain:0});}
    var after=ports.buildResurface(analysis,ctx.template,{tier:ctx.tier});
    var afterScore=analysis.completeness?analysis.completeness.pct:ctx.beforeScore;
    return Object.assign({},ctx,{state:CAPTURE_STATE.COMPLETE,result:analysis,afterScore:afterScore,residual:after.askNextTime?after.askNextTime.items:[],gain:afterScore-(ctx.beforeScore||0),wasExpired:expired});
  }
  return{init:init,accept:accept,skip:skip,markFilled:markFilled,done:done,expire:expire,CAPTURE_STATE:CAPTURE_STATE};
}

root.TAPD_REF_ENGINE={VERSION:VERSION,TIER:TIER,SIGNAL_CATEGORY:SIGNAL_CATEGORY,SIGNAL_STATUS:SIGNAL_STATUS,MOMENTUM:MOMENTUM,CARD_STATE:CARD_STATE,CARD_THRESHOLDS:CARD_THRESHOLDS,NEGATIVE_SIGNAL:NEGATIVE_SIGNAL,HARD_BLOCKERS:HARD_BLOCKERS,MISSING_CONTEXT:MISSING_CONTEXT,NEXT_STEP_COMPONENT:NEXT_STEP_COMPONENT,FIELD_FILLABILITY:FIELD_FILLABILITY,SIGNAL_FIELD_REQUIREMENTS:SIGNAL_FIELD_REQUIREMENTS,TEMPLATE:TEMPLATE,STARTER_TEMPLATES:STARTER_TEMPLATES,PRO_TEMPLATES:PRO_TEMPLATES,ALL_TEMPLATES:ALL_TEMPLATES,TEMPLATE_COMPLETENESS:TEMPLATE_COMPLETENESS,GATE_CAP:GATE_CAP,CATEGORY_BASE_SCORE:CATEGORY_BASE_SCORE,QUALIFYING_CATEGORIES:QUALIFYING_CATEGORIES,RECOVERY_QUESTIONS:RECOVERY_QUESTIONS,PROVENANCE:PROVENANCE,scoreStrength:scoreStrength,scoreConfidence:scoreConfidence,detectUniversalSignals:detectUniversalSignals,detectNegatives:detectNegatives,detectContradictions:detectContradictions,signalStatus:signalStatus,deriveMomentum:deriveMomentum,computeCompleteness:computeCompleteness,resolveCardState:resolveCardState,buildDraft:buildDraft,analyze:analyze,buildResurfacePayload:buildResurfacePayload,createCaptureMachine:createCaptureMachine,CAPTURE_STATE:CAPTURE_STATE};

/* Back-compat alias: several files (capture-app.js defensive check, the
   master prompt's aiOutputToHubCapture, future modules) reach for
   TAPD_INTELLIGENCE. Point it at the same object so there is ONE engine. */
root.TAPD_INTELLIGENCE=root.TAPD_REF_ENGINE;
})(window);
