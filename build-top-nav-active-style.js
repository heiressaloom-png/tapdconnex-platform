const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

// Remove any previous top nav override so the final build has one clear source of truth.
html = html.replace(/<style id="tapdTopNavActiveStyle">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script id="tapdTopNavActiveStyleRuntime">[\s\S]*?<\/script>/g, '');

const css = String.raw`
#tapdHardOwnerHeader button{
  position:relative!important;
  min-height:46px!important;
  padding:0 15px!important;
  border-radius:15px!important;
  background:#101820!important;
  border:1px solid rgba(14,206,192,.34)!important;
  color:#CBD5E1!important;
  box-shadow:none!important;
  opacity:1!important;
  filter:none!important;
  font-weight:750!important;
  letter-spacing:-.1px!important;
  transform:none!important;
  transition:none!important;
}
#tapdHardOwnerHeader button:hover,
#tapdHardOwnerHeader button:focus-visible{
  background:#13222C!important;
  border-color:rgba(14,206,192,.48)!important;
  color:#E5F8F6!important;
  outline:none!important;
  box-shadow:0 0 0 2px rgba(14,206,192,.12)!important;
}
#tapdHardOwnerHeader button.tapd-nav-active,
#tapdHardOwnerHeader button.tapd-nav-pinned,
#tapdHardOwnerHeader button[aria-current="page"]{
  background:linear-gradient(135deg,#FACC15 0%,#EAB308 48%,#B87503 100%)!important;
  border:1px solid #FACC15!important;
  color:#050505!important;
  opacity:1!important;
  font-weight:900!important;
  transform:translateY(-1px)!important;
  box-shadow:
    0 0 0 2px rgba(234,179,8,.42),
    0 10px 28px rgba(234,179,8,.24),
    inset 0 1px 0 rgba(255,255,255,.28)!important;
}
#tapdHardOwnerHeader button.tapd-nav-active::after,
#tapdHardOwnerHeader button.tapd-nav-pinned::after,
#tapdHardOwnerHeader button[aria-current="page"]::after{
  content:""!important;
  display:block!important;
  position:absolute!important;
  left:18%!important;
  right:18%!important;
  bottom:5px!important;
  height:2px!important;
  border-radius:999px!important;
  background:rgba(5,5,5,.45)!important;
}
#tapdHardOwnerHeader button.tapd-nav-active:hover,
#tapdHardOwnerHeader button.tapd-nav-pinned:hover,
#tapdHardOwnerHeader button[aria-current="page"]:hover,
#tapdHardOwnerHeader button.tapd-nav-active:focus-visible,
#tapdHardOwnerHeader button.tapd-nav-pinned:focus-visible,
#tapdHardOwnerHeader button[aria-current="page"]:focus-visible{
  background:linear-gradient(135deg,#FDE68A 0%,#FACC15 42%,#ca8a04 100%)!important;
  border-color:#FDE68A!important;
  color:#050505!important;
  box-shadow:
    0 0 0 2px rgba(234,179,8,.48),
    0 12px 30px rgba(234,179,8,.26),
    inset 0 1px 0 rgba(255,255,255,.30)!important;
}`;

// Static fallback plus runtime override. Runtime also pins the selected workspace after route changes.
const style = `<style id="tapdTopNavActiveStyle">\n/* Corporate / conference top navigation with pinned selected zone. */\n${css}\n</style>`;
const runtime = String.raw`
<script id="tapdTopNavActiveStyleRuntime">
(function(){
  var STORAGE_KEY='tapd_pinned_top_nav_action';
  function normalizeText(el){return (el&&el.textContent?el.textContent:'').replace(/\s+/g,' ').trim().toLowerCase();}
  function actionForButton(btn){
    var t=normalizeText(btn);
    if(!btn)return '';
    if(btn.id==='hardOwnerToolsBtn'||btn.classList.contains('hard-owner-tools')||btn.classList.contains('hard-primary')||t.indexOf('owner')>=0)return 'owner';
    if(btn.id==='hardTemplatesBtn'||btn.classList.contains('hard-template')||t.indexOf('template')>=0)return 'templates';
    if(btn.id==='hardInboxBtn'||btn.id==='hardRelHubBtn'||btn.classList.contains('hard-inbox')||btn.classList.contains('hard-relhub')||t.indexOf('relationship')>=0||t.indexOf('hub')>=0)return 'relationship';
    return '';
  }
  function getPinned(){try{return localStorage.getItem(STORAGE_KEY)||'';}catch(e){return window.__tapdPinnedTopNav||'';}}
  function setPinned(action){try{localStorage.setItem(STORAGE_KEY,action||'');}catch(e){} window.__tapdPinnedTopNav=action||'';}
  function applyCorporateTopNavStyle(){
    try{
      var old=document.getElementById('tapdTopNavActiveStyleRuntimeCSS');
      if(old)old.remove();
      var style=document.createElement('style');
      style.id='tapdTopNavActiveStyleRuntimeCSS';
      style.textContent=${JSON.stringify(css)};
      document.head.appendChild(style);
    }catch(e){}
  }
  function pinActive(action){
    var h=document.getElementById('tapdHardOwnerHeader');
    if(!h)return;
    var selected=action||getPinned();
    h.querySelectorAll('button').forEach(function(btn){
      var a=actionForButton(btn);
      var on=!!selected&&a===selected;
      btn.classList.toggle('tapd-nav-active',on);
      btn.classList.toggle('tapd-nav-pinned',on);
      btn.setAttribute('aria-current',on?'page':'false');
    });
  }
  function captureSelection(ev){
    var h=document.getElementById('tapdHardOwnerHeader');
    if(!h||!ev||!ev.target||!ev.target.closest)return;
    var btn=ev.target.closest('button');
    if(!btn||!h.contains(btn))return;
    var action=actionForButton(btn);
    if(!action)return;
    setPinned(action);
    pinActive(action);
    setTimeout(function(){pinActive(action);},30);
    setTimeout(function(){pinActive(action);},120);
    setTimeout(function(){pinActive(action);},320);
    setTimeout(function(){pinActive(action);},700);
  }
  function bootPinnedTopNav(){
    applyCorporateTopNavStyle();
    document.addEventListener('pointerdown',captureSelection,true);
    document.addEventListener('pointerup',captureSelection,true);
    document.addEventListener('click',captureSelection,true);
    pinActive(getPinned()||'owner');
    setTimeout(function(){pinActive(getPinned()||'owner');},80);
    setTimeout(function(){pinActive(getPinned()||'owner');},350);
    setTimeout(function(){pinActive(getPinned()||'owner');},900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootPinnedTopNav);
  else bootPinnedTopNav();
})();
</script>`;

if (html.includes('</head>')) html = html.replace(/<\/head>/i, style + '\n</head>');
else html = style + '\n' + html;

if (html.includes('</body>')) html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, runtime + '\n</body>');
else html += '\n' + runtime + '\n';

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Applied pinned selected-state corporate top navigation styling.');
} else {
  console.log('[TAPD build] Corporate top navigation styling already present.');
}
