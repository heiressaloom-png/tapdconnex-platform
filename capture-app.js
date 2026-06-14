const K={CAP:'tapd_captures',EV:'tapd_event_context',TPL:'tapd_selected_template',UID:'tapd_user_id',PROFILE:'tapd_onboarding_data',PLAN:'tapd_user_plan'};
const T=[{"id":"opportunity","name":"Explore working together","tier":"starter","canonical":"Opportunity","signals":["Active pain","Time pressure","Budget signals","Decision authority","Success criteria"],"questions":["What are you focused on at the moment?","What’s been taking up most of your time recently?","What’s working well and what’s proving challenging?","Is there anything you’re actively trying to improve?","Have you looked at other ways of solving that?","What would success look like for you?","What’s your timeline around this?","What’s the best next step from here?"],"signsNotReady":["Not a priority right now","No budget","Not their decision","Already sorted","Just being polite"]},{"id":"connector","name":"Grow my network / get introductions","tier":"starter","canonical":"Connector","signals":["Referrals offered","Warm intros volunteered","Strong networks","Access to decision makers","Community involvement"],"questions":["What kind of people do you enjoy connecting?","Who are you currently working with?","What communities are you involved in?","Who should I know in your world?","Who do you think would benefit from what I do?","What’s the best way to approach them?","Would you be comfortable introducing us?","What would make that introduction easier?"],"signsNotReady":["Doesn't know them well","Needs to check first","Not the right person","Keeping you posted only"]},{"id":"stay_in_touch","name":"Keep the relationship warm","tier":"starter","canonical":"Stay in Touch","signals":["Shared interests","Future goals","Personal chemistry","Long-term potential"],"questions":["What projects are exciting you right now?","Where do you see things heading?","What are you keeping an eye on?","What are you hoping to achieve this year?","Is there anything you’d like help with?","How can I support you?","What’s the best way to stay connected?","When should we reconnect?"],"signsNotReady":[]},{"id":"strategic_partnership","name":"Partner or collaborate","tier":"pro","canonical":"Strategic Partnership","signals":["Shared audience","Complementary strengths","Mutual benefit","Resource gaps","Distribution reach"],"questions":["What are you building at the moment?","Where do you see opportunities for collaboration?","What strengths does your organisation bring?","What’s missing today that would help you move faster?","What partnerships have worked well for you before?","What would success look like together?","Who else should be involved?","What should we explore next?"],"signsNotReady":["Needs leadership sign-off","One-sided benefit","Stretched on resources","Loose interest only"]},{"id":"speaking","name":"Get booked to speak","tier":"pro","canonical":"Speaking Opportunity","signals":["Upcoming events","Audience fit","Topic relevance","Programme influence","Gaps in their lineup"],"questions":["What events are you involved with?","What topics resonate most with your audience?","What challenges are people talking about?","What type of speakers do you usually look for?","What outcomes do you want attendees to leave with?","What events are coming up?","How do you select speakers?","What should happen next?"],"signsNotReady":["Lineup already set","Someone else books speakers","Maybe a future event","Not right for their audience"]},{"id":"career","name":"Get hired or find work","tier":"pro","canonical":"Career Opportunity","signals":["Hiring need","Skill gaps","Upcoming projects","Team fit signals","Budget for a role / contract"],"questions":["What initiatives are you focused on?","What skills are hardest to find right now?","What types of people do well in your environment?","What projects are coming up?","Where are you looking for support?","What experience would be most valuable?","What would success look like?","What’s the next step?"],"signsNotReady":["Not hiring now","Headcount freeze","HR handles it","Details kept on file only"]},{"id":"product_discovery","name":"Understand a problem","tier":"pro","canonical":"Product Discovery","signals":["Current workaround","Repeated frustration","Frequency of the problem","Cost / impact of it","Dissatisfaction with status quo"],"questions":["How are you currently solving that?","What’s frustrating about the current approach?","How often does this happen?","What impact does it have?","What have you already tried?","What would an ideal solution look like?","How would you know it worked?","Would you be open to testing something new?"],"signsNotReady":["Minor annoyance","Already have a fix","Rarely happens","Interesting but not for them"]},{"id":"pilot_beta","name":"Get something tested or piloted","tier":"pro","canonical":"Pilot / Beta Opportunity","signals":["Willingness to test","Implementation readiness","Early-adopter behaviour","A specific use case","Expansion potential"],"questions":["Would you be open to testing something new?","What would make it worth trying?","Who would use it?","What would success look like?","What concerns would you have?","What support would you need?","How long would you want to test it?","What would happen if it worked?"],"signsNotReady":["Can't allocate anyone","Sees it as risky","Maybe next quarter","Needs procurement sign-off"]},{"id":"advisory","name":"Find an expert / get advice","tier":"pro","canonical":"Advisory / Mentor","signals":["Deep expertise shown","Willingness to share","Strategic perspective","Pattern recognition","Openness to ongoing contact"],"questions":["What trends are you seeing?","What lessons have shaped your career?","If you were starting today, what would you do differently?","What’s a mistake people commonly make?","What opportunities do you think are overlooked?","What would you focus on if you were in my position?","How can I learn more about this area?","Would you be open to continuing the conversation?"],"signsNotReady":["Short on time","Not their area","Vague 'reach out sometime'","Only via paid program"]},{"id":"community_access","name":"Get into a community","tier":"pro","canonical":"Community Access","signals":["Active community involvement","Gatekeeper / organiser role","Open entry paths","Member value on offer","Good-fit signals for you"],"questions":["What communities are you involved in?","What makes that community valuable?","Who tends to thrive there?","How do people usually get involved?","What opportunities come from being part of it?","What do members contribute?","Do you think I’d be a good fit?","What would be the best way to get involved?"],"signsNotReady":["Invite-only / closed","No longer involved","Unsure on fit","Not taking new members"]}];let S={screen:'ready',tpl:localStorage.getItem(K.TPL)||'opportunity',ev:read(K.EV,null),p:{},blob:null,dur:0,t0:0,timer:null,rec:null,stream:null,chunks:[],paused:false,pausedMs:0,pauseStart:0,ai:null,transcript:'',transcriptConfidence:null,aiStatus:'idle',wakeLock:null,interrupted:false,audioIncomplete:false,gutFeel:null,queued:false,finishing:false,captureId:null};
function read(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch(e){return f}}function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}function id(){return'cap_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}function user(){let u=localStorage.getItem(K.UID);if(!u){u=(crypto&&crypto.randomUUID)?crypto.randomUUID():'user_'+Math.random().toString(36).slice(2,12);localStorage.setItem(K.UID,u)}return u}function msg(t){let e=document.getElementById('toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}function tpl(){return T.find(x=>x.id===S.tpl)||T[0]}function plan(){return localStorage.getItem(K.PLAN)||'starter'}function tier(){return plan()==='pro'?'pro':'starter'}
function canonicalOf(t){return (t&&t.canonical)|| 'Opportunity'}
/* Quick template switch on the capture screen. Lists every template grouped
   by tier; Pro templates are disabled for starter plans (use "See all" to
   upgrade). Selecting one swaps the active template in place, no navigation. */
