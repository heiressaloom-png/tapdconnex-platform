const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;
html = html.replace(/<style id="tapdProPlacementBadgesStyle">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script id="tapdProPlacementBadgesScript">[\s\S]*?<\/script>/g, '');

const style = `<style id="tapdProPlacementBadgesStyle">
.tapd-pro-pill{display:inline-flex!important;align-items:center!important;justify-content:center!important;height:20px!important;padding:0 8px!important;border-radius:999px!important;background:linear-gradient(135deg,#FACC15,#EAB308 55%,#B87503)!important;color:#050505!important;border:1px solid rgba(255,255,255,.18)!important;font-family:Inter,system-ui,sans-serif!important;font-size:9px!important;font-weight:950!important;letter-spacing:.9px!important;text-transform:uppercase!important;line-height:1!important;box-shadow:0 5px 14px rgba(234,179,8,.16)!important;white-space:nowrap!important;}
.tapd-pro-pill.soft{background:rgba(234,179,8,.10)!important;color:#EAB308!important;border:1px solid rgba(234,179,8,.32)!important;box-shadow:none!important;}
.tapd-pro-inline{display:inline-flex!important;align-items:center!important;gap:7px!important;flex-wrap:wrap!important;}
.tapd-pro-card{margin:10px 0 0!important;padding:10px 11px!important;border-radius:14px!important;background:linear-gradient(135deg,rgba(234,179,8,.10),rgba(234,179,8,.035))!important;border:1px solid rgba(234,179,8,.24)!important;color:#F0F4F8!important;font-family:Inter,system-ui,sans-serif!important;font-size:11px!important;line-height:1.4!important;}
.tapd-pro-card b{color:#F0F4F8!important;font-size:12px!important;}
</style>`;

const script = `<script id="tapdProPlacementBadgesScript">
(function(){
 if(window.__tapdProPlacementBadges)return;window.__tapdProPlacementBadges=true;
 var proTemplates=['investor','funding','strategic partnership','speaking','media','advisory','mentor','community access','pilot','beta','customer discovery'];
 function text(el){return (el&&el.textContent?el.textContent:'').replace(/\s+/g,' ').trim();}
 function low(el){return text(el).toLowerCase();}
 function visible(el){try{var r=el.getBoundingClientRect();return r.width>0&&r.height>0;}catch(e){return false;}}
 function pill(soft){var p=document.createElement('span');p.className='tapd-pro-pill'+(soft?' soft':'');p.textContent='PRO';return p;}
 function addInline(el,soft){if(!el||el.dataset.tapdPro==='1'||(el.querySelector&&el.querySelector('.tapd-pro-pill')))return;var t=text(el);if(!t||t.length>100)return;el.dataset.tapdPro='1';var wrap=document.createElement('span');wrap.className='tapd-pro-inline';wrap.appendChild(document.createTextNode(t));wrap.appendChild(pill(soft));el.textContent='';el.appendChild(wrap);}
 function addCard(el,title,body){if(!el||el.dataset.tapdProCard==='1')return;el.dataset.tapdProCard='1';var c=document.createElement('div');c.className='tapd-pro-card';c.innerHTML='<b>'+title+'</b> <span class="tapd-pro-pill soft">PRO</span><br>'+body;el.appendChild(c);}
 function applyTemplates(){[].slice.call(document.querySelectorAll('button,[class*="template"],[id*="template"],[id*="tpl"]')).forEach(function(el){if(!visible(el))return;var t=low(el);if(t.length>150)return;if(proTemplates.some(function(x){return t.indexOf(x)>=0;}))addInline(el,false);});}
 function applySettings(){[].slice.call(document.querySelectorAll('section,div,aside')).some(function(el){if(!visible(el)||el.dataset.tapdProSettings==='1')return false;var t=low(el);if(t.length<3500&&(t.indexOf('owner tools')>=0||t.indexOf('settings')>=0||t.indexOf('account')>=0)){el.dataset.tapdProSettings='1';addCard(el,'Current plan: Starter','Upgrade for Pro templates, AI Completion Mode, and relationship intelligence.');return true;}return false;});}
 function applyDraft(){[].slice.call(document.querySelectorAll('section,div,article')).forEach(function(el){if(!visible(el)||el.dataset.tapdProDraft==='1')return;var t=low(el);if(t.length<2500&&(t.indexOf('draft ready')>=0||t.indexOf('draft created')>=0||t.indexOf('awaiting review')>=0)){el.dataset.tapdProDraft='1';addCard(el,'AI completion available','Detect missing info and improve the same draft.');}});}
 function applyContinue(){[].slice.call(document.querySelectorAll('button')).forEach(function(el){var t=low(el);if(t.indexOf('continue recording')>=0||t.indexOf('record more')>=0)addInline(el,false);});}
 function applyHub(){[].slice.call(document.querySelectorAll('section,div,article')).some(function(el){if(!visible(el)||el.dataset.tapdProHub==='1')return false;var t=low(el);if(t.length<5000&&(t.indexOf('relationship hub')>=0||t.indexOf('opportunities')>=0||t.indexOf('all people')>=0)){el.dataset.tapdProHub='1';addCard(el,'Pro relationship signals','AI signal and warmth insights appear here.');return true;}return false;});}
 function apply(){applyTemplates();applySettings();applyDraft();applyContinue();applyHub();}
 function boot(){apply();setTimeout(apply,250);setTimeout(apply,900);setTimeout(apply,1800);if(window.MutationObserver){new MutationObserver(function(){setTimeout(apply,80);}).observe(document.body,{childList:true,subtree:true});}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
</script>`;

html = html.includes('</head>') ? html.replace(/<\/head>/i, style+'\n</head>') : style+'\n'+html;
html = html.includes('</body>') ? html.replace(/<\/body>(?![\s\S]*<\/body>)/i, script+'\n</body>') : html+'\n'+script;

if(html!==before){fs.writeFileSync(indexPath,html,'utf8');console.log('[TAPD build] Added subtle Pro badges.');}
else console.log('[TAPD build] Pro badges already present.');
