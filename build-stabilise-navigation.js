const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

// Keep the original Owner Tools / Templates / Relationship Hub UI structure intact.
// This build step no longer removes historical inline update blocks. It only removes
// obsolete external runtime references and adds one final routing guard for the top buttons.
html = html.replace('<script src="/update-65b-navigation-guardrails.js"></script>', '');
html = html.replace('<script src="/update-68-owner-toggle-fix.js"></script>', '');
html = html.replace(/<script id="tapdCanonicalTopNavController">[\s\S]*?<\/script>/g, '');
html = html.replace(/<script id="tapdTopNavDesignCorrection">[\s\S]*?<\/script>/g, '');

// Safe label clarification only. Do not globally remove tabs or owner content.
html = html.replace(/Your NFC Tag URI/g, 'Your NFC Profile URL');
html = html.replace(/Program this exact URL onto your NFC card\. Every tap opens your live profile\./g, 'This is the profile URL to program onto your NFC card. Every tap opens this live TAPD profile.');

const controller = `
<!-- UPDATE 69B: TOP NAV DESIGN CORRECTION — PRESERVE OWNER TOOLS, SEPARATE RELATIONSHIP HUB -->
<script id="tapdTopNavDesignCorrection">
(function(){
  if(window.__tapdTopNavDesignCorrection)return;
  window.__tapdTopNavDesignCorrection=true;

  var lastTap={key:'',at:0};
  function byId(id){return document.getElementById(id);} 
  function now(){return Date.now?Date.now():(new Date()).getTime();}
  function txt(el){return (el&&el.textContent?el.textContent:'').replace(/\\s+/g,' ').trim().toLowerCase();}
  function inVisitorMode(){
    try{var q=new URLSearchParams(location.search||'');return q.get('visitor')==='1'||q.get('mode')==='visitor'||q.get('view')==='visitor'||q.get('nfc')==='1'||document.body.classList.contains('tapd-hard-header-off');}catch(e){return false;}
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
    closeOwnerPanel();
    document.body.classList.remove('tapd-relhub-mode','tapd-relhub-calm');
    if(typeof window.tpl56Open==='function')return window.tpl56Open();
    if(typeof window.goTemplateEditor==='function')return window.goTemplateEditor();
  }
  function openRelationshipHubClean(){
    closeOwnerPanel();
    document.body.classList.remove('tapd-owner-tools-mode','ot55-active');
    document.body.classList.add('tapd-relhub-mode');
    if(typeof window.rh56Open==='function')return window.rh56Open();
    var page=byId('page-relhub-56');
    if(page){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});page.classList.add('active');try{if(typeof window.rh56Render==='function')window.rh56Render();}catch(e){}return;}
    if(typeof window.tapdToast==='function')window.tapdToast('Relationship Hub is not available on this build yet','warn');
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
  function boot(){
    document.addEventListener('pointerup',handleTopNav,true);
    document.addEventListener('click',handleTopNav,true);
    window.openTapdInboxFromSide=openRelationshipHubClean;
    window.tapd49OpenRelationshipHub=openRelationshipHubClean;
    window.tapd52OpenRelationshipHub=openRelationshipHubClean;
    window.tapd54OpenRelationshipHub=openRelationshipHubClean;
    window.openRelationshipHub=openRelationshipHubClean;
    window.tapdOpenTemplates=openTemplatesClean;
    window.openQuickTemplateSwitcher=openTemplatesClean;
    console.log('[TAPD] Update 69B loaded — Owner Tools preserved; Relationship Hub opens separately.');
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
  console.log('[TAPD build] Applied design-correct top navigation guard.');
} else {
  console.log('[TAPD build] No design-correction changes required.');
}
