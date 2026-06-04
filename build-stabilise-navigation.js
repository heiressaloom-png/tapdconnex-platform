const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

function disableScriptBlocks() {
  const conflictScriptPattern = /<script\s+id=["'](?:tapdUpdate4[3-8][^"']*|tapd49RelationshipHubScript|tapdUpdate50[^"']*|tapdUpdate51[^"']*|tapdUpdate52[^"']*)["'][\s\S]*?<\/script>\s*/g;
  html = html.replace(conflictScriptPattern, function (block) {
    const idMatch = block.match(/id=["']([^"']+)["']/);
    const id = idMatch ? idMatch[1] : 'legacy-nav-script';
    return `<!-- ${id} disabled at build time: legacy top navigation controller removed. -->\n`;
  });
}

function patchRemainingPointerHandlers() {
  html = html
    // Update 55: keep Owner Tools page behaviour, but stop re-binding the header every 400ms.
    .replace(/setInterval\(watchHeader,400\);/g, '/* top-nav polling disabled by build-stabilise-navigation.js */')
    .replace(/btn\.onpointerup=function\(ev\)\{if\(ev\)\{ev\.preventDefault\(\);ev\.stopPropagation\(\);\}window\.ot55Open\(\);return false;\};/g, 'btn.onpointerup=null;')

    // Update 56: keep full-page Templates and Relationship Hub, but click-only prevents double fire on mobile.
    .replace(/rhBtn\.onclick=handler;\s*rhBtn\.onpointerup=handler;/g, 'rhBtn.onclick=handler; rhBtn.onpointerup=null;')
    .replace(/tplBtn\.onclick=tHandler;\s*tplBtn\.onpointerup=tHandler;/g, 'tplBtn.onclick=tHandler; tplBtn.onpointerup=null;')
    .replace(/setInterval\(wireNavButtons,600\);/g, '/* top-nav polling disabled by build-stabilise-navigation.js */');
}

function patchRelationshipHubLanguage() {
  html = html
    .replace("['connections','captured','drafts','followUps','sent','waiting','archived']", "['connections','captured','followUps','sent']")
    .replace("var labels={connections:'Connections',captured:'Captured',drafts:'Drafts',\n          followUps:'Follow-Ups',sent:'Sent',waiting:'Waiting',archived:'Archived'};", "var labels={connections:'Connections',captured:'Pending Review',followUps:'Follow-Ups',sent:'Sent'};")
    .replace("'Connections','People who tapped your NFC card and sent their TAPD card. Accept to start capturing.'", "'Connections','People you\\'ve connected with. Connections from NFC taps and captured conversations appear here.'")
    .replace("'Captured Conversations','Recordings transcribed, not yet drafted.'", "'Pending Review','Captured conversations waiting for owner review.'")
    .replace(/name:'Keep Warm'/g, "name:'Stay in Touch'")
    .replace(/keep_warm/g, 'stay_in_touch');
}

