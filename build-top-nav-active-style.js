const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

html = html.replace(/<style id="tapdTopNavActiveStyle">[\s\S]*?<\/style>/g, '');

const style = String.raw`
<style id="tapdTopNavActiveStyle">
/* Top nav hierarchy: inactive buttons are quiet; current section is gold and obvious. */
#tapdHardOwnerHeader button{
  background:rgba(255,255,255,.035)!important;
  border:1px solid rgba(14,206,192,.34)!important;
  color:#0ECEC0!important;
  box-shadow:none!important;
  opacity:.92!important;
  font-weight:800!important;
}
#tapdHardOwnerHeader button:hover,
#tapdHardOwnerHeader button:focus-visible{
  background:rgba(14,206,192,.10)!important;
  border-color:rgba(14,206,192,.62)!important;
  color:#7FF7EC!important;
  outline:none!important;
  box-shadow:0 0 0 2px rgba(14,206,192,.18)!important;
}
#tapdHardOwnerHeader button.tapd-nav-active,
#tapdHardOwnerHeader button[aria-current="page"]{
  background:linear-gradient(135deg,#EAB308,#ca8a04)!important;
  border:1px solid #EAB308!important;
  color:#050505!important;
  opacity:1!important;
  box-shadow:0 0 0 2px rgba(234,179,8,.30),0 8px 24px rgba(234,179,8,.22)!important;
}
#tapdHardOwnerHeader button.tapd-nav-active:hover,
#tapdHardOwnerHeader button[aria-current="page"]:hover{
  background:linear-gradient(135deg,#FACC15,#ca8a04)!important;
  color:#050505!important;
  border-color:#FACC15!important;
}
</style>`;

if (html.includes('</head>')) html = html.replace(/<\/head>/i, style + '\n</head>');
else html = style + '\n' + html;

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Applied clearer top navigation active state styling.');
} else {
  console.log('[TAPD build] Top navigation active state styling already present.');
}