function tplOptions(cur){let pro=tier()==='pro';let mk=x=>'<option value="'+x.id+'"'+(x.id===cur.id?' selected':'')+((x.tier==='pro'&&!pro)?' disabled':'')+'>'+esc(x.name)+((x.tier==='pro'&&!pro)?' (Pro)':'')+'</option>';let st=T.filter(x=>x.tier!=='pro').map(mk).join('');let pr=T.filter(x=>x.tier==='pro').map(mk).join('');return '<optgroup label="Starter">'+st+'</optgroup><optgroup label="Pro">'+pr+'</optgroup>'}
function setTemplate(v){let t=T.find(x=>x.id===v);if(!t)return;if(t.tier==='pro'&&tier()!=='pro'){location.href='templates.html';return}S.tpl=v;localStorage.setItem(K.TPL,v);render()}

/* ---- Owner Style + intent, read from onboarding profile (best-effort) ---- */
function ownerStyle(){let pr=read(K.PROFILE,{})||{};return {name:pr.fullName||pr.name||'',greeting:pr.voiceGreeting||pr.greeting||'',opening:pr.voiceOpening||pr.opening||'',conversationRef:pr.voiceConversationRef||'',nextStepStyle:pr.voiceNextStep||'',signOff:pr.voiceSignoff||pr.signOff||'',voiceEmphasise:pr.voiceEmphasise||'',voiceAvoid:pr.voiceAvoid||''}}
function userIntent(){let pr=read(K.PROFILE,{})||{};let primary=pr.intentPrimary||pr.networkingPrimary||localStorage.getItem('tapd_user_intent')||null;let secondary=pr.intentSecondary||[];return primary?{primary:primary,secondary:Array.isArray(secondary)?secondary:[]}:null}

function injectRecGuidanceCss(){if(document.getElementById('tapdRecGuidanceCss'))return;let s=document.createElement('style');s.id='tapdRecGuidanceCss';s.textContent=`
.rec-view{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;background:var(--bg,#F6F2EA);text-align:left}
.rec-header{flex:none;padding:16px 20px;background:rgba(246,242,234,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--soft,#EAE2D2);display:flex;justify-content:space-between;align-items:center;gap:14px}
.rec-template{font-family:var(--font-display,serif);font-size:18px;font-weight:800;line-height:1.2}
.rec-timer{font-family:var(--font-mono,monospace);font-size:18px;font-weight:900;color:var(--pro,#7C2D3F);font-variant-numeric:tabular-nums;display:flex;align-items:center;gap:8px;white-space:nowrap}
.rec-dot{width:10px;height:10px;border-radius:50%;background:var(--pro,#7C2D3F);animation:recPulse 1.6s infinite}
.rec-timer.paused .rec-dot{animation:none;background:var(--faint,#95887A)}
@keyframes recPulse{0%,100%{opacity:1}50%{opacity:.3}}
.rec-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 20px 24px}
.rec-section{margin-bottom:22px}.rec-section-title{font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint,#95887A);font-weight:800;margin-bottom:10px}
.rec-chips{display:flex;flex-wrap:wrap;gap:8px}.rec-chip{background:var(--accent-bg,#E8EFEF);color:var(--accent,#1E4F5C);border-radius:999px;padding:7px 12px;font-size:13px;font-weight:800}
.rec-warn-chip{background:var(--pro-bg,#F5E8EC);color:var(--pro,#7C2D3F);border-radius:999px;padding:7px 12px;font-size:13px;font-weight:800}
.rec-questions{list-style:none;padding:0;margin:0}.rec-questions li{padding:13px 14px;margin-bottom:8px;border-radius:12px;background:var(--surface,#fff);border:1px solid var(--soft,#EAE2D2);font-size:15px;line-height:1.45;color:var(--text,#181410);display:flex;gap:10px;cursor:pointer}.rec-questions li .num{color:var(--accent,#1E4F5C);font-weight:900;flex:none}.rec-questions li.asked{opacity:.55;background:var(--surface-warm,#FBF8F2)}.rec-questions li.asked .num{text-decoration:line-through}
.rec-hint{text-align:center;font-size:13px;color:var(--muted,#5C5247);background:var(--surface-warm,#FBF8F2);border:1px solid var(--soft,#EAE2D2);border-radius:12px;padding:12px;margin-bottom:18px}
.rec-controls{flex:none;padding:16px 20px;padding-bottom:max(16px,env(safe-area-inset-bottom));background:rgba(246,242,234,.96);backdrop-filter:blur(12px);border-top:1px solid var(--soft,#EAE2D2);display:flex}.rec-one-btn{width:100%;border:0;border-radius:18px;padding:16px 18px;font:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;min-height:70px;background:var(--pro,#7C2D3F);color:#fff;box-shadow:0 12px 32px rgba(124,45,63,.22)}.rec-one-btn .main{display:block;font-size:17px;font-weight:900;line-height:1.1}.rec-one-btn .sub{display:block;font-size:11px;font-weight:800;opacity:.82;margin-top:4px;letter-spacing:.02em}.rec-one-btn.paused{background:var(--accent,#1E4F5C);box-shadow:0 12px 32px rgba(30,79,92,.20)}.rec-one-btn.stopping{transform:scale(.985);filter:brightness(.92)}
.pre-guide{margin-top:24px;padding:18px;border:1px solid var(--soft,#EAE2D2);border-radius:18px;background:var(--surface-warm,#FBF8F2);text-align:left}.context-required{margin:16px 0 0;padding:14px 16px;border:1px solid var(--pro,#7C2D3F);background:var(--pro-bg,#F5E8EC);color:var(--pro,#7C2D3F);border-radius:14px;font-size:14px;font-weight:800;line-height:1.45}.capture-btn.needs-context{background:linear-gradient(145deg,#FBF8F2,#EAE2D2);box-shadow:none;border:1px solid var(--border-mid,#D9CDB6);color:var(--muted,#5C5247)}.pre-guide .rec-section{margin-bottom:18px}.pre-guide .rec-section:last-child{margin-bottom:0}.pre-guide-title{font-family:var(--font-display,serif);font-size:20px;font-weight:800;margin-bottom:6px}.pre-guide-copy{font-size:14px;color:var(--muted,#5C5247);line-height:1.45;margin-bottom:16px}
.rec-controls{gap:12px}.rec-two-btn{flex:1;border:0;border-radius:18px;padding:16px;font:inherit;font-size:16px;font-weight:900;cursor:pointer;min-height:60px}.rec-two-btn.pause{background:var(--surface,#fff);border:1px solid var(--soft,#EAE2D2);color:var(--text,#181410)}.rec-two-btn.stop{background:var(--pro,#7C2D3F);color:#fff;box-shadow:0 12px 32px rgba(124,45,63,.22)}
.proc-view{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg,#F6F2EA);text-align:center;padding:30px}
.proc-spinner{width:46px;height:46px;border-radius:50%;border:4px solid var(--soft,#EAE2D2);border-top-color:var(--accent,#1E4F5C);animation:procSpin 0.9s linear infinite;margin-bottom:22px}
@keyframes procSpin{to{transform:rotate(360deg)}}
.proc-title{font-family:var(--font-display,serif);font-size:22px;font-weight:800;margin-bottom:8px}
.proc-sub{font-size:14px;color:var(--muted,#5C5247);max-width:320px;line-height:1.5}
.proc-step{margin-top:18px;font-family:var(--font-mono,monospace);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint,#95887A)}`;document.head.appendChild(s)}
injectRecGuidanceCss();
function readyGuide(t){let signals=(t.signals||[]).map(s=>`<span class="rec-chip">${esc(s)}</span>`).join(''),questions=(t.questions||[]).map((q,i)=>`<li><span class="num">${i+1}.</span><span>${esc(q)}</span></li>`).join(''),warn=(t.signsNotReady&&t.signsNotReady.length)?`<div class="rec-section"><div class="rec-section-title">Signs it may not be ready</div><div class="rec-chips">${t.signsNotReady.map(s=>`<span class="rec-warn-chip">${esc(s)}</span>`).join('')}</div></div>`:'';return `<div class="pre-guide"><div class="pre-guide-title">Before you capture</div><div class="pre-guide-copy">Quickly glance at what this template listens for. You do not need to ask every question — the conversation can stay natural.</div><div class="rec-section"><div class="rec-section-title">Signals to listen for</div><div class="rec-chips">${signals}</div></div>${warn}<div class="rec-section"><div class="rec-section-title">Questions you can use</div><ol class="rec-questions">${questions}</ol></div></div>`}

