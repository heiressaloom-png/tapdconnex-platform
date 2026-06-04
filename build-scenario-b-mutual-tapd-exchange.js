const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

html = html.replace(/<script id="tapdScenarioBMutualExchange">[\s\S]*?<\/script>/g, '');

const controller = String.raw`
<!-- SCENARIO B: BOTH PEOPLE HAVE TAPD — MUTUAL TAPD EXCHANGE -->
<script id="tapdScenarioBMutualExchange">
(function(){
  if(window.__tapdScenarioBMutualExchange)return;
  window.__tapdScenarioBMutualExchange=true;

  function byId(id){return document.getElementById(id);}
  function safe(v){return String(v==null?'':v).trim();}
  function normPhone(v){return safe(v).replace(/[^0-9]/g,'');}
  function profile(){try{if(typeof window.getProfileData==='function')return window.getProfileData()||{};}catch(e){} try{return JSON.parse(localStorage.getItem('tapd_profile')||'{}')||{};}catch(e){return{};}}
  function ownerName(){var p=profile();return safe(p.name||p.fullName||p.displayName||'TAPD contact');}
  function ownerPhone(){var p=profile();return normPhone(p.whatsApp||p.whatsapp||p.whatsappNumber||p.phone||p.mobile||'');}
  function currentUrl(){return location.href.split('#')[0];}
  function isOwnerWorkspace(){return document.body.classList.contains('tapd-owner-tools-mode')||document.body.classList.contains('ot55-active')||document.body.classList.contains('owner-panel-open');}
  function isVisitorLike(){try{var q=new URLSearchParams(location.search||'');if(q.get('visitor')==='1'||q.get('nfc')==='1'||q.get('view')==='visitor'||q.get('mode')==='visitor')return true;}catch(e){}return !isOwnerWorkspace();}
  function visitorProfile(){try{return JSON.parse(localStorage.getItem('tapd_profile')||'{}')||{};}catch(e){return{};}}
  function visitorName(){var p=visitorProfile();return safe(p.name||p.fullName||p.displayName||'there');}
  function visitorUrl(){var p=visitorProfile();return safe(p.profileUrl||p.publicUrl||p.tapdUrl||location.origin);}
  function toast(msg,type){try{if(typeof window.tapdToast==='function')return window.tapdToast(msg,type||'success');}catch(e){} alert(msg);}

  function injectStyles(){
    if(byId('tapdScenarioBStyles'))return;
    var st=document.createElement('style');
    st.id='tapdScenarioBStyles';
    st.textContent='\n'
      +'.tapd-b-card{margin:12px 0 14px;padding:14px;border-radius:18px;background:linear-gradient(135deg,rgba(234,179,8,.11),rgba(14,206,192,.05));border:1px solid rgba(234,179,8,.28);box-shadow:0 10px 30px rgba(0,0,0,.16);}\n'
      +'.tapd-b-kicker{font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#EAB308;margin:0 0 5px;}\n'
      +'.tapd-b-title{font-size:15px;font-weight:900;color:#F0F4F8;margin:0 0 5px;}\n'
      +'.tapd-b-copy{font-size:12px;line-height:1.5;color:#8B9EB0;margin:0 0 12px;}\n'
      +'.tapd-b-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}\n'
      +'.tapd-b-btn{height:44px;border-radius:14px;font-family:Inter,sans-serif;font-size:12px;font-weight:900;cursor:pointer;}\n'
      +'.tapd-b-primary{background:linear-gradient(135deg,#EAB308,#ca8a04);border:1px solid #EAB308;color:#050505;}\n'
      +'.tapd-b-secondary{background:rgba(255,255,255,.035);border:1px solid rgba(14,206,192,.30);color:#0ECEC0;}\n'
      +'.tapd-b-note{font-size:10px;color:rgba(255,255,255,.42);text-align:center;margin:8px 0 0;line-height:1.4;}\n'
      +'@media(max-width:360px){.tapd-b-row{grid-template-columns:1fr}.tapd-b-btn{height:42px}}';
    document.head.appendChild(st);
  }

  function ownerSnapshot(){
    var p=profile();
    return {
      id:'owner-'+Date.now(),
      name:ownerName(),
      role:safe(p.role||p.title||''),
      company:safe(p.company||p.business||''),
      profileUrl:currentUrl(),
      preferredChannel:'TAPD',
      source:'TAPD mutual exchange',
      status:'New connection',
      savedAt:new Date().toISOString()
    };
  }
  function saveToMyTapd(){
    var item=ownerSnapshot();
    var keys=['tapd_saved_tapd_connections','tapd_connections_v1'];
    keys.forEach(function(key){
      try{
        var arr=JSON.parse(localStorage.getItem(key)||'[]');
        if(!Array.isArray(arr))arr=[];
        var exists=arr.some(function(x){return safe(x.profileUrl)===safe(item.profileUrl)||safe(x.name).toLowerCase()===safe(item.name).toLowerCase();});
        if(!exists)arr.unshift(item);
        localStorage.setItem(key,JSON.stringify(arr.slice(0,100)));
      }catch(e){}
    });
    toast('Saved to your TAPD connections.');
  }
  function sendMyTapdBack(){
    var num=ownerPhone();
    if(!num){toast('WhatsApp is not set up on this profile yet.','warn');return;}
    var msg='Hi '+ownerName().split(/\s+/)[0]+', I have TAPD too. Here is my TAPD profile: '+visitorUrl();
    try{localStorage.setItem('tapd_last_mutual_exchange',JSON.stringify({to:ownerName(),from:visitorName(),at:new Date().toISOString(),source:'scenario_b'}));}catch(e){}
    window.location.href='https://wa.me/'+num+'?text='+encodeURIComponent(msg);
  }
  function buildCard(){
    var card=document.createElement('div');
    card.id='tapdScenarioBCard';
    card.className='tapd-b-card';
    card.innerHTML='<p class="tapd-b-kicker">Both have TAPD?</p>'
      +'<p class="tapd-b-title">Connect on TAPD</p>'
      +'<p class="tapd-b-copy">Save this profile to your TAPD connections, then send your TAPD back so both sides can follow up with context.</p>'
      +'<div class="tapd-b-row"><button type="button" class="tapd-b-btn tapd-b-primary">Save to my TAPD</button><button type="button" class="tapd-b-btn tapd-b-secondary">Send my TAPD back</button></div>'
      +'<p class="tapd-b-note">MVP bridge: saves locally now; backend exchange can replace this later.</p>';
    card.querySelector('.tapd-b-primary').onclick=saveToMyTapd;
    card.querySelector('.tapd-b-secondary').onclick=sendMyTapdBack;
    return card;
  }
  function findTarget(){return byId('tapdScenarioANudgeCard')||byId('tapdVcardBtn')||document.querySelector('[onclick*="generateVCard"]')||document.querySelector('[href*="wa.me"]')||document.querySelector('.identity')||byId('profile');}
  function ensureCard(){
    if(!isVisitorLike())return;
    injectStyles();
    if(byId('tapdScenarioBCard'))return;
    var target=findTarget(); if(!target)return;
    var card=buildCard();
    var container=target.closest&&target.closest('div')?target.closest('div'):target;
    if(container&&container.parentNode)container.parentNode.insertBefore(card,container.nextSibling);
  }
  function boot(){injectStyles();ensureCard();setTimeout(ensureCard,300);setTimeout(ensureCard,1000);console.log('[TAPD] Scenario B Mutual TAPD Exchange active.');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
</script>`;

if (html.includes('</body>')) html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, controller + '\n</body>');
else html += '\n' + controller + '\n';

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Applied Scenario B Mutual TAPD Exchange flow.');
} else {
  console.log('[TAPD build] Scenario B Mutual TAPD Exchange already present.');
}
