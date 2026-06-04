const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(indexPath)) process.exit(0);

let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace('<script src="/update-65b-navigation-guardrails.js"></script>', '');
html = html.replace('<script src="/update-68-owner-toggle-fix.js"></script>', '');
html = html.replace(/Captured Conversations/g, 'Pending Review');
html = html.replace(/>Captured</g, '>Pending Review<');
html = html.replace(/Recordings transcribed, not yet drafted\./g, 'Conversations captured and waiting for your review.');
html = html.replace(/No captures yet/g, 'Nothing pending yet');
html = html.replace(/Tap the gold Capture button to record a conversation\./g, 'Captured conversations will appear here before follow-up approval.');
html = html.replace(/Your NFC Tag URI/g, 'Your NFC Profile URL');
html = html.replace(/Program this exact URL onto your NFC card\. Every tap opens your live profile\./g, 'This is the profile URL to program onto your NFC card. Every tap opens this live TAPD profile.');

const script = '<script id="tapd-safe-top-nav-script">\n' +
'(function(){\n' +
'function id(x){return document.getElementById(x)}\n' +
'function page(x){document.querySelectorAll(".page").forEach(function(p){p.classList.remove("active")});var t=id(x);if(t)t.classList.add("active");try{scrollTo(0,0)}catch(e){}}\n' +
'function shut(){var p=id("ownerSidePanel"),b=id("ownerSideBackdrop");if(p){p.classList.remove("open");p.setAttribute("aria-hidden","true")}if(b)b.classList.remove("open");document.body.classList.remove("owner-panel-open")}\n' +
'function panel(title){var p=id("ownerSidePanel"),b=id("ownerSideBackdrop");if(p){p.classList.add("open");p.setAttribute("aria-hidden","false");var h=p.querySelector(".owner-side-title");if(h)h.textContent=title}if(b)b.classList.add("open");document.body.classList.add("owner-panel-open")}\n' +
'function cleanup(){document.querySelectorAll(".quick-template-overlay,.fu-modal-overlay").forEach(function(n){try{n.remove()}catch(e){}});document.querySelectorAll(".upgrade-sheet.open,.connect-sheet.open").forEach(function(n){n.classList.remove("open")})}\n' +
'function fixLabels(){document.querySelectorAll("button,.inbox-tab,.hub-tab,.rel-tab,.queue-tab,[role=tab]").forEach(function(x){var t=(x.textContent||"").trim();if(t==="Captured")x.textContent="Pending Review";if(t==="Drafts")x.style.display="none"});}\n' +
'function route(t){cleanup();if(t==="owner"){page("profile");panel("Owner Tools")}if(t==="templates"){shut();page("page-template-editor")}if(t==="hub"){shut();page("profile");try{if(typeof openTapdInboxFromSide==="function"){openTapdInboxFromSide();setTimeout(fixLabels,80);return}}catch(e){}try{if(typeof renderOwnerInbox==="function")renderOwnerInbox()}catch(e){}setTimeout(fixLabels,80)}}\n' +
'function bind(i,t){var b=id(i);if(!b)return;b.onclick=function(e){if(e){e.preventDefault();e.stopPropagation()}route(t);return false};}\n' +
'bind("hardOwnerToolsBtn","owner");bind("hardTemplatesBtn","templates");bind("hardInboxBtn","hub");window.tapdTopNav=route;\n' +
'window.addEventListener("load",function(){document.querySelectorAll("button").forEach(function(b){var t=(b.textContent||"").trim();if(t==="AI & Upgrade"||t==="Settings"){b.disabled=true;b.title="Coming soon";b.style.opacity=".55";b.style.cursor="not-allowed"}})});\n' +
'})();\n' +
'</script>';

html = html.replace(/<script id="tapd-safe-top-nav-script">[\s\S]*?<\/script>/, '');
html = html.replace('</body>', script + '\n</body>');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('full relationship hub nav applied');
