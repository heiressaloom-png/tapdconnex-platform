const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

html = html.replace(/<style id="tapdTemplateSaveCaptureLayoutStyle">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script id="tapdTemplateSaveCaptureLayoutScript">[\s\S]*?<\/script>/g, '');

const style = String.raw`
<style id="tapdTemplateSaveCaptureLayoutStyle">
  .tapd-template-original-save-hidden{display:none!important;visibility:hidden!important;pointer-events:none!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;}

  /* Keep Capture this moment only at the bottom of Templates. */
  .tapd-template-action-bar .tapd-template-capture-btn{display:none!important;visibility:hidden!important;pointer-events:none!important;}
  .tapd-template-action-bar .tapd-template-action-row{grid-template-columns:1fr!important;}
  .tapd-template-action-bar .tapd-template-cheat-btn{width:100%!important;}

  .tapd-template-inline-save{
    min-width:68px!important;height:38px!important;padding:0 11px!important;border-radius:12px!important;
    border:1px solid #EAB308!important;background:linear-gradient(135deg,#EAB308,#ca8a04)!important;
    color:#050505!important;font-family:Inter,sans-serif!important;font-size:12px!important;font-weight:900!important;
    cursor:pointer!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;
    box-shadow:0 6px 16px rgba(234,179,8,.16)!important;line-height:1!important;
  }
  .tapd-template-inline-save svg{width:11px!important;height:11px!important;display:block!important;stroke-width:2.7!important;}
  .tapd-template-inline-save[disabled]{opacity:.42!important;filter:grayscale(.35)!important;cursor:not-allowed!important;box-shadow:none!important;}
  .tapd-template-inline-save-wrap{display:inline-flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;}
  .tapd-template-changed-note{font-size:11px!important;color:#22C55E!important;font-weight:800!important;display:none!important;width:100%;text-align:right!important;margin-top:5px!important;}
  .tapd-template-inline-save-wrap.is-dirty .tapd-template-changed-note{display:block!important;}

  .tapd-template-bottom-capture{
    width:100%!important;max-width:none!important;height:62px!important;min-height:0!important;border-radius:18px!important;border:1px solid #EAB308!important;
    background:linear-gradient(135deg,#FACC15 0%,#EAB308 52%,#B87503 100%)!important;color:#050505!important;
    font-family:Inter,sans-serif!important;font-size:14px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:1.5px!important;
    cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;
    box-shadow:0 0 0 1px rgba(234,179,8,.18),0 8px 20px rgba(234,179,8,.18)!important;
    position:relative!important;overflow:hidden!important;margin:14px 0 4px!important;padding:0 22px!important;
    animation:tapdCaptureLive 2.6s ease-in-out infinite!important;
  }
  .tapd-template-bottom-capture:before{
    content:"";position:absolute;inset:-60%;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.24) 48%,transparent 62%);
    opacity:.0;animation:tapdCaptureShimmer 2.7s ease-in-out infinite;
  }
  .tapd-template-bottom-capture span{position:relative;z-index:1;}
  .tapd-template-bottom-capture .tapd-capture-wave{position:relative;z-index:1;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:3px!important;width:30px!important;height:18px!important;}
  .tapd-template-bottom-capture .tapd-capture-wave i{display:block!important;width:3px!important;border-radius:999px!important;background:#050505!important;opacity:.48!important;animation:tapdWaveLive 1.15s ease-in-out infinite!important;}
  .tapd-template-bottom-capture .tapd-capture-wave i:nth-child(1){height:7px!important;animation-delay:.00s!important;}
  .tapd-template-bottom-capture .tapd-capture-wave i:nth-child(2){height:12px!important;animation-delay:.10s!important;}
  .tapd-template-bottom-capture .tapd-capture-wave i:nth-child(3){height:18px!important;animation-delay:.20s!important;}
  .tapd-template-bottom-capture .tapd-capture-wave i:nth-child(4){height:12px!important;animation-delay:.30s!important;}
  .tapd-template-bottom-capture .tapd-capture-wave i:nth-child(5){height:7px!important;animation-delay:.40s!important;}
  .tapd-template-bottom-capture:after{
    content:"";position:absolute;inset:6px;border-radius:14px;border:1px solid rgba(255,255,255,.20);pointer-events:none;
  }
  @keyframes tapdCaptureLive{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1px) scale(1.004)}}
  @keyframes tapdCaptureShimmer{0%,18%{opacity:0;transform:translateX(-22%)}38%{opacity:.20}58%,100%{opacity:0;transform:translateX(22%)}}
  @keyframes tapdWaveLive{0%,100%{transform:scaleY(.78);opacity:.40}50%{transform:scaleY(1.08);opacity:.66}}
  @media(max-width:420px){.tapd-template-bottom-capture{width:100%!important;height:56px!important;font-size:12px!important;letter-spacing:1.3px!important;border-radius:16px!important;gap:10px!important;padding:0 18px!important}.tapd-template-bottom-capture:after{inset:5px!important;border-radius:12px!important}.tapd-template-inline-save{height:36px!important;font-size:11px!important;min-width:64px!important}}
</style>`;

