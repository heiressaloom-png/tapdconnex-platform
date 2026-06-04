const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(indexPath)) process.exit(0);

let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace('<script src="/update-65b-navigation-guardrails.js"></script>', '');
html = html.replace('<script src="/update-68-owner-toggle-fix.js"></script>', '');

html = html.replace('id="hardOwnerToolsBtn">Owner tools</button>', 'id="hardOwnerToolsBtn" onclick="tapdTopNav(\'owner\')">Owner tools</button>');
html = html.replace('id="hardTemplatesBtn">⚡ Templates</button>', 'id="hardTemplatesBtn" onclick="tapdTopNav(\'templates\')">⚡ Templates</button>');
html = html.replace('id="hardInboxBtn">🧭 Relationship Hub</button>', 'id="hardInboxBtn" onclick="tapdTopNav(\'hub\')">🧭 Relationship Hub</button>');

const script = '<script id="tapd-safe-top-nav-script">\n' +
'window.tapdTopNav=function(target){\n' +
'function id(x){return document.getElementById(x)}\n' +
'function showPage(x){document.querySelectorAll(".page").forEach(function(p){p.classList.remove("active")});var t=id(x);if(t)t.classList.add("active");try{scrollTo(0,0)}catch(e){}}\n' +
'function closePanel(){var p=id("ownerSidePanel"),b=id("ownerSideBackdrop");if(p){p.classList.remove("open");p.setAttribute("aria-hidden","true")}if(b)b.classList.remove("open");document.body.classList.remove("owner-panel-open")}\n' +
'function openPanel(title){var p=id("ownerSidePanel"),b=id("ownerSideBackdrop");if(p){p.classList.add("open");p.setAttribute("aria-hidden","false");var h=p.querySelector(".owner-side-title");if(h)h.textContent=title||"Owner Tools"}if(b)b.classList.add("open");document.body.classList.add("owner-panel-open")}\n' +
'document.querySelectorAll(".quick-template-overlay,.fu-modal-overlay").forEach(function(n){try{n.remove()}catch(e){}});\n' +
'document.querySelectorAll(".upgrade-sheet.open,.connect-sheet.open").forEach(function(n){n.classList.remove("open")});\n' +
'if(target==="owner"){showPage("profile");openPanel("Owner Tools");return}\n' +
'if(target==="templates"){closePanel();showPage("page-template-editor");return}\n' +
'if(target==="hub"){closePanel();showPage("profile");try{if(typeof openTapdInboxFromSide==="function"){openTapdInboxFromSide();return}}catch(e){}openPanel("Relationship Hub");return}\n' +
'};\n' +
'</script>';

if (!html.includes('tapd-safe-top-nav-script')) {
  html = html.replace('</body>', script + '\n</body>');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('safe top nav applied');
