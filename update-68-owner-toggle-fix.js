/* UPDATE 68 — Free toggle between Owner Tools, Templates and Relationship Hub.
   Fixes false unsaved-change blocking when no real edits were made. */
(function(){
  if (window.__tapdUpdate68OwnerToggleFix) return;
  window.__tapdUpdate68OwnerToggleFix = true;

  var cleanSnapshots = {};
  var lastTap = { key:'', at:0 };

  function byId(id){ return document.getElementById(id); }
  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function txt(el){ return (el && el.textContent ? el.textContent : '').replace(/\s+/g,' ').trim(); }
  function safe(fn){ try { return fn(); } catch(e) { return undefined; } }

  function activeScope(){
    var tpl = byId('page-template-editor');
    var panel = byId('ownerSidePanel');
    if (tpl && tpl.classList.contains('active')) return { key:'templates', el:tpl };
    if (panel && panel.classList.contains('open')) return { key:'owner-panel', el:panel };
    return null;
  }

  function editableHash(scopeEl){
    if (!scopeEl) return '';
    var fields = Array.prototype.slice.call(scopeEl.querySelectorAll('input,textarea,select'));
    return fields.map(function(el){
      var id = el.id || el.name || el.className || el.tagName;
      var val = el.type === 'checkbox' || el.type === 'radio' ? String(!!el.checked) : String(el.value || '');
      return id + '=' + val;
    }).join('|');
  }

  function markClean(scopeKey){
    var scope = activeScope();
    if (!scope && scopeKey === 'templates') scope = { key:'templates', el:byId('page-template-editor') };
    if (!scope && scopeKey === 'owner-panel') scope = { key:'owner-panel', el:byId('ownerSidePanel') };
    if (!scope || !scope.el) return;
    cleanSnapshots[scope.key] = editableHash(scope.el);
  }

  function hasRealUnsavedEdits(){
    var scope = activeScope();
    if (!scope || !scope.el) return false;
    var current = editableHash(scope.el);
    if (cleanSnapshots[scope.key] == null) {
      cleanSnapshots[scope.key] = current;
      return false;
    }
    return cleanSnapshots[scope.key] !== current;
  }

  function forceCleanFlags(){
    var names = [
      'hasUnsavedChanges','unsavedChanges','isDirty','dirty','profileDirty','templateDirty','ownerDirty',
      'hasUnsavedOwnerChanges','hasUnsavedTemplateChanges','tapdHasUnsavedChanges','tapdUnsavedChanges'
    ];
    names.forEach(function(name){ safe(function(){ window[name] = false; }); });
    safe(function(){ document.body.classList.remove('unsaved','has-unsaved','dirty','is-dirty'); });
  }

  function withCleanConfirmBypass(fn){
    var oldConfirm = window.confirm;
    window.confirm = function(message){
      var m = String(message || '').toLowerCase();
      if (/unsaved|save changes|discard|leave without saving|changes you made/.test(m)) return true;
      return oldConfirm ? oldConfirm.apply(window, arguments) : true;
    };
    try { fn(); }
    finally { setTimeout(function(){ window.confirm = oldConfirm; }, 120); }
  }

  function closeOwnerPanel(){
    safe(function(){ if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(false); });
    var panel = byId('ownerSidePanel');
    var backdrop = byId('ownerSideBackdrop');
    if (panel) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
    }
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('owner-panel-open');
  }

  function closeFloatingLayers(){
    safe(function(){ if (typeof window.closeQuickTemplateSwitcher31 === 'function') window.closeQuickTemplateSwitcher31(); });
    document.querySelectorAll('.quick-template-overlay,.fu-modal-overlay').forEach(function(el){ safe(function(){ el.remove(); }); });
    document.querySelectorAll('.upgrade-sheet.open,.connect-sheet.open').forEach(function(el){ el.classList.remove('open'); });
  }

  function directShowPage(id){
    document.querySelectorAll('.page').forEach(function(page){ page.classList.remove('active'); });
    var target = byId(id);
    if (target) target.classList.add('active');
    safe(function(){ window.scrollTo(0,0); });
  }

  function ensureTemplateExits(){
    var page = byId('page-template-editor');
    if (!page || byId('tapd68TemplateExits') || byId('tapd67TemplateExits') || byId('tapd65bTemplateExits')) return;
    var hdr = page.querySelector('.tpl-editor-hdr') || page.firstElementChild;
    var exits = document.createElement('div');
    exits.id = 'tapd68TemplateExits';
    exits.className = 'tapd65b-template-exits';
    exits.innerHTML = '<button type="button" class="tapd65b-exit primary" id="tapd68TemplateCapture">Capture this moment</button><button type="button" class="tapd65b-exit" id="tapd68TemplateProfile">Back to profile</button>';
    if (hdr && hdr.parentNode) hdr.parentNode.insertBefore(exits, hdr.nextSibling);
    else page.insertBefore(exits, page.firstChild);
    bindDirect(byId('tapd68TemplateCapture'), 'capture', goCaptureDirect);
    bindDirect(byId('tapd68TemplateProfile'), 'profile', goProfileDirect);
  }

  function ensurePanelExits(title){
    var panel = byId('ownerSidePanel');
    var body = panel && panel.querySelector('.owner-side-body');
    if (!panel || !body) return;
    var existing = byId('tapd68PanelExits') || byId('tapd67PanelExits') || byId('tapd65bPanelExits');
    if (!existing) {
      var bar = document.createElement('div');
      bar.id = 'tapd68PanelExits';
      bar.className = 'tapd65b-exit-bar';
      bar.innerHTML = '<button type="button" class="tapd65b-exit primary" id="tapd68PanelCapture">Capture this moment</button><button type="button" class="tapd65b-exit" id="tapd68PanelProfile">Back to profile</button>';
      body.insertBefore(bar, body.firstChild);
      bindDirect(byId('tapd68PanelCapture'), 'capture', goCaptureDirect);
      bindDirect(byId('tapd68PanelProfile'), 'profile', goProfileDirect);
    }
    var t = panel.querySelector('.owner-side-title');
    if (t && title) t.textContent = title;
  }

  function goProfileDirect(){
    closeFloatingLayers();
    closeOwnerPanel();
    directShowPage('profile');
    setTimeout(function(){ markClean(); }, 80);
  }

  function goCaptureDirect(){
    closeFloatingLayers();
    closeOwnerPanel();
    if (typeof window.goCapture === 'function') safe(function(){ window.goCapture(); });
    else {
      directShowPage('capture');
      safe(function(){ if (typeof window.showScreen === 'function') window.showScreen('sc-idle'); });
      var sc = byId('sc-idle');
      if (sc) {
        document.querySelectorAll('#capture .screen').forEach(function(s){ s.classList.remove('active'); });
        sc.classList.add('active');
      }
    }
    setTimeout(function(){ markClean(); }, 80);
  }

  function goOwnerToolsDirect(){
    closeFloatingLayers();
    directShowPage('profile');
    var panel = byId('ownerSidePanel');
    if (panel) {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden','false');
      document.body.classList.add('owner-panel-open');
    } else {
      safe(function(){ if (typeof window.toggleOwnerSidePanel === 'function') window.toggleOwnerSidePanel(true); });
    }
    ensurePanelExits('Owner Tools');
    setTimeout(function(){ markClean('owner-panel'); }, 120);
  }

  function goTemplatesDirect(){
    closeFloatingLayers();
    closeOwnerPanel();
    directShowPage('page-template-editor');
    ensureTemplateExits();
    safe(function(){ if (typeof window.tapd67GoTemplates === 'function') setTimeout(window.tapd67GoTemplates, 0); });
    setTimeout(function(){
      directShowPage('page-template-editor');
      ensureTemplateExits();
      markClean('templates');
    }, 180);
  }

  function goRelationshipHubDirect(){
    closeFloatingLayers();
    directShowPage('profile');
    var opened = false;
    withCleanConfirmBypass(function(){
      if (typeof window.tapd49OpenRelationshipHub === 'function') { safe(function(){ window.tapd49OpenRelationshipHub(); }); opened = true; }
      else if (typeof window.openTapdInboxFromSide === 'function') { safe(function(){ window.openTapdInboxFromSide(); }); opened = true; }
    });
    if (!opened) {
      var panel = byId('ownerSidePanel');
      if (panel) {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden','false');
        document.body.classList.add('owner-panel-open');
      }
    }
    ensurePanelExits('Relationship Hub');
    setTimeout(function(){
      replaceHubWords();
      markClean('owner-panel');
    }, 160);
  }

  function replaceHubWords(){
    safe(function(){
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function(n){
        var v = n.nodeValue || '';
        var nv = v
          .replace(/People who tapped your NFC card and sent their TAPD card\. Accept to start capturing\./g, "People you've connected with. Connections from NFC taps and captured conversations appear here.")
          .replace(/\bCaptured\b/g, 'Pending Review')
          .replace(/\bDrafts\b/g, '')
          .replace(/Keep Warm/g, 'Stay in Touch')
          .replace(/Keep warm/g, 'Stay in touch')
          .replace(/keep warm/g, 'stay in touch');
        if (nv !== v) n.nodeValue = nv;
      });
      document.querySelectorAll('button,[role="tab"],.tab,.hub-tab,.inbox-tab,.rel-tab,.queue-tab').forEach(function(el){
        if (/^Drafts$/i.test(txt(el))) el.style.display = 'none';
        if (/^Captured$/i.test(txt(el))) el.textContent = 'Pending Review';
      });
    });
  }

  function maybeNavigate(key, action){
    var t = now();
    if (lastTap.key === key && (t - lastTap.at) < 450) return;
    lastTap = { key:key, at:t };

    if (hasRealUnsavedEdits()) {
      var proceed = window.confirm('You have unsaved changes. Leave this section without saving?');
      if (!proceed) return;
    }

    forceCleanFlags();
    withCleanConfirmBypass(action);
  }

  function bindDirect(btn, key, action){
    if (!btn || btn.__tapd68DirectBound) return;
    btn.__tapd68DirectBound = true;
    btn.disabled = false;
    btn.setAttribute('type','button');
    btn.style.pointerEvents = 'auto';
    btn.style.touchAction = 'manipulation';
    var handler = function(ev){
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      }
      maybeNavigate(key, action);
    };
    btn.addEventListener('pointerdown', handler, true);
    btn.addEventListener('touchstart', handler, true);
    btn.addEventListener('click', handler, true);
  }

  function bindTopNav(){
    bindDirect(byId('hardOwnerToolsBtn'), 'owner-tools', goOwnerToolsDirect);
    bindDirect(byId('hardTemplatesBtn'), 'templates', goTemplatesDirect);
    bindDirect(byId('hardInboxBtn') || byId('hardRelHubBtn'), 'relationship-hub', goRelationshipHubDirect);
    document.querySelectorAll('.hard-primary,.hard-template,.hard-inbox,.hard-relhub').forEach(function(btn){
      var label = txt(btn).toLowerCase();
      if (/owner/.test(label)) bindDirect(btn, 'owner-tools', goOwnerToolsDirect);
      else if (/template/.test(label)) bindDirect(btn, 'templates', goTemplatesDirect);
      else if (/relationship|hub/.test(label)) bindDirect(btn, 'relationship-hub', goRelationshipHubDirect);
    });
  }

  function installSaveCleaner(){
    document.addEventListener('click', function(ev){
      var target = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (!target) return;
      var label = txt(target).toLowerCase();
      if (/save|looks good|done|update/.test(label)) {
        setTimeout(function(){ markClean(); forceCleanFlags(); }, 250);
      }
    }, true);
  }

  function injectStyles(){
    if (byId('tapd68ToggleStyles')) return;
    var css = document.createElement('style');
    css.id = 'tapd68ToggleStyles';
    css.textContent = '\n'
      + '/* UPDATE 68 */\n'
      + '#hardOwnerToolsBtn,#hardTemplatesBtn,#hardInboxBtn,#hardRelHubBtn,.hard-primary,.hard-template,.hard-inbox,.hard-relhub{pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;opacity:1!important;}\n'
      + '.tapd-hard-owner-header{pointer-events:none!important;}\n'
      + '.tapd-hard-owner-header button{pointer-events:auto!important;position:relative!important;z-index:9802!important;}\n';
    document.head.appendChild(css);
  }

  function boot(){
    injectStyles();
    bindTopNav();
    installSaveCleaner();
    setTimeout(function(){ markClean(); }, 250);
    setInterval(function(){ bindTopNav(); replaceHubWords(); }, 700);
    safe(function(){
      var mo = new MutationObserver(function(){ bindTopNav(); });
      mo.observe(document.body, { childList:true, subtree:true });
    });
    console.log('[TAPD] Update 68 loaded — owner tools/templates/relationship hub can toggle freely when clean.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tapd68GoOwnerTools = function(){ maybeNavigate('owner-tools-api', goOwnerToolsDirect); };
  window.tapd68GoTemplates = function(){ maybeNavigate('templates-api', goTemplatesDirect); };
  window.tapd68GoRelationshipHub = function(){ maybeNavigate('relationship-hub-api', goRelationshipHubDirect); };
})();