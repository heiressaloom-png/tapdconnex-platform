const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

html = html.replace(/<script id="tapdScenarioATapToNudge">[\s\S]*?<\/script>/g, '');

const controller = String.raw`
<!-- SCENARIO A: ONE-SIDED TAPD — TAP-TO-NUDGE -->
<script id="tapdScenarioATapToNudge">
(function(){
  if(window.__tapdScenarioATapToNudge)return;
  window.__tapdScenarioATapToNudge=true;

  function byId(id){return document.getElementById(id);}
  function safe(v){return String(v==null?'':v).trim();}
  function normPhone(v){return safe(v).replace(/[^0-9]/g,'');}
  function firstName(name){return safe(name).split(/\s+/)[0]||'there';}
  function getProfile(){
    try{if(typeof window.getProfileData==='function')return window.getProfileData()||{};}catch(e){}
    try{return JSON.parse(localStorage.getItem('tapd_profile')||'{}')||{};}catch(e){return{};}
  }
  function getOwnerWhatsApp(){
    var p=getProfile();
    return normPhone(p.whatsApp||p.whatsapp||p.whatsappNumber||p.phone||p.mobile||'');
  }
  function getOwnerName(){
    var p=getProfile();
    return safe(p.name||p.fullName||p.displayName||'');
  }
  function buildWhatsAppUrl(){
    var num=getOwnerWhatsApp();
    if(!num)return '';
    var owner=firstName(getOwnerName());
    var msg='Hi '+owner+', I just tapped your TAPD card. Please send me the next step here.';
    return 'https://wa.me/'+num+'?text='+encodeURIComponent(msg);
  }
  function isOwnerWorkspace(){
    return document.body.classList.contains('tapd-owner-tools-mode')||document.body.classList.contains('ot55-active')||document.body.classList.contains('owner-panel-open');
  }
  function isVisitorLike(){
    try{
      var q=new URLSearchParams(location.search||'');
      if(q.get('visitor')==='1'||q.get('nfc')==='1'||q.get('view')==='visitor'||q.get('mode')==='visitor')return true;
    }catch(e){}
    return !isOwnerWorkspace();
  }
  function injectStyles(){
    if(byId('tapdScenarioAStyles'))return;
    var st=document.createElement('style');
    st.id='tapdScenarioAStyles';
    st.textContent='\n'
      +'.tapd-a-nudge-card{margin:14px 0 12px;padding:14px;border-radius:18px;background:linear-gradient(135deg,rgba(34,197,94,.12),rgba(14,206,192,.05));border:1px solid rgba(34,197,94,.28);box-shadow:0 10px 30px rgba(0,0,0,.18);}\n'
      +'.tapd-a-nudge-kicker{font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#22C55E;margin:0 0 5px;}\n'
      +'.tapd-a-nudge-title{font-size:15px;font-weight:900;color:#F0F4F8;margin:0 0 5px;}\n'
      +'.tapd-a-nudge-copy{font-size:12px;line-height:1.5;color:#8B9EB0;margin:0 0 12px;}\n'
      +'.tapd-a-nudge-btn{width:100%;height:46px;border-radius:14px;border:1px solid rgba(34,197,94,.6);background:linear-gradient(135deg,#22C55E,#16A34A);color:#04130A;font-family:Inter,sans-serif;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;}\n'
      +'.tapd-a-nudge-note{font-size:10px;color:rgba(255,255,255,.42);text-align:center;margin:8px 0 0;line-height:1.4;}\n'
      +'#tapdScenarioANudgeSheet{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;opacity:0;pointer-events:none;transition:opacity .18s ease;}\n'
      +'#tapdScenarioANudgeSheet.show{opacity:1;pointer-events:auto;}\n'
      +'.tapd-a-sheet{width:min(430px,calc(100vw - 24px));margin:0 12px 18px;background:#0D1117;border:1px solid rgba(34,197,94,.34);border-radius:22px;padding:18px 16px 16px;box-shadow:0 18px 60px rgba(0,0,0,.55);font-family:Inter,sans-serif;}\n'
      +'.tapd-a-sheet-title{font-size:18px;font-weight:900;color:#F0F4F8;margin:0 0 6px;}\n'
      +'.tapd-a-sheet-copy{font-size:12px;line-height:1.55;color:#8B9EB0;margin:0 0 14px;}\n'
      +'.tapd-a-sheet-actions{display:grid;grid-template-columns:1fr 96px;gap:8px;}\n'
      +'.tapd-a-sheet-primary,.tapd-a-sheet-secondary{height:44px;border-radius:14px;font-family:Inter,sans-serif;font-size:12px;font-weight:900;cursor:pointer;}\n'
      +'.tapd-a-sheet-primary{background:linear-gradient(135deg,#22C55E,#16A34A);border:1px solid rgba(34,197,94,.7);color:#04130A;}\n'
      +'.tapd-a-sheet-secondary{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);color:#8B9EB0;}\n'
      +'.tapd-capture-context-tip{margin:10px 0 12px;padding:11px 12px;border-radius:14px;border:1px solid rgba(234,179,8,.22);background:rgba(234,179,8,.07);font-size:11px;line-height:1.5;color:#D1D5DB;}\n'
      +'.tapd-capture-context-tip strong{color:#EAB308;}';
    document.head.appendChild(st);
  }
  function recordNudge(){
    try{localStorage.setItem('tapd_last_tap_to_nudge',JSON.stringify({channel:'whatsapp',owner:getOwnerName(),at:new Date().toISOString(),source:'scenario_a'}));}catch(e){}
  }
  function openWhatsApp(){
    var url=buildWhatsAppUrl();
    if(!url){if(typeof window.tapdToast==='function')window.tapdToast('WhatsApp is not set up on this profile yet','warn');return;}
    recordNudge();
    window.location.href=url;
  }
  function buildCard(){
    if(!buildWhatsAppUrl())return null;
    var wrap=document.createElement('div');
    wrap.id='tapdScenarioANudgeCard';
    wrap.className='tapd-a-nudge-card';
    wrap.innerHTML='<p class="tapd-a-nudge-kicker">Tap-to-Nudge</p>'
      +'<p class="tapd-a-nudge-title">Send me a quick WhatsApp</p>'
      +'<p class="tapd-a-nudge-copy">Tap WhatsApp so I know where to send the next step after our conversation.</p>'
      +'<button type="button" class="tapd-a-nudge-btn">💬 Tap WhatsApp</button>'
      +'<p class="tapd-a-nudge-note">No typing needed — WhatsApp opens with a ready-made hello. You still press send.</p>';
    wrap.querySelector('button').onclick=openWhatsApp;
    return wrap;
  }
  function findInsertTarget(){
    return byId('tapdVcardBtn')||document.querySelector('[onclick*="generateVCard"]')||document.querySelector('[href*="wa.me"]')||document.querySelector('.identity')||byId('profile');
  }
  function ensureNudgeCard(){
    if(!isVisitorLike())return;
    injectStyles();
    if(byId('tapdScenarioANudgeCard'))return;
    var card=buildCard(); if(!card)return;
    var target=findInsertTarget(); if(!target)return;
    var container=target.closest&&target.closest('div')?target.closest('div'):target;
    if(target.id==='profile'||(target.classList&&target.classList.contains('identity')))target.appendChild(card);
    else if(container&&container.parentNode)container.parentNode.insertBefore(card,container.nextSibling);
  }
  function showAfterSaveSheet(){
    if(!buildWhatsAppUrl())return;
    var old=byId('tapdScenarioANudgeSheet'); if(old)old.remove();
    var sheet=document.createElement('div');
    sheet.id='tapdScenarioANudgeSheet';
    sheet.innerHTML='<div class="tapd-a-sheet">'
      +'<p class="tapd-a-sheet-title">Details saved.</p>'
      +'<p class="tapd-a-sheet-copy">Want me to send the next step? Tap WhatsApp so I know where to follow up.</p>'
      +'<div class="tapd-a-sheet-actions"><button type="button" class="tapd-a-sheet-primary">Tap WhatsApp</button><button type="button" class="tapd-a-sheet-secondary">Not now</button></div>'
      +'</div>';
    document.body.appendChild(sheet);
    sheet.querySelector('.tapd-a-sheet-primary').onclick=function(){openWhatsApp();};
    sheet.querySelector('.tapd-a-sheet-secondary').onclick=function(){sheet.remove();};
    sheet.onclick=function(e){if(e.target===sheet)sheet.remove();};
    setTimeout(function(){sheet.classList.add('show');},20);
  }
  function bindSaveContactNudge(){
    document.addEventListener('click',function(ev){
      var btn=ev.target&&ev.target.closest?ev.target.closest('button,a'):null;
      if(!btn)return;
      var label=(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      var onclick=String(btn.getAttribute('onclick')||'');
      var isVcard=btn.id==='tapdVcardBtn'||onclick.indexOf('generateVCard')>=0||(label.indexOf('save')>=0&&label.indexOf('contact')>=0);
      if(isVcard)setTimeout(showAfterSaveSheet,450);
    },true);
  }
  function ensureCaptureTip(){
    if(byId('tapdCaptureContextTip'))return;
    var cap=byId('capture')||document.querySelector('[id*="capture"]');
    if(!cap)return;
    var tip=document.createElement('div');
    tip.id='tapdCaptureContextTip';
    tip.className='tapd-capture-context-tip';
    tip.innerHTML='<strong>Tip for one-sided TAPD:</strong> say their name and channel out loud. Example: “This is Sarah from ABC. WhatsApp is best.”';
    var anchor=cap.querySelector('button')||cap.firstElementChild;
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(tip,anchor);
    else cap.insertBefore(tip,cap.firstChild);
  }
  function observeCapture(){
    var run=function(){
      var active=document.querySelector('#capture.active,.page.active#capture,.screen.active');
      if(active&&/capture|record|idle/i.test(active.id+' '+active.className+' '+active.textContent.slice(0,160)))ensureCaptureTip();
    };
    run();
    setInterval(run,1200);
  }
  function boot(){
    injectStyles();
    ensureNudgeCard();
    bindSaveContactNudge();
    observeCapture();
    setTimeout(ensureNudgeCard,300);
    setTimeout(ensureNudgeCard,1000);
    console.log('[TAPD] Scenario A Tap-to-Nudge active.');
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
  console.log('[TAPD build] Applied Scenario A Tap-to-Nudge visitor flow.');
} else {
  console.log('[TAPD build] Scenario A Tap-to-Nudge already present.');
}
