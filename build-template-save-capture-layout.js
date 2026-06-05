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
  .tapd-template-inline-save{
    min-width:96px!important;height:46px!important;border-radius:14px!important;
    border:1px solid #EAB308!important;background:linear-gradient(135deg,#EAB308,#ca8a04)!important;
    color:#050505!important;font-family:Inter,sans-serif!important;font-size:13px!important;font-weight:900!important;
    cursor:pointer!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;
    box-shadow:0 8px 22px rgba(234,179,8,.18)!important;
  }
  .tapd-template-inline-save[disabled]{opacity:.42!important;filter:grayscale(.35)!important;cursor:not-allowed!important;box-shadow:none!important;}
  .tapd-template-inline-save-wrap{display:inline-flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;}
  .tapd-template-changed-note{font-size:11px!important;color:#22C55E!important;font-weight:800!important;display:none!important;width:100%;text-align:right!important;margin-top:5px!important;}
  .tapd-template-inline-save-wrap.is-dirty .tapd-template-changed-note{display:block!important;}
  .tapd-template-bottom-capture{
    width:100%!important;min-height:78px!important;border-radius:22px!important;border:1px solid #FACC15!important;
    background:linear-gradient(135deg,#FACC15 0%,#EAB308 48%,#B87503 100%)!important;color:#050505!important;
    font-family:Inter,sans-serif!important;font-size:18px!important;font-weight:950!important;letter-spacing:-.25px!important;
    cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;
    box-shadow:0 0 0 2px rgba(234,179,8,.24),0 14px 34px rgba(234,179,8,.22)!important;
    position:relative!important;overflow:hidden!important;margin:18px 0 4px!important;
  }
  .tapd-template-bottom-capture:before{
    content:"";position:absolute;inset:-45%;background:radial-gradient(circle,rgba(255,255,255,.26),transparent 38%);
    opacity:.0;animation:tapdCapturePulse 2.4s ease-in-out infinite;
  }
  .tapd-template-bottom-capture span{position:relative;z-index:1;}
  .tapd-template-bottom-capture:after{
    content:"";position:absolute;inset:8px;border-radius:18px;border:1px solid rgba(255,255,255,.25);pointer-events:none;
  }
  @keyframes tapdCapturePulse{0%,100%{opacity:.10;transform:scale(.96)}50%{opacity:.32;transform:scale(1.05)}}
  @media(max-width:420px){.tapd-template-bottom-capture{min-height:72px;font-size:16px}.tapd-template-inline-save{min-width:88px;height:43px}}
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
      if(b.closest&&b.closest('.tapd-template-inline-save-wrap'))return false;
      var t=txt(b);
      return t==='edit'||t.indexOf('edit')===0;
    })||null;
  }
  function setDirty(on){
    dirty=!!on;
    document.querySelectorAll('.tapd-template-inline-save').forEach(function(btn){btn.disabled=!dirty;});
    document.querySelectorAll('.tapd-template-inline-save-wrap').forEach(function(w){w.classList.toggle('is-dirty',dirty);});
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
    save.innerHTML='<span>💾</span><span>Save</span>';
    save.onclick=function(ev){ev.preventDefault();ev.stopPropagation();if(!save.disabled)runOriginalSave();};
    wrap.appendChild(save);
    var note=document.createElement('span');
    note.className='tapd-template-changed-note';
    note.textContent='✓ Changes made';
    wrap.appendChild(note);
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
    capture.innerHTML='<span>✦</span><span>Capture this moment</span>';
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
        addInlineSave();
        replaceBottomSave();
        bindDirtyWatch();
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
  console.log('[TAPD build] Applied robust template save/capture layout refinement.');
} else {
  console.log('[TAPD build] Template save/capture layout already present.');
}
