const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(indexPath)) process.exit(0);

let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace('<script src="/update-65b-navigation-guardrails.js"></script>', '');
html = html.replace('<script src="/update-68-owner-toggle-fix.js"></script>', '');

html = html.replace('id="hardOwnerToolsBtn">Owner tools</button>', 'id="hardOwnerToolsBtn">Owner tools</button>');
html = html.replace('id="hardTemplatesBtn">⚡ Templates</button>', 'id="hardTemplatesBtn">⚡ Templates</button>');
html = html.replace('id="hardInboxBtn">🧭 Relationship Hub</button>', 'id="hardInboxBtn">🧭 Relationship Hub</button>');
html = html.replace('id="hardOwnerToolsBtn" onclick="tapdTopNav(\'owner\')">Owner tools</button>', 'id="hardOwnerToolsBtn">Owner tools</button>');
html = html.replace('id="hardTemplatesBtn" onclick="tapdTopNav(\'templates\')">⚡ Templates</button>', 'id="hardTemplatesBtn">⚡ Templates</button>');
html = html.replace('id="hardInboxBtn" onclick="tapdTopNav(\'hub\')">🧭 Relationship Hub</button>', 'id="hardInboxBtn">🧭 Relationship Hub</button>');

const script = '<script id="tapd-safe-top-nav-script">\n' +
'(function(){\n' +
'var last=0;\n' +
'function id(x){return document.getElementById(x)}\n' +
'function showPage(x){document.querySelectorAll(".page").forEach(function(p){p.classList.remove("active")});var t=id(x);if(t)t.classList.add("active");try{scrollTo(0,0)}catch(e){}}\n' +
'function closePanel(){var p=id("ownerSidePanel"),b=id("ownerSideBackdrop");if(p){p.classList.remove("open");p.setAttribute("aria-hidden","true")}if(b)b.classList.remove("open");document.body.classList.remove("owner-panel-open")}\n' +
'function openPanel(title){var p=id("ownerSidePanel"),b=id("ownerSideBackdrop");if(p){p.classList.add("open");p.setAttribute("aria-hidden","false");var h=p.querySelector(".owner-side-title");if(h)h.textContent=title}if(b)b.classList.add("open");document.body.classList.add("owner-panel-open")}\n' +
'function cleanup(){document.querySelectorAll(".quick-template-overlay,.fu-modal-overlay").forEach(function(n){try{n.remove()}catch(e){}});document.querySelectorAll(".upgrade-sheet.open,.connect-sheet.open").forEach(function(n){n.classList.remove("open")})}\n' +
'function route(target){cleanup();if(target==="owner"){showPage("profile");openPanel("Owner Tools");return}if(target==="templates"){closePanel();showPage("page-template-editor");return}if(target==="hub"){closePanel();showPage("profile");openPanel("Relationship Hub");try{if(typeof renderOwnerInbox==="function")renderOwnerInbox()}catch(e){}return}}\n' +
'function pick(btn){if(!btn)return"";if(btn.id==="hardOwnerToolsBtn")return"owner";if(btn.id==="hardTemplatesBtn")return"templates";if(btn.id==="hardInboxBtn")return"hub";return""}\n' +
'function handler(e){var b=e.target&&e.target.closest?e.target.closest("#hardOwnerToolsBtn,#hardTemplatesBtn,#hardInboxBtn"):null;var t=pick(b);if(!t)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();var n=Date.now();if(n-last<220)return;last=n;route(t);return false}\n' +
'document.addEventListener("pointerdown",handler,true);document.addEventListener("touchstart",handler,true);document.addEventListener("click",handler,true);\n' +
'window.tapdTopNav=route;\n' +
'})();\n' +
'</script>';

html = html.replace(/<script id="tapd-safe-top-nav-script">[\s\S]*?<\/script>/, '');
html = html.replace('</body>', script + '\n</body>');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('safe top nav applied');