function dateNow(){let d=new Date();return d.toLocaleDateString([], {day:'2-digit',month:'short',year:'numeric'})+' • '+d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
function render(){document.getElementById('actionBar').style.display='none';document.getElementById('view').innerHTML=S.screen==='ready'?ready():S.screen==='recording'?recording():S.screen==='processing'?processing():S.screen==='review'?review():saved();bind();window.scrollTo(0,0)}
function side(){let e=S.ev;if(!e)return `<p class="side-copy">Add the event, area, or session before recording. This context is reused for every capture until you change it.</p><button class="button-ghost" id="evBtn" style="width:100%">Add capture context</button>`;return `<div class="detail"><div>📅</div><div><div class="k">Context</div><div class="v">${esc(e.name)}</div></div></div><div class="detail"><div>⌖</div><div><div class="k">Area</div><div class="v">${esc(e.location||'Not set')}</div></div></div><div class="detail"><div>⇄</div><div><div class="k">Session</div><div class="v">${esc(e.session||'Current / general')}</div></div></div><button class="button-ghost" id="evBtn" style="width:100%">Edit / start new context</button>`}
function ready(){let t=tpl(),e=S.ev,hasContext=!!(e&&e.name&&e.location);return `<div class="wrap"><section class="main-card"><div class="capture-head"><div style="flex:1;min-width:0"><div class="label">Using template</div><div class="template-name">${esc(t.name)}<span class="badge ${t.tier==='pro'?'pro':''}">${t.tier==='pro'?'Pro':'Starter'}</span></div><div class="tpl-quick-row" style="display:flex;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap"><span class="tpl-quick-label" style="font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint,#95887A);font-weight:800">Quick switch</span><select class="tpl-quick" id="tplQuick" style="flex:1;min-width:200px;padding:11px 12px;border:1px solid var(--soft,#EAE2D2);border-radius:12px;background:var(--surface,#fff);font:inherit;font-size:14px;font-weight:700;color:var(--text,#181410);cursor:pointer">${tplOptions(t)}</select><a class="button-ghost" id="tplBtn" href="templates.html">See all templates →</a></div></div></div><div class="event-strip"><div>${hasContext?`<strong>Capture context:</strong> ${esc([e.name,e.session,e.location,e.date].filter(Boolean).join(' • '))}`:'<em>Add the event, area, or session before recording so this capture lands in the right place.</em>'}</div><button class="button-ghost" id="evBtn2">${hasContext?'Edit context':'Add context'}</button></div>${!hasContext?'<div class="context-required">Before recording, add the event/area context. Person name and role can be filled in later or inferred from the conversation.</div>':''}<div class="capture-stage"><div class="soundwave"></div><button class="capture-btn ${hasContext?'':'needs-context'}" id="capBtn"><span class="people">👥</span><span>${hasContext?'Capture this moment':'Add context first'}</span></button><div class="capture-hint">${hasContext?'Tap to start recording. You can stop any time.':'This context will be reused for the next person too — like cloning the event/session.'}</div>${readyGuide(t)}<div class="trust-row"><div class="trust-item"><span class="trust-ico">◉</span><span><strong>Template selected</strong><br>${esc(t.name)}</span></div><div class="trust-item"><span class="trust-ico">◎</span><span><strong>Context aware</strong><br>${hasContext?'Ready for this session':'Needs event/area'}</span></div><div class="trust-item"><span class="trust-ico">◇</span><span><strong>Private & secure</strong><br>Only you can see this</span></div></div></div></section><aside class="side-card"><div class="side-title"><div class="side-icon">🗓</div><h2>Capture Context</h2></div>${side()}</aside></div>`}
function recording(){let t=tpl(),signals=(t.signals||[]).map(s=>`<span class="rec-chip">${esc(s)}</span>`).join(''),questions=(t.questions||[]).map((q,i)=>`<li data-q="${i}"><span class="num">${i+1}.</span><span>${esc(q)}</span></li>`).join(''),warn=(t.signsNotReady&&t.signsNotReady.length)?`<div class="rec-section"><div class="rec-section-title">Signs it may not be ready</div><div class="rec-chips">${t.signsNotReady.map(s=>`<span class="rec-warn-chip">${esc(s)}</span>`).join('')}</div></div>`:'';return `<div class="rec-view" id="recView"><div class="rec-header"><span class="rec-template">${esc(t.name)}</span><span class="rec-timer" id="recTimer"><span class="rec-dot"></span><span id="time">0:00</span></span></div><div class="rec-body"><div id="recWarn" class="context-required" style="display:none"></div><div class="rec-hint">Conversations flow naturally — these are here if you want them. You do not need to ask them all.</div><div class="rec-section"><div class="rec-section-title">Signals to listen for</div><div class="rec-chips">${signals}</div></div>${warn}<div class="rec-section"><div class="rec-section-title">Questions</div><ol class="rec-questions" id="recQuestions">${questions}</ol></div></div><div class="rec-controls"><button class="rec-two-btn pause" id="recPauseBtn" type="button">⏸ Pause</button><button class="rec-two-btn stop" id="recStopBtn" type="button">⏹ Stop &amp; review</button></div></div>`}
function processing(){return `<div class="proc-view"><div class="proc-spinner"></div><div class="proc-title" id="procTitle">Transcribing your conversation</div><div class="proc-sub" id="procSub">This usually takes under a minute. We’re turning the recording into a structured follow-up.</div><div class="proc-step" id="procStep">Reading the conversation…</div></div>`}
/* Draft status that respects Needs You / missing details, not just "Draft Ready". */
function draftStatusLabel(ai,p){if(ai&&ai.safeToSend&&ai.safeToSend.status==='needs_you')return'Needs You';if(ai&&Array.isArray(ai.needsYouReasons)&&ai.needsYouReasons.length)return'Needs You';if(!(p&&p.name))return'Draft prepared — needs details';if(ai&&ai.safeToSend&&ai.safeToSend.status==='not_yet')return'Draft prepared — needs details';return'Draft Ready'}
/* What TAPDconnex understood — read-only AI relationship read, shown after
   transcription when data exists. Never asked from the user. */
function aiReadBlock(ai){if(!ai)return'';
  var hr=ai.humanReads||{},an=hr.anchorRead||{},im=hr.imprintRead||{},op=hr.openingRead||{},intel=hr.intelligenceRead||{},rr=ai.relationshipRead||{},sts=ai.safeToSend||{},sec=[];
  function box(t,inner){return inner?'<div class="ai-read-sec"><div class="ai-read-title">'+t+'</div><div class="ai-read-body">'+inner+'</div></div>':''}
  function line(k,v){return v?'<div class="ai-read-line">'+(k?'<span class="ai-read-k">'+k+'</span> ':'')+esc(v)+'</div>':''}
  function arr(a){return Array.isArray(a)?a.filter(Boolean):[]}
  function quotes(a){a=arr(a);return a.length?a.map(function(q){return'<div class="ai-read-quote">“'+esc(q)+'”</div>'}).join(''):''}
  function chips(a){a=arr(a);return a.length?'<div class="ai-read-chips">'+a.map(function(x){return'<span class="ai-read-chip">'+esc(x)+'</span>'}).join('')+'</div>':''}
  function joinLine(k,a){a=arr(a);return a.length?line(k,a.join('; ')):''}
  var ENERGY={warm:'Warm',curious:'Curious',thoughtful:'Thoughtful',analytical:'Analytical',connector:'Connector','fast-moving':'Fast-moving',practical:'Practical',reflective:'Reflective'};
  var OPEN={closed:'Kept it closed',curious:'Curious, but guarded',engaged:'Genuinely engaged',world_entry:'Let you into their world',trusted:'Spoke with real trust',collaborative:'Already collaborative'};
  var CVC={curiosity_only:'Curiosity, not commitment yet',investment:'Real investment — shared context or effort',commitment_forming:'Commitment forming — a concrete step emerged'};
  var PROTECT={chase:'Worth chasing',thoughtful_follow_up:'Worth a thoughtful follow-up',monitor:'Monitor — don\'t chase yet',do_not_chase:'Don\'t chase — not enough signal yet'};
  // 1. What mattered
  sec.push(box('What mattered',line('',an.whatTheyCaredAbout)+quotes(an.theirWords)+chips(an.specificsNamed)+joinLine('You offered:',an.whatIOffered)+line('Open thread:',an.openThread)));
  // 2. What stayed with me
  var m2=line('',im.whatStuckWithMe)+line('Distinctive:',im.distinctiveDetail)+(ENERGY[im.energyTheyBrought]?line('Energy:',ENERGY[im.energyTheyBrought]):'')+line('Seemed to value:',im.whatSeemedImportantToThem)+line('Worth remembering:',im.whyRememberThem);
  if(!m2)m2=chips(ai.memoryAnchors);
  sec.push(box('What stayed with me',m2));
  // 3. How open they were
  sec.push(box('How open they were',(OPEN[op.level]?'<strong>'+esc(OPEN[op.level])+'</strong>'+(op.summary?'<br>':''):'')+(op.summary?esc(op.summary):'')+joinLine('World-entry:',op.worldEntrySignals)+joinLine('Access offered:',op.permissionSignals)+joinLine('Opened up about:',op.vulnerabilitySignals)));
  // 4. What you might miss
  var m4=(CVC[intel.curiosityVsCommitment]?line('',CVC[intel.curiosityVsCommitment]):'')+line('',intel.whatUserMightMiss)+(PROTECT[intel.protectEnergy]?line('',PROTECT[intel.protectEnergy]):'')+line('',intel.why);
  if(!m4&&(rr.label||rr.summary))m4=(rr.label?'<strong>'+esc(rr.label)+'</strong>'+(rr.summary?'<br>':''):'')+(rr.summary?esc(rr.summary):'');
  sec.push(box('What you might miss',m4));
  // Needs you
  var needs=arr(ai.needsYouReasons);
  if(needs.length)sec.push(box('Needs you','<ul class="ai-read-list">'+needs.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>'));
  // 5. Best next move
  sec.push(box('Best next move',rr.bestMove?esc(rr.bestMove):''));
  sec.push(box('Why follow up',ai.whyFollowUp?esc(ai.whyFollowUp):''));
  if(sts.status){var map={yes:'✓ Safe to send',not_yet:'Not yet — refine first',needs_you:'Needs you — add details before sending'};sec.push(box('Safe to send?',esc(map[sts.status]||sts.status)+(sts.reason?'<br><span class="ai-read-muted">'+esc(sts.reason)+'</span>':'')))}
  sec=sec.filter(Boolean);
  if(!sec.length)return'';
  return'<div class="ai-read-card"><div class="label">What TAPDconnex understood</div>'+sec.join('')+'</div>'}
function review(){let t=tpl(),p=S.p||{};let aiNote=S.aiStatus==='structured'?'<div class="notice" style="background:var(--accent-bg,#E8EFEF);border-color:var(--accent,#1E4F5C)">AI structured this capture from the recording. Review and edit anything before saving.</div>':S.aiStatus==='transcribed'?'<div class="notice">Recording transcribed. AI structuring was unavailable, so fill the key details below.</div>':'<div class="notice">Recording captured. AI summary will populate this once transcription is connected. For now, save the key details while fresh.</div>';let _st=(p.nextSteps&&p.nextSteps.length?p.nextSteps:[p.nextStep||'']).slice(0,3);while(_st.length<3)_st.push('');let stepsHtml='<div class="field"><label>Next steps</label><div style="font-size:12px;color:var(--faint,#95887A);margin:-2px 0 8px">Three moves a senior colleague would suggest. Edit freely.</div>'+_st.map((s,i)=>'<input class="input" id="nx'+i+'" style="margin-bottom:8px" placeholder="'+(i===0?'Most important move':i===1?'Then…':'And…')+'" value="'+esc(s)+'"></input>').join('')+'</div>';return`<div class="wrap"><section class="main-card"><div class="review-view"><div class="label">Review & save</div><h1 class="template-name" style="margin:12px 0 20px">Lock in the relationship</h1>${aiNote}<div class="form"><div class="row"><div class="field"><label>Who did you meet?</label><input class="input" id="nm" placeholder="Name" value="${esc(p.name)}"></div><div class="field"><label>Company</label><input class="input" id="co" placeholder="Company" value="${esc(p.company)}"></div></div><div class="field"><label>Role / title</label><input class="input" id="ro" placeholder="e.g. Head of Partnerships" value="${esc(p.role)}"></div><div class="field"><label>What was discussed</label><textarea class="textarea" id="su" placeholder="What mattered, why it is worth following up…">${esc(p.summary)}</textarea></div>${stepsHtml}${aiReadBlock(S.ai)}<div class="intelligence-card"><div class="label">Relationship intelligence</div><div class="intelligence-grid"><div class="intel-chip"><strong>Draft status</strong>${draftStatusLabel(S.ai,p)}</div><div class="intel-chip"><strong>AI status</strong>${S.aiStatus==='structured'?'AI structured':S.aiStatus==='transcribed'?'Transcribed only':'Manual'}</div><div class="intel-chip"><strong>Completeness</strong>${(function(){var _pc=completenessOf(S.ai,p);return _pc+'% — '+completenessStatus(_pc)})()}</div></div>${(function(){var _w=completenessWhy(S.ai);return _w?'<div style="font-size:13px;color:var(--muted,#5C5247);margin-top:10px;line-height:1.45"><strong style="color:var(--accent,#1E4F5C)">Why:</strong> '+esc(_w)+'</div>':''})()}</div></div></div></section><aside class="side-card"><div class="side-title"><div class="side-icon">▤</div><h2>${esc(t.name)}</h2></div><p class="side-copy">This capture will be saved with the current template and event context.</p>${side()}</aside></div>`}
function saved(){if(S.queued){let _e=S.ev&&S.ev.name?esc([S.ev.name,S.ev.session,S.ev.location].filter(Boolean).join(' · ')):'your event';let _t=esc(tpl().name);return `<div class="saved-view"><div style="font-size:54px;color:var(--success)">✓</div><h1 class="template-name" style="margin:12px 0">Captured safely</h1><p class="side-copy" style="margin-bottom:4px"><strong>${_e}</strong></p><p class="side-copy" style="margin-bottom:14px">Template: ${_t}</p><p class="side-copy">Preparing your follow-up in the Relationship Hub. You can start your next capture now.</p><div style="max-width:430px;margin:26px auto;display:grid;gap:12px"><button class="btn btn-primary" id="again">Start next capture</button><a class="btn btn-secondary" href="relationship-hub.html">View in Hub</a></div></div>`;}return `<div class="saved-view"><div style="font-size:54px;color:var(--success)">✓</div><h1 class="template-name" style="margin:12px 0">Saved to your Hub.</h1><p class="side-copy">${esc(S.last||'This person')} is in your Relationship Hub.</p><div style="max-width:430px;margin:26px auto;display:grid;gap:12px"><a class="btn btn-primary" href="relationship-hub.html">Go to Relationship Hub</a><button class="btn btn-secondary" id="again">👥 Capture another person</button></div></div>`}
function bind(){let a=id=>document.getElementById(id);if(S.screen==='ready'){a('capBtn').onclick=()=>{if(!(S.ev&&S.ev.name&&S.ev.location)){eventBox();return;}start()};if(a('tplBtn'))a('tplBtn').onclick=()=>{location.href='templates.html'};if(a('tplQuick'))a('tplQuick').onchange=()=>setTemplate(a('tplQuick').value);if(a('topTemplates'))a('topTemplates').onclick=()=>{location.href='templates.html'};(a('evBtn')||{}).onclick=eventBox;(a('evBtn2')||{}).onclick=eventBox}if(S.screen==='recording'){document.getElementById('actionBar').style.display='none';bindOneRecordingButton();let q=document.getElementById('recQuestions');if(q)q.onclick=e=>{let li=e.target.closest('li');if(li)li.classList.toggle('asked')}}if(S.screen==='review'){document.getElementById('actionBar').style.display='block';document.getElementById('actionInner').innerHTML='<button class="btn btn-secondary" id="discard">Discard</button><button class="btn btn-primary" id="save">Save to Relationship Hub</button>';a('save').onclick=save;a('discard').onclick=()=>{S.p={};S.ai=null;S.aiStatus='idle';S.gutFeel=null;S.finishing=false;S.captureId=null;S.screen='ready';render()}}if(S.screen==='saved')a('again').onclick=()=>{S.p={};S.ai=null;S.aiStatus='idle';S.transcript='';S.blob=null;S.gutFeel=null;S.queued=false;S.finishing=false;S.captureId=null;S.screen='ready';render()}}
/* ============================================================
   STEP A — Capture robustness helpers.
   Wake Lock keeps the screen alive; the visibility handler detects
   backgrounding (which can drop mic audio mid-record on mobile) and
   warns honestly rather than losing words silently. Paired with
   S.rec.start(3000) in start(), which flushes audio to S.chunks every
   3s, so an interruption costs seconds — not the whole recording.
   ============================================================ */
async function acquireWakeLock(){try{if('wakeLock'in navigator&&navigator.wakeLock&&navigator.wakeLock.request){S.wakeLock=await navigator.wakeLock.request('screen')}}catch(e){S.wakeLock=null}}
async function releaseWakeLock(){try{if(S.wakeLock){await S.wakeLock.release()}}catch(e){}S.wakeLock=null}
function showRecWarning(){var w=document.getElementById('recWarn');if(w){w.style.display='block';w.textContent='⚠ App moved to the background — some audio may be missing. Keep this screen open while recording.'}}
function onVisibilityChange(){if(document.visibilityState==='hidden'){S.interrupted=true}else{if(S.interrupted)showRecWarning();if(!S.wakeLock&&S.rec&&S.rec.state==='recording')acquireWakeLock()}}
/* Recording window cap. Starter = 10 minutes. The extra 5 minutes for Pro is
   intentionally PARKED for now (a future plan decision tied to token cost vs
   the value of the $14 plan). To change the cap, adjust REC_LIMIT_SEC. */
const REC_LIMIT_SEC=600;
function showRecLimit(){try{msg('You\'ve reached the 10-minute recording window — saving your capture.')}catch(e){}var w=document.getElementById('recWarn');if(w){w.style.display='block';w.textContent='⏱ You\'ve reached the 10-minute recording window. Saving your capture…'}}
async function start(){if(!(S.ev&&S.ev.name&&S.ev.location)){eventBox();return;}S.chunks=[];S.interrupted=false;S.audioIncomplete=false;S.queued=false;S.finishing=false;S.captureId=null;S.recCapped=false;if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==='undefined'){S.screen='review';render();return}try{S.stream=await navigator.mediaDevices.getUserMedia({audio:true});S.rec=new MediaRecorder(S.stream);S.rec.ondataavailable=e=>{if(e.data&&e.data.size)S.chunks.push(e.data)};S.rec.onstop=finish;S.rec.start(3000);acquireWakeLock();document.addEventListener('visibilitychange',onVisibilityChange);S.t0=Date.now();S.paused=false;S.pausedMs=0;S.pauseStart=0;S.screen='recording';render();S.timer=setInterval(()=>{let now=S.paused?S.pauseStart:Date.now();let s=Math.max(0,Math.floor((now-S.t0-S.pausedMs)/1000));let el=document.getElementById('time');if(el)el.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');if(s>=REC_LIMIT_SEC&&!S.recCapped){S.recCapped=true;showRecLimit();stop()}},250)}catch(e){S.screen='review';render()}}
function updateRecControlButton(){var p=document.getElementById('recPauseBtn'),tm=document.getElementById('recTimer');if(tm)tm.classList.toggle('paused',!!S.paused);if(!p)return;p.textContent=S.paused?'▶ Resume':'⏸ Pause'}
function bindOneRecordingButton(){var p=document.getElementById('recPauseBtn'),s=document.getElementById('recStopBtn');if(p)p.onclick=pauseRec;if(s)s.onclick=stop;updateRecControlButton()}
function pauseRec(){if(!S.rec)return;if(!S.paused){S.paused=true;S.pauseStart=Date.now();try{if(S.rec.state==='recording')S.rec.pause()}catch(e){}}else{S.paused=false;S.pausedMs+=Date.now()-S.pauseStart;try{if(S.rec.state==='paused')S.rec.resume()}catch(e){}}updateRecControlButton()}function stop(){if(S.finishing)return;S.finishing=true;S.captureId=S.captureId||id();var sb=document.getElementById('recStopBtn');if(sb){sb.disabled=true;sb.textContent='Saving…'}clearInterval(S.timer);S.dur=(S.paused?S.pauseStart:Date.now())-S.t0-S.pausedMs;if(S.rec&&S.rec.state!=='inactive')S.rec.stop();else finish()}

/* ============================================================
   finish() — THE NEW PIPELINE
   blob -> /api/transcribe -> /api/process-capture -> map -> review.
   Falls back gracefully to the manual review form at every hop.
   ============================================================ */
function finish(){releaseWakeLock();document.removeEventListener('visibilitychange',onVisibilityChange);if(S.interrupted)S.audioIncomplete=true;try{if(S.chunks.length)S.blob=new Blob(S.chunks,{type:'audio/webm'})}catch(e){}if(S.stream)S.stream.getTracks().forEach(t=>t.stop());S.gutFeel=null;showGutFeel(function(gf){S.gutFeel=gf;enqueueOrProcess()})}

/* ============================================================
   GUT FEEL — one-tap initial relationship read. A human instinct signal
   captured after Stop, before AI. Stored as initialGutFeel / gutFeel:
     something_here | good_connection | no_spark | hard_to_read | null
   HARD RULE: Gut Feel must never change signalScore, confidence, the 49
   gate, or the 70 floor. It only travels alongside the capture as a
   human read / display hint.
   ============================================================ */
var _gutSel=null;
var _gutResolve=null;
var GUT_FEEL_LABELS={something_here:'🔥 There\'s something here',good_connection:'🤝 Good connection',no_spark:'👋 Good to meet, no spark',hard_to_read:'🤔 Hard to read'};
var GUT_FEEL_MOMENTUM_HINTS={something_here:'building',good_connection:'steady',no_spark:'fading',hard_to_read:null};
function gutFeelLabel(value){return GUT_FEEL_LABELS[value]||null}
function gutMomentumHint(value){return GUT_FEEL_MOMENTUM_HINTS[value]||null}
function _gutTap(e){var b=e.target.closest('[data-value]');if(!b)return;var v=b.getAttribute('data-value');_gutSel=v;var btns=document.querySelectorAll('.gut-btn');for(var i=0;i<btns.length;i++)btns[i].classList.remove('selected');b.classList.add('selected');var done=document.getElementById('gut-done-btn');if(done)done.disabled=!_gutSel}
function _gutHide(){var scr=document.getElementById('gut-feel-screen');if(scr)scr.style.display='none';_gutResolve=null}
function showGutFeel(onComplete){_gutSel=null;var scr=document.getElementById('gut-feel-screen');if(!scr){onComplete(null);return}var done=document.getElementById('gut-done-btn');if(done)done.disabled=true;var btns=document.querySelectorAll('.gut-btn');for(var i=0;i<btns.length;i++)btns[i].classList.remove('selected');_gutResolve=onComplete;scr.style.display='flex'}
function _gutWire(){var scr=document.getElementById('gut-feel-screen');if(!scr)return;scr.addEventListener('click',_gutTap);var done=document.getElementById('gut-done-btn');if(done)done.onclick=function(){var cb=_gutResolve;var value=_gutSel||null;_gutHide();if(cb)cb(value)};var skip=document.getElementById('gut-skip-btn');if(skip)skip.onclick=function(){var cb=_gutResolve;_gutHide();if(cb)cb(null)}}
_gutWire();

/* ============================================================
   SPLIT-MOMENT ENQUEUE (Step D). Upload the audio, create a queued
   capture row, kick the worker, and free the user immediately — the
   card appears in the Hub and fills in as the worker runs. Falls back
   to the in-browser pipeline when there is no audio or no queue.
   ============================================================ */
async function enqueueOrProcess(){
  if(!S.blob){runPipeline();return}
  S.screen='processing';render();setProc('Saving your capture','Uploading securely…','Queueing');
  try{
    const audioBase64=await blobToBase64(S.blob);
    const t=tpl();const cid=S.captureId||id();S.captureId=cid;
    const cap={id:cid,userId:user(),name:null,company:null,role:null,
      event:S.ev&&S.ev.name?[S.ev.name,S.ev.session,S.ev.location].filter(Boolean).join(' · '):'No event set',
      eventKey:(S.ev&&S.ev.key)||null,template:t.id,templateName:t.name,
      capturedAt:new Date().toISOString(),priority:gutPriority(S.gutFeel,'worth-exploring'),
      gutFeel:S.gutFeel,initialGutFeel:S.gutFeel,gutFeelLabel:gutFeelLabel(S.gutFeel),gutMomentumHint:gutMomentumHint(S.gutFeel),completeness:0,audioIncomplete:!!S.audioIncomplete};
    const jobPayload={template:{id:t.id,name:t.name,signals:t.signals,canonical:canonicalOf(t)},
      ownerStyle:ownerStyle(),userIntent:userIntent(),
      eventContext:S.ev?{name:S.ev.name,date:S.ev.date}:null,gutFeel:S.gutFeel,gutFeelLabel:gutFeelLabel(S.gutFeel),gutMomentumHint:gutMomentumHint(S.gutFeel)};
    const r=await postJSON('/api/enqueue-job',{userId:cap.userId,capture:cap,audioBase64:audioBase64,mime:S.blob.type||'audio/webm',jobPayload:jobPayload});
    if(!r||!r.ok){runPipeline();return}
    saveQueuedLocal(cap);
    S.last=null;S.queued=true;S.screen='saved';render();msg('Captured — writing up your follow-up')
  }catch(e){runPipeline()}
}
function saveQueuedLocal(cap){
  let c={id:cap.id,name:null,company:null,role:null,
    signal:sig(tpl()),signalLabel:'Writing up…',evidence:'Processing your capture',
    secondaryThread:null,priority:cap.priority,action:'Being written up…',nextSteps:[],context:'',
    capturedAt:cap.capturedAt,capturedDaysAgo:0,event:cap.event,eventKey:cap.eventKey,
    outcome:'active',template:cap.template,templateName:cap.templateName,
    needsNameConfirmation:false,nameConfidence:null,completeness:0,transcriptConfidence:null,
    gutFeel:cap.gutFeel,initialGutFeel:cap.initialGutFeel||cap.gutFeel||null,gutFeelLabel:cap.gutFeelLabel||gutFeelLabel(cap.gutFeel),gutMomentumHint:cap.gutMomentumHint||gutMomentumHint(cap.gutFeel),hasAudio:true,audioDurationMs:S.dur||0,
    aiStatus:'queued',draftStatus:'processing',
    intelligenceFrameworkVersion:(window.TAPD_REF_ENGINE&&TAPD_REF_ENGINE.VERSION)||(window.TAPD_INTELLIGENCE&&TAPD_INTELLIGENCE.VERSION)||'1.4.0'};
  let list=read(K.CAP,[]).filter(x=>x.id!==c.id);list.unshift(c);localStorage.setItem(K.CAP,JSON.stringify(list))
}
function gutPriority(g,fb){if(!g)return fb;if(g==='something_here')return'act-soon';if(g==='good_connection')return'worth-exploring';if(g==='no_spark')return'keep-warm';if(g==='hard_to_read')return fb;return fb}

async function runPipeline(){
  // No blob at all (permissions denied / unsupported) -> straight to manual review.
  if(!S.blob){S.aiStatus='idle';S.screen='review';render();return}
  S.screen='processing';render();
  // 1) Transcribe
  let tx=null;
  try{
    setProc('Transcribing your conversation','Uploading the recording…','Saving audio');
    const audioBase64=await blobToBase64(S.blob);
    setProc('Transcribing your conversation','Reading the conversation…','Transcribing');
    tx=await postJSON('/api/transcribe',{audioBase64:audioBase64,mime:S.blob.type||'audio/webm'});
  }catch(e){tx=null}
  if(!tx||!tx.transcript){
    // Transcription unavailable (no key / placeholder / error) -> manual review.
    S.aiStatus='idle';S.transcript='';S.transcriptConfidence=null;S.screen='review';render();return;
  }
  S.transcript=tx.transcript;S.transcriptConfidence=tx.confidence||'medium';
  // 2) Structure via the master prompt
  let ai=null;
  try{
    setProc('Structuring the follow-up','Applying relationship intelligence…','Structuring');
    const t=tpl();
    ai=await postJSON('/api/process-capture',{
      transcript:S.transcript,
      template:{id:t.id,name:t.name,signals:t.signals,canonical:canonicalOf(t)},
      ownerStyle:ownerStyle(),
      userIntent:userIntent(),
      eventContext:S.ev?{name:S.ev.name,date:S.ev.date}:null,
      transcriptConfidence:S.transcriptConfidence,
      gutFeel:S.gutFeel
    });
  }catch(e){ai=null}
  if(ai&&ai.person){
    S.ai=ai;S.aiStatus='structured';
    S.p=aiToReviewForm(ai);
    S.screen='review';render();return;
  }
  // 3) Transcribed but not structured -> manual review, transcript preserved as summary seed.
  S.aiStatus='transcribed';
  S.p={name:'',company:'',role:'',summary:S.transcript.slice(0,600),signal:'',momentum:'',nextStep:'',nextSteps:[]};
  S.screen='review';render();
}

function setProc(title,sub,step){let a=document.getElementById('procTitle');if(a)a.textContent=title;let b=document.getElementById('procSub');if(b)b.textContent=sub;let c=document.getElementById('procStep');if(c)c.textContent=step}
function blobToBase64(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=()=>rej(new Error('read failed'));r.readAsDataURL(blob)})}
async function postJSON(url,body){const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!res.ok)return null;const j=await res.json();if(j&&(j.status==='placeholder'||j.status==='gated'))return null;return j}

/* Map the AI master-prompt JSON into the review form fields. */
function aiToReviewForm(ai){
  let momentum='';
  let steps=(ai.draft&&Array.isArray(ai.draft.nextSteps)?ai.draft.nextSteps:[]).filter(Boolean);
  let primary=(ai.draft&&ai.draft.nextStep)||steps[0]||'';
  if(!steps.length&&primary)steps=[primary];
  return {
    name:(ai.person&&ai.person.name)||'',
    company:(ai.person&&ai.person.company)||'',
    role:(ai.person&&ai.person.role)||'',
    summary:(ai.draft&&ai.draft.context)||'',
    signal:'',
    momentum:momentum,
    nextStep:primary,
    nextSteps:steps
  };
}

function pullForm(){let v=id=>(document.getElementById(id)||{}).value||'';let steps=['nx0','nx1','nx2'].map(i=>v(i).trim()).filter(Boolean);if(!steps.length&&v('nx').trim())steps=[v('nx').trim()];S.p={name:v('nm').trim(),company:v('co').trim(),role:v('ro').trim(),summary:v('su').trim(),signal:'',momentum:'',nextStep:steps[0]||'',nextSteps:steps}}
function complete(p){return Math.round([p.name,p.company,p.role,p.summary,p.nextStep].filter(Boolean).length/5*100)}
/* Completeness = 'is there enough understanding to act wisely?'. Prefer the
   AI's completeness_intelligence.overall_score; else a dynamic fallback built
   from what we actually have (never a hardcoded 40%). */
function completenessStatus(pct){pct=pct||0;if(pct>=85)return'Strong';if(pct>=65)return'Usable';if(pct>=40)return'Partial';return'Low'}
function completenessWhy(ai){var ci=ai&&ai.intelligence&&ai.intelligence.completeness_intelligence;return(ci&&ci.why_score_is_not_higher)||''}
function completenessOf(ai,p){var ci=ai&&ai.intelligence&&ai.intelligence.completeness_intelligence;if(ci&&typeof ci.overall_score==='number')return Math.max(0,Math.min(100,Math.round(ci.overall_score)));if(ai&&ai.completeness){var s=typeof ai.completeness.score==='number'?ai.completeness.score:(typeof ai.completeness==='number'?ai.completeness:null);if(typeof s==='number')return Math.max(0,Math.min(100,Math.round(s)))}p=p||{};var pts=0;if(p.name)pts+=10;if(p.company)pts+=8;if(p.role)pts+=7;if(p.summary&&String(p.summary).length>20)pts+=20;var st=(p.nextSteps&&p.nextSteps.length)?p.nextSteps.length:(p.nextStep?1:0);pts+=Math.min(20,st*8);if(ai&&ai.signal&&ai.signal.primary)pts+=10;if(ai&&Array.isArray(ai.memoryAnchors)&&ai.memoryAnchors.length)pts+=Math.min(10,ai.memoryAnchors.length*3);if(ai&&Array.isArray(ai.needsYouReasons)&&ai.needsYouReasons.length)pts+=5;if(S.ev&&S.ev.name)pts+=10;return Math.max(0,Math.min(100,Math.round(pts)))}
function pri(m,s){let v=(m||s||'').toLowerCase();if(/act|urgent|opportunity|buy|pilot|pricing|proposal/.test(v))return'act-soon';if(/low|warm|stay/.test(v))return'keep-warm';return'worth-exploring'}
function sig(t){if(t.id==='connector'||t.id==='community_access')return'connector';if(['strategic_partnership','advisory'].includes(t.id))return'collaboration';if(t.id==='stay_in_touch')return'stay';return'opportunity'}
function ctx(ev,p){return `${ev&&ev.name?'Met at '+[ev.name,ev.location,ev.session,ev.date].filter(Boolean).join(', ')+'.':'Captured conversation.'} ${p.summary||''}`.trim()}
function draft(p,c){let f=(p.name||'there').split(' ')[0];return `Hi ${f},\n\nGreat meeting you${c.event&&c.event!=='No event set'?' at '+c.event:''}. I captured this context so I could follow up properly: ${p.summary||'we had a useful conversation worth continuing.'}${p.nextStep?'\n\nSuggested next step: '+p.nextStep:''}\n\nBest,\n[Your name]`}

/* Map the AI priority from its structured signal, when present. */
function aiPriority(ai,fallbackPriority){
  if(!ai||!ai.signal)return fallbackPriority;
  const primary=ai.signal.primary;const sub=ai.signal.primarySubtype;
  const hi=['direct_opportunity','pilot_beta','investor','speaking_opportunity'];
  if(primary==='opportunity'&&hi.indexOf(sub)>=0)return'act-soon';
  if(primary==='stay')return'keep-warm';
  if(primary==='opportunity'||primary==='collaboration')return'worth-exploring';
  return fallbackPriority;
}

function save(){try{pullForm();let t=tpl(),e=S.ev,p=S.p,ai=S.ai,evText=e&&e.name?[e.name,e.session,e.location].filter(Boolean).join(' · '):'No event set';
  // Signal/label/priority: prefer AI structured output, fall back to legacy helpers.
  let signal=ai&&ai.signal&&ai.signal.primary?ai.signal.primary:sig(t);
  let signalLabel=ai&&ai.signal&&ai.signal.primaryLabel?ai.signal.primaryLabel:(p.signal||p.momentum||t.name+' capture');
  let evidence=ai&&ai.signal&&ai.signal.evidence?ai.signal.evidence:(p.summary||p.signal||p.nextStep||'Manual capture saved for review');
  let priority=aiPriority(ai,gutPriority(S.gutFeel,pri(p.momentum,p.signal)));
  let needsName=ai&&ai.verification?!!ai.verification.needsNameConfirmation:!p.name;
  let nameConf=ai&&ai.person&&ai.person.nameConfidence?ai.person.nameConfidence:(p.name?'confirmed':null);
  let completeness=completenessOf(ai,p);
  let secondary=ai&&ai.signal?ai.signal.secondary:null;
  let c={id:id(),name:p.name||null,company:p.company||null,role:p.role||null,
    signal:signal,signalLabel:signalLabel,evidence:evidence,secondaryThread:secondary,
    priority:priority,action:(ai&&ai.draft&&ai.draft.nextStep)||p.nextStep||'Review and decide the next step',
    nextSteps:(p.nextSteps&&p.nextSteps.length?p.nextSteps:((ai&&ai.draft&&Array.isArray(ai.draft.nextSteps))?ai.draft.nextSteps:[])).filter(Boolean),
    context:(ai&&ai.draft&&ai.draft.context)||ctx(e,p),capturedAt:new Date().toISOString(),capturedDaysAgo:0,
    event:evText,eventKey:e&&e.key?e.key:null,outcome:'active',template:t.id,templateName:t.name,
    needsNameConfirmation:needsName,nameConfidence:nameConf,completeness:completeness,
    transcriptConfidence:S.transcriptConfidence||null,gutFeel:S.gutFeel||null,initialGutFeel:S.gutFeel||null,gutFeelLabel:gutFeelLabel(S.gutFeel),gutMomentumHint:gutMomentumHint(S.gutFeel),
    hasAudio:!!S.blob,audioDurationMs:S.dur||0,
    aiStatus:S.aiStatus==='structured'?'ai_structured':(S.aiStatus==='transcribed'?'transcribed_only':(S.blob?'manual_pending_openai':'manual_entry')),
    draftStatus:'draft_ready',
    intelligence:(ai&&ai.intelligence)||null,momentumLevel:(ai&&ai.intelligence&&ai.intelligence.relationship_hub_record&&ai.intelligence.relationship_hub_record.momentumLevel)||null,
    intelligenceFrameworkVersion:(window.TAPD_REF_ENGINE&&TAPD_REF_ENGINE.VERSION)||(window.TAPD_INTELLIGENCE&&TAPD_INTELLIGENCE.VERSION)||'1.4.0'};
  c.draftMessage=(ai&&ai.draft&&ai.draft.message)||draft(p,c);
  let list=read(K.CAP,[]).filter(x=>x.id!==c.id);list.unshift(c);localStorage.setItem(K.CAP,JSON.stringify(list));
  if(window.TapdSync)TapdSync.pushCapture(c);
  S.last=c.name||'Unnamed contact';S.screen='saved';render();msg('Saved to Relationship Hub')}catch(e){console.error(e);msg('Could not save. Try again.')}}
function pickTemplate(){location.href='templates.html'}
function eventBox(){let e=S.ev||{};let sh=document.getElementById('eventSheet');sh.innerHTML=`<div class="grip"></div><h2>Capture context</h2><div class="sheet-sub">Set this once for the event, venue area, or session. It will be reused for every person you capture until you change it.</div><div class="form"><div class="field"><label>Event / context name</label><input class="input" id="en" value="${esc(e.name||'')}" placeholder="e.g. AI Expo, Startup Mixer, Coffee chat"></div><div class="row"><div class="field"><label>Area / location</label><input class="input" id="el" value="${esc(e.location||'')}" placeholder="e.g. Main hall, Johannesburg, FinTech track"></div><div class="field"><label>Session / room</label><input class="input" id="es" value="${esc(e.session||'')}" placeholder="Optional"></div></div><div class="field"><label>Date / time</label><input class="input" id="ed" value="${esc(e.date||dateNow())}"></div><button class="btn btn-primary" id="evSave">Save capture context</button></div>`;sh.querySelector('#evSave').onclick=()=>{let n=document.getElementById('en').value.trim(),loc=document.getElementById('el').value.trim();if(!n){msg('Add the event or context name');return}if(!loc){msg('Add the area or location');return}S.ev={name:n,location:loc,session:document.getElementById('es').value.trim(),date:document.getElementById('ed').value.trim(),key:slug(n+'-'+loc)+'-'+Date.now()};localStorage.setItem(K.EV,JSON.stringify(S.ev));close('eventOverlay');render();msg('Capture context saved')};open('eventOverlay')}
function slug(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)}
function open(x){document.getElementById(x).classList.add('show')}function close(x){document.getElementById(x).classList.remove('show')}['tplOverlay','eventOverlay'].forEach(x=>document.getElementById(x).onclick=e=>{if(e.target.id===x)close(x)});render();

/* ============================================================
   ROUND 8 — Gold-Star Calibration feedback capture (unchanged).
   ============================================================ */
(function () {
  const FEEDBACK_LEARNING_MAP = {
    wrong_priority: 'score_may_be_too_aggressive',
    missing_context: 'completeness_probe_needs_improvement',
    not_opportunity: 'opportunity_classification_too_aggressive',
    already_handled: 'closure_happened_off_platform',
    wrong_next_step: 'layer9_next_step_needs_correction',
    other: 'open_ended_for_review',
  };
  window.tapdSaveFeedback = async function tapdSaveFeedback({ engagementId, option, note }) {
    const record = {
      engagement_id: engagementId, type: 'interpretation', feedback_option: option,
      learning_signal: FEEDBACK_LEARNING_MAP[option] || FEEDBACK_LEARNING_MAP.other,
      note: note || null, created_at: new Date().toISOString(),
    };
    try {
      const client = window.supabase || window.supabaseClient || null;
      if (client && client.auth && typeof client.auth.getUser === 'function') {
        const { data: { user } } = await client.auth.getUser();
        const { error } = await client.from('feedback').insert({ ...record, user_id: user?.id || null });
        if (error) throw error;
        return { saved: true, via: 'supabase' };
      }
    } catch (e) { console.error('supabase feedback insert failed, falling back to local', e); }
    try {
      const key = 'tapd_feedback_queue';
      const queue = JSON.parse(localStorage.getItem(key) || '[]');
      queue.push(record); localStorage.setItem(key, JSON.stringify(queue));
      return { saved: true, via: 'local' };
    } catch (e) { console.error('local feedback save failed (non-blocking)', e); return { saved: false }; }
  };
  window.tapdFeedbackLearningMap = FEEDBACK_LEARNING_MAP;
})();
