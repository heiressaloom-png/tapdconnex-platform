const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

// Keep the original Owner Tools / Templates / Relationship Hub UI structure intact.
// This build step only removes obsolete external runtime references, cleans visible copy,
// and adds one final routing guard for the top buttons.
html = html.replace('<script src="/update-65b-navigation-guardrails.js"></script>', '');
html = html.replace('<script src="/update-68-owner-toggle-fix.js"></script>', '');
html = html.replace(/<script id="tapdCanonicalTopNavController">[\s\S]*?<\/script>/g, '');
html = html.replace(/<script id="tapdTopNavDesignCorrection">[\s\S]*?<\/script>/g, '');

// NFC URL clarity.
html = html.replace(/Your NFC Tag URI/g, 'Your NFC Profile URL');
html = html.replace(/Program this exact URL onto your NFC card\. Every tap opens your live profile\./g, 'This is the profile URL to program onto your NFC card. Every tap opens this live TAPD profile.');

// Relationship Hub copy and tab cleanup.
html = html.replace("['connections','captured','drafts','followUps','sent','waiting','archived']", "['connections','captured','followUps','sent']");
html = html.replace("var labels={connections:'Connections',captured:'Captured',drafts:'Drafts',\n          followUps:'Follow-Ups',sent:'Sent',waiting:'Waiting',archived:'Archived'};", "var labels={connections:'Connections',captured:'Awaiting Review',followUps:'Follow-Ups',sent:'Sent'};");
html = html.replace("'Connections','People who tapped your NFC card and sent their TAPD card. Accept to start capturing.'", "'Connections','People you\\'ve connected with. Connections from NFC taps and captured conversations appear here.'");
html = html.replace("'Captured Conversations','Recordings transcribed, not yet drafted.'", "'Awaiting Review','Captured conversations waiting for your review.'");
html = html.replace("'🎤','No captures yet','Tap the gold Capture button to record a conversation.'", "'🎤','Nothing awaiting review','Captured conversations will appear here before follow-up approval.'");
html = html.replace("onclick=\"rh56Tab('drafts')\"", "onclick=\"rh56Tab('captured')\"");
html = html.replace(/statusLabels=\{connections:'New',captured:'Captured',drafts:'AI Draft',/g, "statusLabels={connections:'New',captured:'Awaiting Review',drafts:'AI Draft',");
html = html.replace(/name:'Keep Warm'/g, "name:'Stay in Touch'");
html = html.replace(/id:'keep_warm'/g, "id:'stay_in_touch'");
html = html.replace(/keep_warm/g, 'stay_in_touch');

// ✅ vCard button upgrade — Option B.
// Old: outlined gold button, generic label "Save contact card to your phone"
// New: gold filled primary button, personalised name, explainer line underneath.
// The <span id="tapdVcardName"> is patched at runtime by the showConnected override below.
html = html.replace(
  /<button onclick="generateVCard\(\)" style="margin-top:12px[\s\S]*?Save contact card to your phone\s*<\/button>/,
  '<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.07);padding-top:14px;">'
  + '<button id="tapdVcardBtn" onclick="generateVCard()" style="width:100%;height:50px;border-radius:14px;background:linear-gradient(135deg,#EAB308,#ca8a04);border:none;color:#050505;font-family:\'Inter\',sans-serif;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;letter-spacing:-.1px;">'
  + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  + '<span>Save <span id="tapdVcardName">contact</span> to your contacts</span>'
  + '</button>'
  + '<p style="margin-top:8px;font-size:11px;color:rgba(255,255,255,.4);text-align:center;letter-spacing:.1px;">One tap \xb7 saves number, email &amp; profile</p>'
  + '</div>'
);

// ✅ FIX: String.raw preserves all \n \' \\ escape sequences so the injected
// script block arrives in index.html with correct JS syntax. Without it the
// template literal ate backslashes, breaking line 17299 with
// "missing ) after argument list".
const controller = String.raw`
<!-- UPDATE 69C: ACTIVE NAV + TEMPLATE CAPTURE WORKFLOW -->
<script id="tapdTopNavDesignCorrection">
(function(){
  if(window.__tapdTopNavDesignCorrection)return;
  window.__tapdTopNavDesignCorrection=true;

  var lastTap={key:'',at:0};
  var TEMPLATE_NAMES={
    direct_opportunity:'Direct Opportunity',
    connector_referral:'Connector / Referral',
    stay_in_touch:'Stay in Touch',
    pilot_beta:'Pilot / Beta Testing',
    collaboration:'Collaboration / Partnership',
    customer_discovery:'Customer Discovery',
    investor_funding:'Investor / Funding',
    strategic_partnership:'Strategic Partnership',
    speaking_media:'Speaking / Media',
    advisory_mentor:'Advisory / Mentor',
    community_access:'Community Access',
    custom:'Custom Template'
  };
  var TEMPLATE_HINTS={
    direct_opportunity:[
      'What brought this up for you today?',
      'What are you currently trying to solve or improve?',
      'What made this feel relevant or interesting?',
      'What would make this useful enough to explore properly?',
      'Would it make sense to continue this conversation after today?'
    ],
    connector_referral:[
      'Who came to mind when we were speaking about this?',
      'Why do you think this would be relevant for them?',
      'What would be the easiest way for me to explain it to them?',
      'Would a short intro message make it easier for you?',
      'Would you be comfortable making a light introduction after today?'
    ],
    stay_in_touch:[
      'What are you focused on at the moment?',
      'What kind of ideas or people are useful for you right now?',
      'What part of our conversation feels worth remembering?',
      'Would it be useful if I shared something relevant later?',
      'What would be a natural reason for us to stay connected?'
    ],
    pilot_beta:[
      'What would you be curious to test first?',
      'Where would this fit into how you currently work?',
      'What would make the test worthwhile for you?',
      'Who else would need to be involved before trying it?',
      'What would be a simple next step to explore a pilot?'
    ],
    collaboration:[
      'Where do you see overlap between what we both do?',
      'What would a small first collaboration look like?',
      'What would each side need to bring for this to work?',
      'What would need to be clear before moving forward?',
      'Would it make sense to explore one practical next step?'
    ],
    customer_discovery:[
      'How are you handling this today?',
      'What tends to be frustrating about the current way?',
      'When does this problem become most noticeable?',
      'What would a better outcome look like for you?',
      'What would make you consider changing what you use now?'
    ],
    investor_funding:[
      'What part of this space are you most interested in?',
      'What would you want to understand before taking this seriously?',
      'Does this feel aligned with the types of opportunities you usually look at?',
      'What questions or concerns would you expect someone to raise?',
      'Would it be useful if I sent a short summary, deck, or follow-up note?'
    ],
    strategic_partnership:[
      'Where do you think there could be mutual business value?',
      'What would make this useful for your side?',
      'Who normally needs to be involved in a partnership like this?',
      'Are there any timing issues, dependencies, or blockers I should know about?',
      'What would be the right next conversation if we wanted to explore this?'
    ],
    speaking_media:[
      'What audience are you trying to serve with this?',
      'What topic or angle do you think would be most useful for them?',
      'What made you think I could be a fit?',
      'What would you need from me to consider it properly?',
      'What is the timeline or next step for this opportunity?'
    ],
    advisory_mentor:[
      'Where do you think your experience could be most useful here?',
      'What have you seen others get wrong at this stage?',
      'What would you suggest I think about next?',
      'Would it make sense to stay connected around this topic?',
      'What would make this valuable or easy for you as well?'
    ],
    community_access:[
      'What kind of people are usually in that community?',
      'What makes someone a good fit?',
      'Why do you think it could be useful for me?',
      'What is the best way to be introduced or included?',
      'Is there anything I should prepare before reaching out?'
    ],
    custom:[
      'What is the main thing you want to understand from this conversation?',
      'What context would make the follow-up more useful?',
      'What is the most important thing to capture right now?',
      'What would a good outcome from this conversation look like?',
      'What is the clearest next step?'
    ]
  };

  function byId(id){return document.getElementById(id);}
  function now(){return Date.now?Date.now():(new Date()).getTime();}
  function txt(el){return (el&&el.textContent?el.textContent:'').replace(/\s+/g,' ').trim().toLowerCase();}
  function titleCaseFromId(id){return TEMPLATE_NAMES[id]||String(id||'Selected template').replace(/_/g,' ').replace(/\b\w/g,function(m){return m.toUpperCase();});}
  function getActiveTemplate(){try{return localStorage.getItem('tapd_active_template')||'direct_opportunity';}catch(e){return'direct_opportunity';}}
  function inVisitorMode(){
    try{var q=new URLSearchParams(location.search||'');return q.get('visitor')==='1'||q.get('mode')==='visitor'||q.get('view')==='visitor'||q.get('nfc')==='1'||document.body.classList.contains('tapd-hard-header-off');}catch(e){return false;}
  }

  function injectWorkspaceStyles(){
    if(byId('tapd69cWorkspaceStyles'))return;
    var style=document.createElement('style');
    style.id='tapd69cWorkspaceStyles';
    style.textContent='\n'
      +'#tapdHardOwnerHeader button{background:linear-gradient(135deg,#0ECEC0,#10B981)!important;border-color:#0ECEC0!important;color:#050505!important;font-weight:800!important;opacity:1!important;filter:none!important;}\n'
      +'#tapdHardOwnerHeader button.tapd-nav-active{background:linear-gradient(135deg,#EAB308,#ca8a04)!important;border-color:#EAB308!important;color:#050505!important;box-shadow:0 0 0 2px rgba(234,179,8,.30),0 8px 24px rgba(234,179,8,.22)!important;}\n'
      +'#connectBar,.connect-bar,.btn-connect,.connect-sheet{display:none!important;}\n'
      +'.tapd-template-action-bar{margin:0 0 14px;padding:13px;border-radius:16px;border:1px solid rgba(234,179,8,.24);background:linear-gradient(135deg,rgba(234,179,8,.10),rgba(234,179,8,.035));display:grid;gap:10px;}\n'
      +'.tapd-template-action-title{font-size:13px;font-weight:900;color:#F0F4F8;margin:0;}\n'
      +'.tapd-template-action-sub{font-size:11px;color:#8B9EB0;line-height:1.45;margin:2px 0 0;}\n'
      +'.tapd-template-action-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}\n'
      +'.tapd-template-capture-btn,.tapd-template-cheat-btn{height:42px;border-radius:13px;font-family:Inter,sans-serif;font-size:12px;font-weight:900;cursor:pointer;}\n'
      +'.tapd-template-capture-btn{background:linear-gradient(135deg,#EAB308,#ca8a04);border:1px solid #EAB308;color:#050505;}\n'
      +'.tapd-template-cheat-btn{background:rgba(255,255,255,.03);border:1px solid rgba(234,179,8,.22);color:#EAB308;}\n'
      +'@media(max-width:360px){.tapd-template-action-row{grid-template-columns:1fr}.tapd-template-capture-btn,.tapd-template-cheat-btn{height:40px}}\n'
      +'#tapdTemplateCheatSheet{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.38);opacity:0;pointer-events:none;transition:opacity .18s ease;}\n'
      +'#tapdTemplateCheatSheet.show{opacity:1;pointer-events:auto;}\n'
      +'.tapd-cheat-card{width:min(430px,calc(100vw - 24px));margin:0 12px 18px;background:#0D1117;border:1px solid rgba(234,179,8,.35);border-radius:22px;padding:18px 16px 16px;box-shadow:0 18px 60px rgba(0,0,0,.55);position:relative;font-family:Inter,sans-serif;}\n'
      +'.tapd-cheat-close{position:absolute;right:12px;top:10px;width:30px;height:30px;border-radius:999px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);color:#8B9EB0;font-size:18px;}\n'
      +'.tapd-cheat-kicker{font-size:10px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;color:#EAB308;margin-bottom:4px;}\n'
      +'.tapd-cheat-title{font-size:18px;font-weight:900;color:#F0F4F8;margin-bottom:6px;}\n'
      +'.tapd-cheat-sub{font-size:12px;line-height:1.55;color:#8B9EB0;margin-bottom:12px;padding-right:22px;}\n'
      +'.tapd-cheat-list{display:grid;gap:7px;margin-bottom:14px;}\n'
      +'.tapd-cheat-list span{font-size:12px;color:#F0F4F8;background:rgba(234,179,8,.07);border:1px solid rgba(234,179,8,.18);border-radius:12px;padding:9px 10px;}\n'
      +'.tapd-cheat-primary{width:100%;height:44px;border-radius:14px;border:1px solid #EAB308;background:linear-gradient(135deg,#EAB308,#ca8a04);color:#050505;font-size:13px;font-weight:900;font-family:Inter,sans-serif;}';
    document.head.appendChild(style);
  }

  function setActiveNav(action){
    var h=byId('tapdHardOwnerHeader'); if(!h)return;
    h.querySelectorAll('button').forEach(function(btn){
      var a=actionForButton(btn);
      btn.classList.toggle('tapd-nav-active',a===action);
      btn.setAttribute('aria-current',a===action?'page':'false');
    });
  }
  function closeOwnerPanel(){
    document.body.classList.remove('tapd-owner-tools-mode','ot55-active');
    var side=byId('ownerSidePanel55'); if(side)side.style.display='none';
    var over=byId('ot55Overlay'); if(over)over.style.display='none';
  }
  function closeFullPages(){
    document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  }
  function openOwnerToolsPreserved(){
    setActiveNav('owner');
    document.body.classList.add('tapd-owner-tools-mode','ot55-active');
    var side=byId('ownerSidePanel55');
    if(side){side.style.display='flex';return;}
    if(typeof window.ot55Open==='function'){window.ot55Open();return;}
    var page=byId('page-owner-tools-55');
    if(page){closeFullPages();page.classList.add('active');}
    else if(typeof window.tapdToast==='function')window.tapdToast('Owner Tools not available on this build','warn');
  }
  function openTemplatesClean(){
    setActiveNav('templates');
    closeOwnerPanel();
    document.body.classList.remove('tapd-relhub-mode');
    if(typeof window.tpl56Open==='function'){window.tpl56Open();return;}
    var page=byId('page-template-editor');
    if(page){closeFullPages();page.classList.add('active');}
    else if(typeof window.tapdToast==='function')window.tapdToast('Templates not available on this build yet','warn');
    setTimeout(ensureTemplateActionBar,60);
  }
  function cleanRelationshipHubText(){
    try{
      document.querySelectorAll('.rh56-tab-label,.rh56-empty-msg,.rh56-section-title').forEach(function(el){
        var v=el.textContent;
        v=v.replace('People who tapped your NFC card and sent their TAPD card. Accept to start capturing.','People you\'ve connected with. Connections from NFC taps and captured conversations appear here.');
        v=v.replace('Recordings transcribed, not yet drafted.','Captured conversations waiting for your review.');
        v=v.replace('Tap the gold Capture button to record a conversation.','Captured conversations will appear here before follow-up approval.');
        if(v!==el.textContent)el.textContent=v;
      });
    }catch(e){}
  }
  function openRelationshipHubClean(){
    setActiveNav('relationship');
    closeOwnerPanel();
    document.body.classList.remove('tapd-owner-tools-mode','ot55-active');
    document.body.classList.add('tapd-relhub-mode');
    if(typeof window.rh56Open==='function')window.rh56Open();
    else{
      var page=byId('page-relhub-56');
      if(page){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});page.classList.add('active');try{if(typeof window.rh56Render==='function')window.rh56Render();}catch(e){}}
      else if(typeof window.tapdToast==='function')window.tapdToast('Relationship Hub is not available on this build yet','warn');
    }
    setTimeout(cleanRelationshipHubText,30);
    setTimeout(cleanRelationshipHubText,180);
  }
  function route(action){
    if(action==='owner')return openOwnerToolsPreserved();
    if(action==='templates')return openTemplatesClean();
    if(action==='relationship')return openRelationshipHubClean();
  }
  function actionForButton(btn){
    if(!btn)return '';
    var t=txt(btn);
    if(btn.id==='hardOwnerToolsBtn'||btn.classList.contains('hard-owner-tools')||btn.classList.contains('hard-primary')||t.indexOf('owner')>=0)return 'owner';
    if(btn.id==='hardTemplatesBtn'||btn.classList.contains('hard-template')||t.indexOf('template')>=0)return 'templates';
    if(btn.id==='hardInboxBtn'||btn.id==='hardRelHubBtn'||btn.classList.contains('hard-inbox')||btn.classList.contains('hard-relhub')||t.indexOf('relationship')>=0||t.indexOf('hub')>=0)return 'relationship';
    return '';
  }
  function handleTopNav(ev){
    if(inVisitorMode())return;
    var h=byId('tapdHardOwnerHeader');
    if(!h)return;
    var btn=ev.target&&ev.target.closest?ev.target.closest('button'):null;
    if(!btn||!h.contains(btn))return;
    var action=actionForButton(btn);
    if(!action)return;
    if(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();}
    var t=now();
    if(lastTap.key===action&&(t-lastTap.at)<420)return false;
    lastTap={key:action,at:t};
    route(action);
    return false;
  }
  function goCaptureWithTemplate(id){
    setActiveNav('');
    closeOwnerPanel();
    closeFullPages();
    try{localStorage.setItem('tapd_active_template',id);}catch(e){}
    if(typeof window.currentRelationshipMode!=='undefined')window.currentRelationshipMode=id;
    if(typeof window.goCapture==='function')window.goCapture();
    else if(typeof window.showPage==='function')window.showPage('capture');
    else{document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});var c=byId('capture');if(c)c.classList.add('active');}
    try{if(typeof window.showScreen==='function')window.showScreen('sc-idle');}catch(e){}
    setTimeout(function(){showTemplateCheatSheet(id);},80);
  }
  function showTemplateCheatSheet(id){
    var old=byId('tapdTemplateCheatSheet'); if(old)old.remove();
    var hints=TEMPLATE_HINTS[id]||TEMPLATE_HINTS.custom;
    var sheet=document.createElement('div');
    sheet.id='tapdTemplateCheatSheet';
    sheet.innerHTML='<div class="tapd-cheat-card"><button class="tapd-cheat-close" type="button" aria-label="Close">\xd7</button><p class="tapd-cheat-kicker">Conversation prompts</p><p class="tapd-cheat-title">'+titleCaseFromId(id)+'</p><p class="tapd-cheat-sub">Use one or two that fit the flow. You don\u2019t need to ask all five. TAPDconnex will structure whatever the conversation gives you.</p><div class="tapd-cheat-list">'+hints.map(function(h,i){return '<span><b style="color:#EAB308;margin-right:6px;">'+(i+1)+'.</b>'+h+'</span>';}).join('')+'</div><button class="tapd-cheat-primary" type="button">Got it \u2014 capture now</button></div>';
    document.body.appendChild(sheet);
    sheet.querySelector('.tapd-cheat-close').onclick=function(){sheet.remove();};
    sheet.querySelector('.tapd-cheat-primary').onclick=function(){sheet.remove();};
    setTimeout(function(){sheet.classList.add('show');},20);
  }
  function ensureTemplateActionBar(){
    var body=byId('tpl56Body'); if(!body)return;
    var active=getActiveTemplate();
    var old=byId('tapdTemplateActionBar'); if(old)old.remove();
    var bar=document.createElement('div');
    bar.id='tapdTemplateActionBar';
    bar.className='tapd-template-action-bar';
    bar.innerHTML='<div><p class="tapd-template-action-title">Ready to capture with '+titleCaseFromId(active)+'</p><p class="tapd-template-action-sub">Use this when you are about to record the conversation. The cheat sheet reminds you what this template is listening for.</p></div><div class="tapd-template-action-row"><button type="button" class="tapd-template-capture-btn">Capture this moment</button><button type="button" class="tapd-template-cheat-btn">View cheat sheet</button></div>';
    body.insertBefore(bar,body.firstChild);
    bar.querySelector('.tapd-template-capture-btn').onclick=function(){goCaptureWithTemplate(getActiveTemplate());};
    bar.querySelector('.tapd-template-cheat-btn').onclick=function(){showTemplateCheatSheet(getActiveTemplate());};
  }
  function wrapTemplateSelection(){
    if(window.__tapdTemplateSelectionWrapped||typeof window.tpl56SetActive!=='function')return;
    window.__tapdTemplateSelectionWrapped=true;
    var original=window.tpl56SetActive;
    window.tpl56SetActive=function(id){
      try{original.call(window,id);}catch(e){try{localStorage.setItem('tapd_active_template',id);}catch(x){}}
      setTimeout(function(){goCaptureWithTemplate(id);},140);
    };
  }
  function wrapTemplateOpen(){
    if(window.__tapdTemplateOpenWrapped||typeof window.tpl56Open!=='function')return;
    window.__tapdTemplateOpenWrapped=true;
    var originalOpen=window.tpl56Open;
    window.tpl56Open=function(){
      var result=originalOpen.apply(window,arguments);
      setActiveNav('templates');
      setTimeout(ensureTemplateActionBar,40);
      setTimeout(ensureTemplateActionBar,180);
      return result;
    };
  }
  // ── Zero-friction visitor strip ──────────────────────────────────────────
  // Removes the "Send my TAPD card back" button and manual connectSheet entirely.
  // The visitor flow is now: tap NFC → see profile → tap a channel → vCard. No typing.
  // The owner captures the relationship on their side using the voice capture tool.
  function buildCleanVisitorStrip(){
    var p=typeof getProfileData==='function'?getProfileData():{};
    var name=p.name||'';
    var title=byId('visitorStripTitle');
    if(title)title.textContent=name?'You tapped '+name+'\u2019s card':'You tapped this TAPD card';
    var opts=byId('connectOptions');
    if(!opts)return;
    opts.innerHTML='';
    function makeBtn(label,bg,primary,svgHtml,action){
      var btn=document.createElement('button');
      btn.className='connect-opt'+(primary?' primary':'');
      if(bg&&bg!=='transparent')btn.style.background=bg;
      btn.innerHTML=svgHtml+' '+label;
      btn.onclick=function(){action();};
      return btn;
    }
    if(p.whatsApp){
      var waNum=String(p.whatsApp).replace(/\D/g,'');
      var waMsg='Hi '+( name||'there')+', I just tapped your NFC card!';
      opts.appendChild(makeBtn('Message on WhatsApp','#22C55E',true,
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
        function(){window.open('https://wa.me/'+waNum+'?text='+encodeURIComponent(waMsg),'_blank');showConnected('Sent via WhatsApp');}
      ));
    }
    if(p.linkedIn){
      var liUrl=p.linkedIn.startsWith('http')?p.linkedIn:'https://linkedin.com/in/'+p.linkedIn.replace('@','');
      opts.appendChild(makeBtn('Connect on LinkedIn','transparent',false,
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        function(){window.open(liUrl,'_blank');showConnected('Opened LinkedIn');}
      ));
    }
    if(p.instagram){
      var igUrl=p.instagram.startsWith('http')?p.instagram:'https://instagram.com/'+p.instagram.replace('@','');
      opts.appendChild(makeBtn('Follow on Instagram','transparent',false,
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
        function(){window.open(igUrl,'_blank');showConnected('Opened Instagram');}
      ));
    }
    if(p.email){
      opts.appendChild(makeBtn('Send an email','transparent',false,
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        function(){window.open('mailto:'+p.email);showConnected('Email opened');}
      ));
    }
    if(!opts.children.length){
      opts.innerHTML='<p style="font-size:12px;color:rgba(255,255,255,.4);text-align:center;padding:8px 0;">No contact links set up on this profile yet.</p>';
    }
  }

  // Block the manual form from ever opening — form defeats NFC zero-friction purpose.
  function noopConnectSheet(){
    window.openConnectSheet=function(){};
    window.closeConnectSheet=function(){};
  }

  // Personalise the vCard button: inject owner's first name the moment visitor connects.
  // Runs after showConnected() hides the options and reveals visitorSent.
  function upgradeShowConnected(){
    var _orig=window.showConnected;
    if(!_orig||window.__tapdShowConnectedUpgraded)return;
    window.__tapdShowConnectedUpgraded=true;
    window.showConnected=function(msg){
      if(typeof _orig==='function')_orig(msg);
      try{
        var p=typeof getProfileData==='function'?getProfileData():{};
        var first=(p.name||'').trim().split(' ')[0]||'contact';
        var el=document.getElementById('tapdVcardName');
        if(el)el.textContent=first;
      }catch(e){}
    };
  }

  function boot(){
    injectWorkspaceStyles();
    document.addEventListener('pointerup',handleTopNav,true);
    document.addEventListener('click',handleTopNav,true);
    window.openTapdInboxFromSide=openRelationshipHubClean;
    window.tapd49OpenRelationshipHub=openRelationshipHubClean;
    window.tapd52OpenRelationshipHub=openRelationshipHubClean;
    window.tapd54OpenRelationshipHub=openRelationshipHubClean;
    window.openRelationshipHub=openRelationshipHubClean;
    window.tapdOpenTemplates=openTemplatesClean;
    window.openQuickTemplateSwitcher=openTemplatesClean;
    wrapTemplateOpen();
    wrapTemplateSelection();
    setTimeout(wrapTemplateOpen,250);
    setTimeout(wrapTemplateSelection,250);
    setTimeout(wrapTemplateOpen,800);
    setTimeout(wrapTemplateSelection,800);
    setTimeout(cleanRelationshipHubText,400);
    upgradeShowConnected();
    noopConnectSheet();
    window.buildVisitorStrip=buildCleanVisitorStrip;
    // Re-run if strip already rendered before our script loaded
    if(inVisitorMode()){
      var vs=byId('visitorStrip');
      if(vs&&vs.classList.contains('show'))buildCleanVisitorStrip();
    }
    console.log('[TAPD] Update 69C loaded \u2014 active nav, template capture, vCard name, zero-friction visitor strip active.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
</script>`;

if (html.includes('</body>')) {
  html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, controller + '\n</body>');
} else {
  html += '\n' + controller + '\n';
}

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Applied active nav state and template capture actions.');
} else {
  console.log('[TAPD build] No active-nav changes required.');
}
