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

const controller = `
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
    direct_opportunity:['Need / pain mentioned','Buying or adoption signal','Specific next step'],
    connector_referral:['Who they can introduce you to','Why that person matters','Forwarding blurb'],
    stay_in_touch:['What was discussed','Reason to stay in touch','Suggested light follow-up'],
    pilot_beta:['What they want to test','Success criteria','Pilot next step'],
    collaboration:['Shared interest','Possible collaboration','Dependencies'],
    customer_discovery:['Current problem or pain','Current workaround','Desired outcome'],
    investor_funding:['Stage fit','Interest signal','Materials requested'],
    strategic_partnership:['Mutual value','Key decision-makers','Dependencies'],
    speaking_media:['Topic or angle','Audience fit','Format and logistics'],
    advisory_mentor:['Their expertise','Your specific ask','Commitment level'],
    community_access:['Community value','Access path','Mutual asks and offers'],
    custom:['Your custom fields','Key context','Next step']
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
      +'#tapdHardOwnerHeader button.tapd-nav-active{background:linear-gradient(135deg,#0ECEC0,#10B981)!important;border-color:#0ECEC0!important;color:#03100f!important;box-shadow:0 0 0 2px rgba(14,206,192,.16),0 14px 30px rgba(14,206,192,.16)!important;}\n'
      +'#tapdHardOwnerHeader button:not(.tapd-nav-active){filter:saturate(.82);opacity:.88;}\n'
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
  function closeFullPages(){
    ['page-relhub-56','page-templates-56','page-template-editor'].forEach(function(id){var el=byId(id);if(el)el.classList.remove('active');});
  }
  function closeOwnerPanel(){
    var panel=byId('ownerSidePanel');
    var backdrop=byId('ownerSideBackdrop');
    if(panel){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');}
    if(backdrop)backdrop.classList.remove('open');
    document.body.classList.remove('owner-panel-open','tapd-owner-tools-mode','ot55-active');
  }
  function showProfile(){
    if(typeof window.showPage==='function')window.showPage('profile');
    else{document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});var p=byId('profile');if(p)p.classList.add('active');}
  }
  function openOwnerToolsPreserved(){
    setActiveNav('owner');
    closeFullPages();
    document.body.classList.remove('tapd-relhub-mode','tapd-relhub-calm');
    document.body.classList.add('owner-panel-open','tapd-owner-tools-mode');
    showProfile();
    var panel=byId('ownerSidePanel');
    var backdrop=byId('ownerSideBackdrop');
    if(panel){panel.classList.add('open');panel.setAttribute('aria-hidden','false');}
    if(backdrop)backdrop.classList.add('open');
    try{if(typeof window.tapdSetupOwnerTabs41==='function')window.tapdSetupOwnerTabs41('profile');}catch(e){}
    try{window.scrollTo(0,0);}catch(e){}
  }
  function openTemplatesClean(){
    setActiveNav('templates');
    closeOwnerPanel();
    document.body.classList.remove('tapd-relhub-mode','tapd-relhub-calm');
    if(typeof window.tpl56Open==='function')window.tpl56Open();
    else if(typeof window.goTemplateEditor==='function')window.goTemplateEditor();
    setTimeout(ensureTemplateActionBar,60);
    setTimeout(ensureTemplateActionBar,220);
  }
  function cleanRelationshipHubText(){
    var root=byId('page-relhub-56')||document;
    try{
      root.querySelectorAll('button,.tapd54-tab,[role="tab"]').forEach(function(el){
        var label=(el.textContent||'').replace(/\s+/g,' ').trim();
        if(label==='Captured')el.textContent='Awaiting Review';
        if(label==='Drafts'){el.style.display='none';el.setAttribute('aria-hidden','true');}
      });
      root.querySelectorAll('.tapd54-section-title,.tapd54-status-badge').forEach(function(el){
        var label=(el.textContent||'').replace(/\s+/g,' ').trim();
        if(label==='Captured'||label==='Captured Conversations')el.textContent='Awaiting Review';
      });
      root.querySelectorAll('.tapd54-section-desc,.tapd54-hub-sub,.tapd54-empty span').forEach(function(el){
        var v=el.textContent||'';
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
    sheet.innerHTML='<div class="tapd-cheat-card"><button class="tapd-cheat-close" type="button" aria-label="Close">×</button><p class="tapd-cheat-kicker">Template selected</p><p class="tapd-cheat-title">'+titleCaseFromId(id)+'</p><p class="tapd-cheat-sub">Capture with this structure in mind. TAPDconnex will use this template when shaping the follow-up.</p><div class="tapd-cheat-list">'+hints.map(function(h){return '<span>'+h+'</span>';}).join('')+'</div><button class="tapd-cheat-primary" type="button">Got it — capture now</button></div>';
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
    console.log('[TAPD] Update 69C loaded — active nav, template capture button and cheat sheet active.');
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