function appendCanonicalController() {
  if (html.includes('tapdCanonicalTopNavController')) return;

  const controller = `

<!-- UPDATE 69: CANONICAL TOP NAVIGATION CONTROLLER — CLICK ONLY, NO POLLING -->
<script id="tapdCanonicalTopNavController">
(function(){
  if(window.__tapdCanonicalTopNavController)return;
  window.__tapdCanonicalTopNavController=true;

  function byId(id){return document.getElementById(id);} 
  function isVisitor(){
    try{
      var q=new URLSearchParams(location.search||'');
      return q.get('visitor')==='1'||q.get('mode')==='visitor'||q.get('view')==='visitor'||q.get('nfc')==='1'||document.body.classList.contains('tapd-hard-header-off');
    }catch(e){return false;}
  }
  function closeOwnerDrawer(){
    try{
      var panel=byId('ownerSidePanel');
      if(panel&&panel.classList.contains('open')&&typeof window.toggleOwnerSidePanel==='function')window.toggleOwnerSidePanel(false);
      var backdrop=byId('ownerSideBackdrop'); if(backdrop)backdrop.classList.remove('open');
    }catch(e){}
  }
  function closeFullNavPages(){
    ['page-relhub-56','page-templates-56'].forEach(function(id){var el=byId(id); if(el)el.classList.remove('active');});
  }
  function removeFloatingOverlays(){
    try{
      document.querySelectorAll('.quick-template-overlay,.tapd-more-overlay,.fu-modal-overlay,.ai-gate-overlay').forEach(function(el){el.remove();});
    }catch(e){}
  }

  function openOwnerTools(){
    removeFloatingOverlays();
    closeFullNavPages();
    document.body.classList.remove('tapd-relhub-mode','tapd-relhub-calm');
    document.body.classList.add('tapd-owner-tools-mode');
    if(typeof window.ot55Open==='function')return window.ot55Open();
    try{if(typeof window.toggleOwnerSidePanel==='function')window.toggleOwnerSidePanel(true);}catch(e){}
  }

  function openTemplates(){
    removeFloatingOverlays();
    closeOwnerDrawer();
    document.body.classList.remove('tapd-owner-tools-mode','ot55-active','tapd-relhub-mode','tapd-relhub-calm');
    if(typeof window.tpl56Open==='function')return window.tpl56Open();
    if(typeof window.goTemplateEditor==='function')return window.goTemplateEditor();
  }

  function openRelationshipHub(){
    removeFloatingOverlays();
    closeOwnerDrawer();
    document.body.classList.remove('tapd-owner-tools-mode','ot55-active');
    document.body.classList.add('tapd-relhub-mode');
    if(typeof window.rh56Open==='function')return window.rh56Open();
    try{if(typeof window.toggleOwnerSidePanel==='function')window.toggleOwnerSidePanel(true);}catch(e){}
  }

  function renderHeader(){
    var h=byId('tapdHardOwnerHeader');
    if(!h)return;
    if(isVisitor()){h.style.display='none';return;}
    h.innerHTML=''
      +'<button type="button" class="hard-owner-tools" data-tapd-action="owner">Owner Tools</button>'
      +'<button type="button" class="hard-template" data-tapd-action="templates">Templates</button>'
      +'<button type="button" class="hard-relhub" data-tapd-action="relationship">Relationship Hub</button>';
    h.style.display='flex';
    h.setAttribute('data-tapd-canonical-nav','1');
    h.style.touchAction='manipulation';
    h.querySelectorAll('button').forEach(function(btn){btn.style.touchAction='manipulation';});
  }

  function wireHeader(){
    var h=byId('tapdHardOwnerHeader');
    if(!h||h.dataset.tapdCanonicalWired==='1')return;
    h.dataset.tapdCanonicalWired='1';
    h.addEventListener('click',function(ev){
      var btn=ev.target&&ev.target.closest?ev.target.closest('[data-tapd-action]'):null;
      if(!btn||!h.contains(btn))return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      var action=btn.getAttribute('data-tapd-action');
      if(action==='owner')openOwnerTools();
      if(action==='templates')openTemplates();
      if(action==='relationship')openRelationshipHub();
      return false;
    },true);
    h.addEventListener('pointerup',function(ev){
      var btn=ev.target&&ev.target.closest?ev.target.closest('[data-tapd-action]'):null;
      if(!btn||!h.contains(btn))return;
      ev.stopImmediatePropagation();
    },true);
  }

  function boot(){renderHeader();wireHeader();}

  window.openOwnerTools=openOwnerTools;
  window.openTemplates=openTemplates;
  window.openRelationshipHub=openRelationshipHub;
  window.openTapdInboxFromSide=openRelationshipHub;
  window.tapd49OpenRelationshipHub=openRelationshipHub;
  window.tapd52OpenRelationshipHub=openRelationshipHub;
  window.tapd54OpenRelationshipHub=openRelationshipHub;
  window.tapdOpenTemplates=openTemplates;
  window.openQuickTemplateSwitcher=openTemplates;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,80);
  setTimeout(boot,350);
  console.log('[TAPD] Update 69 loaded — canonical top navigation active: Owner Tools, Templates, Relationship Hub.');
})();
</script>
`;

  html += controller;
}

disableScriptBlocks();
patchRemainingPointerHandlers();
patchRelationshipHubLanguage();
appendCanonicalController();

if (html === before) {
  console.log('[TAPD build] No navigation changes were needed.');
} else {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Stabilised top navigation in index.html for deployment.');
}