const script = String.raw`
<script id="tapdTemplateSaveCaptureLayoutScript">
(function(){
  if(window.__tapdTemplateSaveCaptureLayout)return;
  window.__tapdTemplateSaveCaptureLayout=true;
  var dirty=false;
  var applying=false;

  function txt(el){return (el&&el.textContent?el.textContent:'').replace(/\s+/g,' ').trim().toLowerCase();}
  function looksLikeTemplateScreen(){
    var bodyText=txt(document.body).slice(0,5000);
    return bodyText.indexOf('ready to capture with')>=0||bodyText.indexOf('direct opportunity')>=0||bodyText.indexOf('starter')>=0||bodyText.indexOf('pro unlocks all')>=0||bodyText.indexOf('save template changes')>=0;
  }
  function findOriginalSave(){
    var buttons=[].slice.call(document.querySelectorAll('button'));
    return buttons.find(function(b){
      if(b.id==='tapdTemplateBottomCapture'||b.classList.contains('tapd-template-inline-save'))return false;
      var t=txt(b);
      return t==='save template changes'||t.indexOf('save template changes')>=0;
    })||null;
  }
  function findEditButton(){
    var buttons=[].slice.call(document.querySelectorAll('button'));
    return buttons.find(function(b){
      if(b.closest&&(
        b.closest('.tapd-template-inline-save-wrap')||
        b.closest('#tapdHardOwnerHeader')||
        b.closest('#tapdTemplateActionBar')||
        b.closest('#tapdTemplateBottomCapture')
      ))return false;
      var t=txt(b);
      return t==='edit'||t.indexOf('edit')===0;
    })||null;
  }
  function setDirty(on){
    dirty=!!on;
    document.querySelectorAll('.tapd-template-inline-save').forEach(function(btn){btn.disabled=!dirty;});
    document.querySelectorAll('.tapd-template-inline-save-wrap').forEach(function(w){w.classList.toggle('is-dirty',dirty);});
  }
  function syncSaveSize(save,edit){
    if(!save||!edit||typeof getComputedStyle==='undefined')return;
    try{
      var r=edit.getBoundingClientRect();
      var cs=getComputedStyle(edit);
      if(r&&r.height>24)save.style.setProperty('height',Math.round(r.height)+'px','important');
      if(r&&r.width>40)save.style.setProperty('min-width',Math.max(64,Math.round(r.width))+'px','important');
      if(cs.borderRadius)save.style.setProperty('border-radius',cs.borderRadius,'important');
      if(cs.fontSize)save.style.setProperty('font-size',cs.fontSize,'important');
    }catch(e){}
  }
  function syncAllSaveSizes(){
    document.querySelectorAll('.tapd-template-inline-save-wrap').forEach(function(w){
      syncSaveSize(w.querySelector('.tapd-template-inline-save'),w.querySelector('button:not(.tapd-template-inline-save)'));
    });
  }
  function hideDuplicateTopCapture(){
    document.querySelectorAll('.tapd-template-action-bar .tapd-template-capture-btn').forEach(function(btn){
      btn.style.setProperty('display','none','important');
      btn.style.setProperty('visibility','hidden','important');
      btn.style.setProperty('pointer-events','none','important');
    });
    document.querySelectorAll('.tapd-template-action-bar .tapd-template-action-row').forEach(function(row){
      row.style.setProperty('grid-template-columns','1fr','important');
    });
  }
  function runOriginalSave(){
    var original=findOriginalSave();
    if(original){
      original.classList.remove('tapd-template-original-save-hidden');
      original.style.display='';
      original.click();
      original.classList.add('tapd-template-original-save-hidden');
      original.style.setProperty('display','none','important');
      setDirty(false);
      if(typeof window.tapdToast==='function')window.tapdToast('Template changes saved','success');
      return;
    }
    if(typeof window.tapdToast==='function')window.tapdToast('Template changes saved','success');
    setDirty(false);
  }
  function startCapture(){
    try{
      var active=localStorage.getItem('tapd_active_template')||'direct_opportunity';
      localStorage.setItem('tapd_active_template',active);
    }catch(e){}
    if(typeof window.goCapture==='function'){window.goCapture();return;}
    if(typeof window.showPage==='function'){window.showPage('capture');return;}
    var cap=document.getElementById('capture')||document.getElementById('page-capture');
    if(cap){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});cap.classList.add('active');}
  }
  function addInlineSave(){
    var edit=findEditButton();
    if(!edit||edit.dataset.tapdInlineSaveAttached==='1')return;
    edit.dataset.tapdInlineSaveAttached='1';
    var wrap=document.createElement('span');
    wrap.className='tapd-template-inline-save-wrap';
    edit.parentNode.insertBefore(wrap,edit);
    wrap.appendChild(edit);
    var save=document.createElement('button');
    save.type='button';
    save.className='tapd-template-inline-save';
    save.disabled=true;
    save.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"></path><path d="M17 21v-8H7v8"></path><path d="M7 3v5h8"></path></svg><span>Save</span>';
    save.onclick=function(ev){ev.preventDefault();ev.stopPropagation();if(!save.disabled)runOriginalSave();};
    wrap.appendChild(save);
    var note=document.createElement('span');
    note.className='tapd-template-changed-note';
    note.textContent='✓ Changes made';
    wrap.appendChild(note);
    syncSaveSize(save,edit);
  }
  function replaceBottomSave(){
    var original=findOriginalSave();
    if(!original)return;
    original.classList.add('tapd-template-original-save-hidden');
    original.style.setProperty('display','none','important');
    original.style.setProperty('visibility','hidden','important');
    original.style.setProperty('height','0','important');
    original.style.setProperty('min-height','0','important');
    original.style.setProperty('margin','0','important');
    original.style.setProperty('padding','0','important');
    if(document.getElementById('tapdTemplateBottomCapture'))return;
    var capture=document.createElement('button');
    capture.id='tapdTemplateBottomCapture';
    capture.type='button';
    capture.className='tapd-template-bottom-capture';
    capture.innerHTML='<span class="tapd-capture-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span>Capture this moment</span>';
    capture.onclick=function(ev){ev.preventDefault();ev.stopPropagation();startCapture();};
    var host=original.parentNode||document.body;
    host.insertBefore(capture,original);
  }
  function bindDirtyWatch(){
    if(document.body.dataset.tapdDirtyWatch==='1')return;
    document.body.dataset.tapdDirtyWatch='1';
    ['input','change','keyup','paste'].forEach(function(evt){
      document.addEventListener(evt,function(e){
        var target=e.target;
        if(target&&(/input|textarea|select/i.test(target.tagName)||target.isContentEditable))setDirty(true);
      },true);
    });
  }
  function apply(){
    if(applying)return;
    applying=true;
    try{
      if(looksLikeTemplateScreen()){
        hideDuplicateTopCapture();
        addInlineSave();
        replaceBottomSave();
        bindDirtyWatch();
        syncAllSaveSizes();
        setDirty(dirty);
      }
    }finally{applying=false;}
  }
  function boot(){
    apply();
    setTimeout(apply,100);
    setTimeout(apply,400);
    setTimeout(apply,1000);
    setTimeout(apply,2000);
    if(typeof MutationObserver!=='undefined'){
      var mo=new MutationObserver(function(){setTimeout(apply,40);});
      mo.observe(document.body,{childList:true,subtree:true});
    }
    if(typeof window.tpl56Open==='function'&&!window.__tapdTemplateSaveLayoutWrapped){
      window.__tapdTemplateSaveLayoutWrapped=true;
      var originalOpen=window.tpl56Open;
      window.tpl56Open=function(){var result=originalOpen.apply(window,arguments);setTimeout(apply,80);setTimeout(apply,300);setTimeout(apply,900);return result;};
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
</script>`;

if (html.includes('</head>')) html = html.replace(/<\/head>/i, style+'\n</head>');
else html = style+'\n'+html;
if (html.includes('</body>')) html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, script+'\n</body>');
else html += '\n'+script+'\n';

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Applied smaller template capture CTA matching primary capture proportions.');
} else {
  console.log('[TAPD build] Template save/capture layout already present.');
}
