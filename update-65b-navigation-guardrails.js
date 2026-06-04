/* UPDATE 65B — Mobile navigation guardrails, template clarity, and escape routes.
   This runtime patch keeps the large MVP HTML stable while fixing the owner navigation loop. */
(function(){
  if (window.__tapdUpdate65BNavigationGuardrails) return;
  window.__tapdUpdate65BNavigationGuardrails = true;

  var lastAction = { key: '', at: 0 };
  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function esc(s){ return String(s == null ? '' : s); }
  function byId(id){ return document.getElementById(id); }

  function toast(message){
    try {
      var old = byId('tapd65bToast');
      if (old) old.remove();
      var el = document.createElement('div');
      el.id = 'tapd65bToast';
      el.className = 'tapd65b-toast';
      el.textContent = message;
      document.body.appendChild(el);
      setTimeout(function(){ try { el.remove(); } catch(e){} }, 2200);
    } catch(e) {}
  }

  function runOnce(key, fn){
    var t = now();
    if (lastAction.key === key && (t - lastAction.at) < 650) return;
    lastAction = { key: key, at: t };
    try { fn(); } catch(e) { console.warn('[TAPD 65B]', key, e); }
  }

  function closeFloatingLayers(){
    try { if (typeof window.closeQuickTemplateSwitcher31 === 'function') window.closeQuickTemplateSwitcher31(); } catch(e){}
    try { document.querySelectorAll('.quick-template-overlay,.upgrade-sheet.open,.connect-sheet.open').forEach(function(el){ el.classList.remove('open'); if(el.classList.contains('quick-template-overlay')) el.remove(); }); } catch(e){}
  }

  function goToProfile(){
    closeFloatingLayers();
    try { if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(false); } catch(e){}
    try { if (typeof window.showPage === 'function') window.showPage('profile'); } catch(e){}
    try { window.scrollTo(0,0); } catch(e){}
  }

  function goToCapture(){
    closeFloatingLayers();
    try { if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(false); } catch(e){}
    try { if (typeof window.showPage === 'function') window.showPage('capture'); } catch(e){}
    try { if (typeof window.showScreen === 'function') window.showScreen('sc-idle'); } catch(e){}
    try { window.scrollTo(0,0); } catch(e){}
  }

  function goToTemplates(){
    closeFloatingLayers();
    try { if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(false); } catch(e){}
    try {
      if (typeof window.goTemplateEditor === 'function') window.goTemplateEditor();
      else if (typeof window.showPage === 'function') window.showPage('page-template-editor');
    } catch(e){}
    setTimeout(enhanceTemplatePage, 80);
    setTimeout(enhanceTemplatePage, 250);
  }

  function goToOwnerTools(){
    closeFloatingLayers();
    try { if (typeof window.showPage === 'function') window.showPage('profile'); } catch(e){}
    setTimeout(function(){
      try {
        if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(true);
        else if (typeof window.goEdit === 'function') window.goEdit();
      } catch(e){}
      addPanelEscapeRoutes('Owner Tools');
    }, 80);
  }

  function goToRelationshipHub(){
    closeFloatingLayers();
    try { if (typeof window.showPage === 'function') window.showPage('profile'); } catch(e){}
    setTimeout(function(){
      try {
        if (typeof window.tapd49OpenRelationshipHub === 'function') window.tapd49OpenRelationshipHub();
        else if (typeof window.openTapdInboxFromSide === 'function') window.openTapdInboxFromSide();
        else if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(true);
      } catch(e){}
      addPanelEscapeRoutes('Relationship Hub');
    }, 80);
  }

  function bindButton(btn, action, label){
    if (!btn || btn.__tapd65bBound) return;
    btn.__tapd65bBound = true;
    btn.setAttribute('type','button');
    btn.style.touchAction = 'manipulation';
    btn.style.cursor = 'pointer';
    btn.onclick = null;
    var handler = function(ev){
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      }
      runOnce(label, action);
    };
    btn.addEventListener('pointerup', handler, true);
    btn.addEventListener('click', handler, true);
  }

  function bindOwnerHeader(){
    var ownerSel = '[id^="hardOwnerToolsBtn"],.hard-owner-tools,.hard-primary';
    var templateSel = '[id^="hardTemplatesBtn"],.hard-template';
    var hubSel = '[id^="hardInboxBtn"],[id^="hardRelHubBtn"],.hard-inbox,.hard-relhub';
    try { document.querySelectorAll(ownerSel).forEach(function(b){ bindButton(b, goToOwnerTools, 'owner-tools'); }); } catch(e){}
    try { document.querySelectorAll(templateSel).forEach(function(b){ bindButton(b, goToTemplates, 'templates'); }); } catch(e){}
    try { document.querySelectorAll(hubSel).forEach(function(b){ bindButton(b, goToRelationshipHub, 'relationship-hub'); }); } catch(e){}
  }

  function addPanelEscapeRoutes(context){
    try {
      var panel = byId('ownerSidePanel');
      if (!panel || !panel.classList.contains('open')) return;
      var body = panel.querySelector('.owner-side-body');
      if (!body) return;
      var existing = byId('tapd65bPanelExits');
      if (existing) existing.remove();
      var bar = document.createElement('div');
      bar.id = 'tapd65bPanelExits';
      bar.className = 'tapd65b-exit-bar';
      bar.innerHTML = '<button type="button" class="tapd65b-exit primary" id="tapd65bCaptureNow">Capture this moment</button><button type="button" class="tapd65b-exit" id="tapd65bBackProfile">Back to profile</button>';
      body.insertBefore(bar, body.firstChild);
      bindButton(byId('tapd65bCaptureNow'), goToCapture, 'panel-capture');
      bindButton(byId('tapd65bBackProfile'), goToProfile, 'panel-profile');
      var title = panel.querySelector('.owner-side-title');
      if (title && context) title.textContent = context;
    } catch(e) {}
  }

  function replaceVisibleText(root){
    try {
      var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function(n){
        var v = n.nodeValue;
        if (!v) return;
        var nv = v
          .replace(/Keep warm/g, 'Stay in touch')
          .replace(/keep warm/g, 'stay in touch')
          .replace(/Active/g, 'Currently in use')
          .replace(/Edit fields/g, 'Customise fields');
        if (nv !== v) n.nodeValue = nv;
      });
    } catch(e) {}
  }

  function enhanceTemplatePage(){
    try {
      var page = byId('page-template-editor');
      if (!page) return;
      var intro = page.querySelector('.tpl-editor-intro');
      if (intro) {
        intro.innerHTML = '<strong>Relationship templates:</strong> Choose the conversation type you want TAPDconnex to listen for. The active template guides every new capture until you change it.';
      }
      if (!byId('tapd65bTemplateExits')) {
        var hdr = page.querySelector('.tpl-editor-hdr') || page.firstElementChild;
        var exits = document.createElement('div');
        exits.id = 'tapd65bTemplateExits';
        exits.className = 'tapd65b-template-exits';
        exits.innerHTML = '<button type="button" class="tapd65b-exit primary" id="tapd65bTemplateCapture">Capture this moment</button><button type="button" class="tapd65b-exit" id="tapd65bTemplateProfile">Back to profile</button>';
        if (hdr && hdr.parentNode) hdr.parentNode.insertBefore(exits, hdr.nextSibling);
        else page.insertBefore(exits, page.firstChild);
        bindButton(byId('tapd65bTemplateCapture'), goToCapture, 'template-capture');
        bindButton(byId('tapd65bTemplateProfile'), goToProfile, 'template-profile');
      }
      replaceVisibleText(page);
      page.querySelectorAll('.tpl-list-card-badge,.quick-template-pill.selected').forEach(function(el){
        if (/active/i.test(el.textContent) || /currently/i.test(el.textContent)) el.textContent = 'Currently in use';
      });
      page.querySelectorAll('.tpl-list-card').forEach(function(card){
        var isActive = /Currently in use|Active/i.test(card.textContent);
        var btns = card.querySelectorAll('button');
        btns.forEach(function(btn){
          if (btn.textContent.trim() === 'Edit') btn.textContent = isActive ? 'Customise fields' : 'View fields';
        });
      });
    } catch(e) {}
  }

  function enhanceRelationshipHub(){
    try {
      replaceVisibleText(document.body);
      addPanelEscapeRoutes('Relationship Hub');
    } catch(e){}
  }

  function injectStyles(){
    if (byId('tapd65bStyles')) return;
    var css = document.createElement('style');
    css.id = 'tapd65bStyles';
    css.textContent = '\n'
      + '/* UPDATE 65B */\n'
      + '.tapd-hard-owner-header{pointer-events:auto!important;z-index:3000!important;}\n'
      + '.tapd-hard-owner-header button{min-height:44px!important;touch-action:manipulation!important;position:relative!important;z-index:3001!important;}\n'
      + '.tapd65b-exit-bar,.tapd65b-template-exits{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 14px;}\n'
      + '.tapd65b-template-exits{padding:0 16px;}\n'
      + '.tapd65b-exit{min-height:42px;border-radius:12px;border:1px solid var(--border);background:transparent;color:var(--t2);font-family:Inter,sans-serif;font-size:12px;font-weight:800;cursor:pointer;padding:0 12px;}\n'
      + '.tapd65b-exit.primary{background:linear-gradient(135deg,#EAB308,#ca8a04);border-color:#EAB308;color:#000;}\n'
      + '.tapd65b-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:4000;max-width:330px;background:#111;border:1px solid var(--gold-b);color:var(--gold);border-radius:12px;padding:10px 14px;font:700 12px Inter,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.55);}\n'
      + '.tpl-editor-intro strong{color:var(--gold);}\n'
      + '@media(max-width:360px){.tapd65b-exit{font-size:11px;padding:0 8px}.tapd65b-exit-bar,.tapd65b-template-exits{grid-template-columns:1fr;}}\n';
    document.head.appendChild(css);
  }

  function boot(){
    injectStyles();
    bindOwnerHeader();
    enhanceTemplatePage();
    replaceVisibleText(document.body);
    setInterval(function(){
      bindOwnerHeader();
      if (byId('page-template-editor') && byId('page-template-editor').classList.contains('active')) enhanceTemplatePage();
      enhanceRelationshipHub();
    }, 900);
    try {
      var mo = new MutationObserver(function(){
        bindOwnerHeader();
        if (byId('page-template-editor') && byId('page-template-editor').classList.contains('active')) enhanceTemplatePage();
        enhanceRelationshipHub();
      });
      mo.observe(document.body, { childList:true, subtree:true });
    } catch(e) {}
    console.log('[TAPD] Update 65B loaded — mobile nav guardrails and capture exits active.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tapd65bGoCapture = goToCapture;
  window.tapd65bGoProfile = goToProfile;
  window.tapd65bGoTemplates = goToTemplates;
})();
