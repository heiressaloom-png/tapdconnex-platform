const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

html = html.replace(/<style id="tapdTopNavActiveDepthStyle">[\s\S]*?<\/style>/g, '');

const style = String.raw`
<style id="tapdTopNavActiveDepthStyle">
  #tapdHardOwnerHeader button.tapd-nav-active,
  #tapdHardOwnerHeader button[aria-current="page"]{
    box-shadow:0 0 0 2px rgba(234,179,8,.25),0 8px 20px rgba(234,179,8,.18),inset 0 1px 0 rgba(255,255,255,.22)!important;
  }
</style>`;

if (html.includes('</head>')) html = html.replace(/<\/head>/i, style + '\n</head>');
else html = style + '\n' + html;

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Added subtle active top-nav depth.');
} else {
  console.log('[TAPD build] Active top-nav depth already present.');
}
