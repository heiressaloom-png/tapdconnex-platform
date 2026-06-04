/* UPDATE 67 — Navigation reliability, permanent capture access, relationship-hub wording, and template guardrails.
   Runtime patch keeps the large MVP HTML stable while hardening the mobile workflow. */
(function(){
  if (window.__tapdUpdate67NavigationGuardrails) return;
  window.__tapdUpdate67NavigationGuardrails = true;

  var lastAction = { key: '', at: 0 };
  var STARTER_EDITABLE_KEY = 'tapd_starter_editable_template';

  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function byId(id){ return document.getElementById(id); }
  function textOf(el){ return (el && el.textContent ? el.textContent : '').replace(/\s+/g,' ').trim(); }
  function isVisible(el){
    if (!el) return false;
    var r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    return !!(r && r.width > 0 && r.height > 0);
  }
  function isOwnerView(){
    try { return document.body.classList.contains('tapd-hard-header-on') || (typeof window.isOwner === 'function' && window.isOwner()); }
    catch(e){ return document.body.classList.contains('tapd-hard-header-on'); }
  }

  function toast(message){
    try {
      var old = byId('tapd65bToast') || byId('tapd67Toast');
      if (old) old.remove();
      var el = document.createElement('div');
      el.id = 'tapd67Toast';
      el.className = 'tapd65b-toast';
      el.textContent = message;
      document.body.appendChild(el);
      setTimeout(function(){ try { el.remove(); } catch(e){} }, 2200);
    } catch(e) {}
  }

  function runOnce(key, fn){
    var t = now();
    if (lastAction.key === key && (t - lastAction.at) < 520) return;
    lastAction = { key: key, at: t };
    try { fn(); } catch(e) { console.warn('[TAPD 67]', key, e); }
  }

  function closeFloatingLayers(){
    try { if (typeof window.closeQuickTemplateSwitcher31 === 'function') window.closeQuickTemplateSwitcher31(); } catch(e){}
    try {
      document.querySelectorAll('.quick-template-overlay').forEach(function(el){ el.remove(); });
      document.querySelectorAll('.upgrade-sheet.open,.connect-sheet.open').forEach(function(el){ el.classList.remove('open'); });
      document.querySelectorAll('.fu-modal-overlay').forEach(function(el){ el.remove(); });
    } catch(e){}
  }

  function goToProfile(){
    closeFloatingLayers();
    try { if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(false); } catch(e){}
    try { if (typeof window.showPage === 'function') window.showPage('profile'); } catch(e){}
    try { window.scrollTo(0,0); } catch(e){}
    updateGlobalCaptureVisibility();
  }

  function goToCapture(){
    closeFloatingLayers();
    try { if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(false); } catch(e){}
    try {
      if (typeof window.goCapture === 'function') window.goCapture();
      else {
        if (typeof window.showPage === 'function') window.showPage('capture');
        if (typeof window.showScreen === 'function') window.showScreen('sc-idle');
      }
    } catch(e){}
    try { window.scrollTo(0,0); } catch(e){}
    updateGlobalCaptureVisibility();
  }

  function goToTemplates(){
    closeFloatingLayers();
    try { if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(false); } catch(e){}
    try {
      if (typeof window.goTemplateEditor === 'function') window.goTemplateEditor();
      else if (typeof window.showPage === 'function') window.showPage('page-template-editor');
    } catch(e){}
    setTimeout(enhanceTemplatePage, 60);
    setTimeout(enhanceTemplatePage, 220);
    setTimeout(updateGlobalCaptureVisibility, 240);
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
      updateGlobalCaptureVisibility();
    }, 60);
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
      enhanceRelationshipHub();
      updateGlobalCaptureVisibility();
    }, 60);
  }

  function bindButton(btn, action, label){
    if (!btn || btn.__tapd67Bound) return;
    btn.__tapd67Bound = true;
    btn.setAttribute('type','button');
    btn.style.touchAction = 'manipulation';
    btn.style.cursor = 'pointer';
    btn.style.pointerEvents = 'auto';
    btn.style.position = btn.style.position || 'relative';
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
    btn.addEventListener('touchend', handler, true);
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

  function navHitTest(ev){
    try {
      if (!ev || !isOwnerView()) return;
      var header = byId('tapdHardOwnerHeader') || document.querySelector('.tapd-hard-owner-header');
      if (!header || !isVisible(header)) return;
      var x = ev.clientX, y = ev.clientY;
      if (x == null || y == null) return;
      var buttons = [
        { el: byId('hardOwnerToolsBtn') || header.querySelector('.hard-primary'), action: goToOwnerTools, key: 'owner-tools-hit' },
        { el: byId('hardTemplatesBtn') || header.querySelector('.hard-template'), action: goToTemplates, key: 'templates-hit' },
        { el: byId('hardInboxBtn') || byId('hardRelHubBtn') || header.querySelector('.hard-inbox,.hard-relhub'), action: goToRelationshipHub, key: 'relationship-hub-hit' }
      ];
      for (var i=0;i<buttons.length;i++){
        var b = buttons[i].el;
        if (!b) continue;
        var r = b.getBoundingClientRect();
        if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) {
          ev.preventDefault(); ev.stopPropagation(); if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
          runOnce(buttons[i].key, buttons[i].action);
          return;
        }
      }
    } catch(e) {}
  }

  function installHardNavHitArea(){
    if (document.__tapd67HardNavHitArea) return;
    document.__tapd67HardNavHitArea = true;
    document.addEventListener('pointerup', navHitTest, true);
    document.addEventListener('touchend', navHitTest, true);
    document.addEventListener('click', navHitTest, true);
  }

  function addPanelEscapeRoutes(context){
    try {
      var panel = byId('ownerSidePanel');
      if (!panel || !panel.classList.contains('open')) return;
      var body = panel.querySelector('.owner-side-body');
      if (!body) return;
      var existing = byId('tapd65bPanelExits') || byId('tapd67PanelExits');
      if (existing) existing.remove();
      var bar = document.createElement('div');
      bar.id = 'tapd67PanelExits';
      bar.className = 'tapd65b-exit-bar';
      bar.innerHTML = '<button type="button" class="tapd65b-exit primary" id="tapd67PanelCapture">Capture this moment</button><button type="button" class="tapd65b-exit" id="tapd67PanelProfile">Back to profile</button>';
      body.insertBefore(bar, body.firstChild);
      bindButton(byId('tapd67PanelCapture'), goToCapture, 'panel-capture');
      bindButton(byId('tapd67PanelProfile'), goToProfile, 'panel-profile');
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
          .replace(/Keep Warm/g, 'Stay in Touch')
          .replace(/Keep warm/g, 'Stay in touch')
          .replace(/keep warm/g, 'stay in touch')
          .replace(/Stay in touch instead/g, 'Stay in touch instead')
          .replace(/Active/g, 'Currently in use')
          .replace(/Edit fields/g, 'Customise fields')
          .replace(/People who tapped your NFC card and sent their TAPD card\. Accept to start capturing\./g, "People you've connected with. Connections from NFC taps and captured conversations appear here.");
        if (nv !== v) n.nodeValue = nv;
      });
    } catch(e) {}
  }

  function getCurrentTemplateKey(){
    try { if (window.currentRelationshipMode) return String(window.currentRelationshipMode); } catch(e){}
    try { var sel = byId('nextStepTemplateSelect'); if (sel && sel.value) return sel.value; } catch(e){}
    return 'direct_opportunity';
  }

  function isProPlan(){
    try {
      var possible = [
        localStorage.getItem('tapd_plan'), localStorage.getItem('tapdPlan'), localStorage.getItem('tapd_subscription'),
        localStorage.getItem('tapdAccountPlan'), localStorage.getItem('tapd_user_plan')
      ].join(' ').toLowerCase();
      if (/pro|paid|premium|unlocked/.test(possible)) return true;
      if (document.body.classList.contains('plan-pro') || document.body.classList.contains('tapd-pro')) return true;
    } catch(e){}
    return false;
  }

  function starterEditableTemplate(){
    try {
      var saved = localStorage.getItem(STARTER_EDITABLE_KEY);
      if (saved) return saved;
      var current = getCurrentTemplateKey();
      localStorage.setItem(STARTER_EDITABLE_KEY, current);
      return current;
    } catch(e){ return getCurrentTemplateKey(); }
  }

  function inferTemplateKeyFromCard(card, index){
    var txt = textOf(card).toLowerCase();
    if (/direct opportunity/.test(txt)) return 'direct_opportunity';
    if (/connector|referral/.test(txt)) return 'connector_referral';
    if (/pilot|beta/.test(txt)) return 'pilot_beta';
    if (/collaboration|partnership/.test(txt)) return 'collaboration';
    if (/stay in touch|keep warm|unclear/.test(txt)) return 'keep_warm';
    return 'template_' + index;
  }

  function applyStarterTemplateGuardrails(page){
    try {
      if (!page || isProPlan()) {
        document.querySelectorAll('.tapd67-starter-note').forEach(function(n){ n.remove(); });
        document.querySelectorAll('.tapd67-view-only').forEach(function(card){
          card.classList.remove('tapd67-view-only');
          card.querySelectorAll('input,textarea,select,button').forEach(function(el){ el.disabled = false; });
        });
        return;
      }
      var allowed = starterEditableTemplate();
      var cards = Array.prototype.slice.call(page.querySelectorAll('.tpl-list-card'));
      cards.forEach(function(card, index){
        var key = inferTemplateKeyFromCard(card, index);
        var canEdit = key === allowed || card.classList.contains('is-my-template') || /currently in use/i.test(textOf(card));
        card.classList.toggle('tapd67-view-only', !canEdit);
        var note = card.querySelector('.tapd67-starter-note');
        if (!canEdit && !note) {
          note = document.createElement('div');
          note.className = 'tapd67-starter-note';
          note.textContent = 'Starter can use this template, but editing is view-only. Pro unlocks editing across all templates.';
          card.appendChild(note);
        } else if (canEdit && note) {
          note.remove();
        }
        card.querySelectorAll('.tpl-field-label-input,.my-script-ta,.tpl-custom-input,textarea,input').forEach(function(el){
          if (!canEdit) el.setAttribute('readonly','readonly');
          else el.removeAttribute('readonly');
        });
        card.querySelectorAll('.tpl-field-toggle,.tpl-add-custom-btn,.my-script-save-btn,.my-script-clear-btn,.tpl-save-btn,.tpl-reset-btn').forEach(function(el){
          el.disabled = !canEdit;
        });
        card.querySelectorAll('button').forEach(function(btn){
          var label = textOf(btn).toLowerCase();
          if (!canEdit && /customise|customize|edit|save|reset|add/.test(label)) {
            btn.disabled = true;
          }
        });
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
      if (!byId('tapd65bTemplateExits') && !byId('tapd67TemplateExits')) {
        var hdr = page.querySelector('.tpl-editor-hdr') || page.firstElementChild;
        var exits = document.createElement('div');
        exits.id = 'tapd67TemplateExits';
        exits.className = 'tapd65b-template-exits';
        exits.innerHTML = '<button type="button" class="tapd65b-exit primary" id="tapd67TemplateCapture">Capture this moment</button><button type="button" class="tapd65b-exit" id="tapd67TemplateProfile">Back to profile</button>';
        if (hdr && hdr.parentNode) hdr.parentNode.insertBefore(exits, hdr.nextSibling);
        else page.insertBefore(exits, page.firstChild);
        bindButton(byId('tapd67TemplateCapture'), goToCapture, 'template-capture');
        bindButton(byId('tapd67TemplateProfile'), goToProfile, 'template-profile');
      }
      replaceVisibleText(page);
      page.querySelectorAll('.tpl-list-card-badge,.quick-template-pill.selected').forEach(function(el){
        if (/active/i.test(el.textContent) || /currently/i.test(el.textContent)) el.textContent = 'Currently in use';
      });
      page.querySelectorAll('.tpl-list-card').forEach(function(card){
        var isActive = /Currently in use|Active/i.test(card.textContent);
        card.querySelectorAll('button').forEach(function(btn){
          if (btn.textContent.trim() === 'Edit') btn.textContent = isActive ? 'Customise fields' : 'View fields';
        });
      });
      applyStarterTemplateGuardrails(page);
    } catch(e) {}
  }

  function isHubLike(el){
    if (!el) return false;
    var node = el;
    while (node && node !== document.body) {
      var id = (node.id || '').toLowerCase();
      var cls = (node.className || '').toString().toLowerCase();
      if (/relationship|inbox|hub|connection|owner-side-panel/.test(id + ' ' + cls)) return true;
      node = node.parentNode;
    }
    return false;
  }

  function simplifyRelationshipHub(root){
    try {
      var scope = root || document.body;
      scope.querySelectorAll('button,[role="tab"],.tab,.hub-tab,.inbox-tab,.rel-tab,.queue-tab,.owner-side-count span').forEach(function(el){
        if (!isHubLike(el)) return;
        var t = textOf(el);
        if (/^Captured$/i.test(t)) el.textContent = 'Pending Review';
        if (/^Drafts$/i.test(t)) {
          el.classList.add('tapd67-hidden-tab');
          el.setAttribute('aria-hidden','true');
          el.style.display = 'none';
          if (el.classList.contains('active') || el.getAttribute('aria-selected') === 'true') {
            var pending = Array.prototype.find.call(document.querySelectorAll('button,[role="tab"],.tab,.hub-tab,.inbox-tab,.rel-tab,.queue-tab'), function(x){ return /Pending Review|Captured/i.test(textOf(x)); });
            if (pending && pending.click) pending.click();
          }
        }
      });
      var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function(n){
        if (!isHubLike(n.parentNode)) return;
        var v = n.nodeValue || '';
        var nv = v
          .replace(/People who tapped your NFC card and sent their TAPD card\. Accept to start capturing\./g, "People you've connected with. Connections from NFC taps and captured conversations appear here.")
          .replace(/\bCaptured\b/g, 'Pending Review')
          .replace(/\bDrafts\b/g, '')
          .replace(/Keep warm/g, 'Stay in touch')
          .replace(/Keep Warm/g, 'Stay in Touch')
          .replace(/keep warm/g, 'stay in touch');
        if (nv !== v) n.nodeValue = nv;
      });
    } catch(e) {}
  }

  function enhanceRelationshipHub(){
    try {
      replaceVisibleText(document.body);
      simplifyRelationshipHub(document.body);
      addPanelEscapeRoutes('Relationship Hub');
    } catch(e){}
  }

  function ensureGlobalCaptureButton(){
    try {
      var btn = byId('tapd67GlobalCapture');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'tapd67GlobalCapture';
        btn.type = 'button';
        btn.className = 'tapd67-global-capture';
        btn.textContent = 'Capture this moment';
        document.body.appendChild(btn);
      }
      bindButton(btn, goToCapture, 'global-capture');
      updateGlobalCaptureVisibility();
    } catch(e) {}
  }

  function updateGlobalCaptureVisibility(){
    try {
      var btn = byId('tapd67GlobalCapture');
      if (!btn) return;
      var captureActive = byId('capture') && byId('capture').classList.contains('active');
      var profileActive = byId('profile') && byId('profile').classList.contains('active');
      var ownerPanelOpen = byId('ownerSidePanel') && byId('ownerSidePanel').classList.contains('open');
      var templateActive = byId('page-template-editor') && byId('page-template-editor').classList.contains('active');
      var floatingOpen = !!document.querySelector('.quick-template-overlay,.fu-modal-overlay,.upgrade-sheet.open,.connect-sheet.open');
      var shouldShow = isOwnerView() && !captureActive && (templateActive || ownerPanelOpen || floatingOpen || !profileActive);
      btn.classList.toggle('show', !!shouldShow);
    } catch(e) {}
  }

  function neutralizeInactiveLayers(){
    try {
      document.querySelectorAll('.owner-side-backdrop').forEach(function(el){
        if (!document.body.classList.contains('owner-panel-open')) el.style.pointerEvents = 'none';
      });
      if (document.body.classList.contains('owner-panel-open')) {
        document.querySelectorAll('.owner-side-backdrop').forEach(function(el){ el.style.pointerEvents = 'auto'; });
      }
      document.querySelectorAll('.upgrade-sheet:not(.open),.connect-sheet:not(.open)').forEach(function(el){ el.style.pointerEvents = 'none'; });
      document.querySelectorAll('.upgrade-sheet.open,.connect-sheet.open').forEach(function(el){ el.style.pointerEvents = 'auto'; });
    } catch(e) {}
  }

  function injectStyles(){
    if (byId('tapd67Styles')) return;
    var css = document.createElement('style');
    css.id = 'tapd67Styles';
    css.textContent = '\n'
      + '/* UPDATE 67 */\n'
      + '.tapd-hard-owner-header{pointer-events:none!important;z-index:9600!important;}\n'
      + '.tapd-hard-owner-header button,.owner-bar button,.owner-btn,.owner-side-tab-btn,.quick-template-option,.tpl-list-card-btn,.conn-btn{min-height:46px!important;touch-action:manipulation!important;pointer-events:auto!important;cursor:pointer!important;position:relative!important;z-index:9601!important;-webkit-user-select:none!important;user-select:none!important;}\n'
      + '.tapd-hard-owner-header{gap:10px!important;padding-top:12px!important;padding-bottom:12px!important;}\n'
      + '.tapd-hard-owner-header button{border-radius:999px!important;font-size:11px!important;font-weight:900!important;}\n'
      + '.capture-footer,.send-bar{z-index:9550!important;pointer-events:auto!important;}\n'
      + '.capture-footer button,.send-bar button,.btn-capture,.btn-stop,.btn-confirm,.btn-send{touch-action:manipulation!important;pointer-events:auto!important;position:relative!important;z-index:9551!important;}\n'
      + '.owner-side-backdrop{pointer-events:none!important;} body.owner-panel-open .owner-side-backdrop{pointer-events:auto!important;}\n'
      + '.upgrade-sheet:not(.open),.connect-sheet:not(.open){pointer-events:none!important;} .upgrade-sheet.open,.connect-sheet.open{pointer-events:auto!important;}\n'
      + '.tapd65b-exit-bar,.tapd65b-template-exits{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 14px;}\n'
      + '.tapd65b-template-exits{padding:0 16px;}\n'
      + '.tapd65b-exit{min-height:44px;border-radius:12px;border:1px solid var(--border);background:transparent;color:var(--t2);font-family:Inter,sans-serif;font-size:12px;font-weight:800;cursor:pointer;padding:0 12px;touch-action:manipulation;}\n'
      + '.tapd65b-exit.primary{background:linear-gradient(135deg,#EAB308,#ca8a04);border-color:#EAB308;color:#000;}\n'
      + '.tapd65b-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:9800;max-width:330px;background:#111;border:1px solid var(--gold-b);color:var(--gold);border-radius:12px;padding:10px 14px;font:700 12px Inter,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.55);}\n'
      + '.tapd67-global-capture{display:none;position:fixed;left:50%;bottom:86px;transform:translateX(-50%);width:calc(100% - 32px);max-width:398px;min-height:48px;border-radius:16px;background:linear-gradient(135deg,#EAB308,#ca8a04);border:1px solid #EAB308;color:#000;font-family:Inter,sans-serif;font-size:13px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;z-index:9700;box-shadow:0 12px 34px rgba(0,0,0,.55);cursor:pointer;touch-action:manipulation;}\n'
      + '.tapd67-global-capture.show{display:block;}\n'
      + '.tapd67-hidden-tab{display:none!important;}\n'
      + '.tapd67-view-only{border-color:rgba(234,179,8,.20)!important;background:rgba(234,179,8,.035)!important;}\n'
      + '.tapd67-view-only input,.tapd67-view-only textarea{opacity:.72!important;}\n'
      + '.tapd67-view-only button:disabled{opacity:.45!important;cursor:not-allowed!important;}\n'
      + '.tapd67-starter-note{font-size:11px;color:var(--gold);line-height:1.45;margin-top:10px;padding:9px 10px;border:1px solid var(--gold-b);border-radius:10px;background:var(--gold-dim);}\n'
      + '.tpl-editor-intro strong{color:var(--gold);}\n'
      + '@media(max-width:360px){.tapd65b-exit{font-size:11px;padding:0 8px}.tapd65b-exit-bar,.tapd65b-template-exits{grid-template-columns:1fr}.tapd67-global-capture{bottom:78px;font-size:12px;}}\n';
    document.head.appendChild(css);
  }

  function boot(){
    injectStyles();
    installHardNavHitArea();
    ensureGlobalCaptureButton();
    bindOwnerHeader();
    enhanceTemplatePage();
    enhanceRelationshipHub();
    neutralizeInactiveLayers();
    updateGlobalCaptureVisibility();
    setInterval(function(){
      bindOwnerHeader();
      if (byId('page-template-editor') && byId('page-template-editor').classList.contains('active')) enhanceTemplatePage();
      enhanceRelationshipHub();
      neutralizeInactiveLayers();
      updateGlobalCaptureVisibility();
    }, 650);
    try {
      var mo = new MutationObserver(function(){
        bindOwnerHeader();
        if (byId('page-template-editor') && byId('page-template-editor').classList.contains('active')) enhanceTemplatePage();
        enhanceRelationshipHub();
        neutralizeInactiveLayers();
        ensureGlobalCaptureButton();
        updateGlobalCaptureVisibility();
      });
      mo.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style','aria-selected'] });
    } catch(e) {}
    console.log('[TAPD] Update 67 loaded — tap reliability, capture access, hub labels and template guardrails active.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tapd65bGoCapture = goToCapture;
  window.tapd65bGoProfile = goToProfile;
  window.tapd65bGoTemplates = goToTemplates;
  window.tapd67GoCapture = goToCapture;
  window.tapd67GoProfile = goToProfile;
  window.tapd67GoTemplates = goToTemplates;
})();