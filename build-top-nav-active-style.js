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
  min-height:46px!important;
  padding:0 15px!important;
  border-radius:15px!important;
  background:#101820!important;
  border:1px solid rgba(148,163,184,.24)!important;
  color:#CBD5E1!important;
  box-shadow:none!important;
  opacity:1!important;
  filter:none!important;
  font-weight:750!important;
  letter-spacing:-.1px!important;
  transform:none!important;
  transition:background .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease,transform .16s ease!important;
}
#tapdHardOwnerHeader button:hover,
#tapdHardOwnerHeader button:focus-visible{
  background:#13222C!important;
  border-color:rgba(14,206,192,.45)!important;
  color:#E5F8F6!important;
  outline:none!important;
  box-shadow:0 0 0 2px rgba(14,206,192,.16)!important;
}
#tapdHardOwnerHeader button.tapd-nav-active,
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
#tapdHardOwnerHeader button[aria-current="page"]:hover,
#tapdHardOwnerHeader button.tapd-nav-active:focus-visible,
#tapdHardOwnerHeader button[aria-current="page"]:focus-visible{
  background:linear-gradient(135deg,#FDE68A 0%,#FACC15 42%,#ca8a04 100%)!important;
  border-color:#FDE68A!important;
  color:#050505!important;
  box-shadow:
    0 0 0 2px rgba(234,179,8,.48),
    0 12px 30px rgba(234,179,8,.26),
    inset 0 1px 0 rgba(255,255,255,.30)!important;
}`;

// Static fallback plus runtime override. The runtime override is intentionally appended after
// build-stabilise-navigation.js injects its turquoise styles, so the corporate style wins.
const style = `<style id="tapdTopNavActiveStyle">\n/* Corporate / conference top navigation with obvious selected zone. */\n${css}\n</style>`;
const runtime = String.raw`
<script id="tapdTopNavActiveStyleRuntime">
(function(){
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
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyCorporateTopNavStyle);
  else applyCorporateTopNavStyle();
  setTimeout(applyCorporateTopNavStyle,80);
  setTimeout(applyCorporateTopNavStyle,350);
  setTimeout(applyCorporateTopNavStyle,900);
})();
</script>`;

if (html.includes('</head>')) html = html.replace(/<\/head>/i, style + '\n</head>');
else html = style + '\n' + html;

if (html.includes('</body>')) html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, runtime + '\n</body>');
else html += '\n' + runtime + '\n';

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Applied stronger selected-state corporate top navigation styling.');
} else {
  console.log('[TAPD build] Corporate top navigation styling already present.');
}
