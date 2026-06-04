const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

// Remove any previous top nav override so the final build has one clear source of truth.
html = html.replace(/<style id="tapdTopNavActiveStyle">[\s\S]*?<\/style>/g, '');

const style = String.raw`
<style id="tapdTopNavActiveStyle">
/* Corporate / conference navigation hierarchy.
   Dark = navigation option, gold = current section, green = WhatsApp only, turquoise = accent only. */
#tapdHardOwnerHeader button{
  background:#101820!important;
  border:1px solid rgba(148,163,184,.22)!important;
  color:#CBD5E1!important;
  box-shadow:none!important;
  opacity:1!important;
  filter:none!important;
  font-weight:800!important;
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
  background:linear-gradient(135deg,#EAB308,#ca8a04)!important;
  border:1px solid #EAB308!important;
  color:#050505!important;
  opacity:1!important;
  box-shadow:0 0 0 2px rgba(234,179,8,.30)!important;
}
#tapdHardOwnerHeader button.tapd-nav-active:hover,
#tapdHardOwnerHeader button[aria-current="page"]:hover,
#tapdHardOwnerHeader button.tapd-nav-active:focus-visible,
#tapdHardOwnerHeader button[aria-current="page"]:focus-visible{
  background:linear-gradient(135deg,#FACC15,#ca8a04)!important;
  border-color:#FACC15!important;
  color:#050505!important;
  box-shadow:0 0 0 2px rgba(234,179,8,.34)!important;
}
</style>`;

if (html.includes('</head>')) html = html.replace(/<\/head>/i, style + '\n</head>');
else html = style + '\n' + html;

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Applied corporate top navigation styling.');
} else {
  console.log('[TAPD build] Corporate top navigation styling already present.');
}
