const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

html = html.replace(/<style id="tapdOnboardingPreviewModeStyle">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script id="tapdOnboardingPreviewModeScript">[\s\S]*?<\/script>/g, '');

const style = `<style id="tapdOnboardingPreviewModeStyle">
.tapd-preview-toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,12px);z-index:12000;max-width:calc(100vw - 34px);padding:11px 16px;border-radius:999px;background:rgba(14,206,192,.14);border:1px solid rgba(14,206,192,.42);color:#0ECEC0;font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:850;box-shadow:0 14px 34px rgba(0,0,0,.45);opacity:0;transition:opacity .2s ease,transform .2s ease;text-align:center}.tapd-preview-toast.show{opacity:1;transform:translate(-50%,0)}
</style>`;

const script = `<script id="tapdOnboardingPreviewModeScript">
(function(){
 if(window.__tapdOnboardingPreviewMode)return;window.__tapdOnboardingPreviewMode=true;
 function text(el){return (el&&el.textContent?el.textContent:'').replace(/\s+/g,' ').trim().toLowerCase();}
 function toast(msg){var old=document.getElementById('tapdPreviewToast');if(old)old.remove();var t=document.createElement('div');t.id='tapdPreviewToast';t.className='tapd-preview-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.classList.add('show')},20);setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove()},240)},2600)}
 function closeOwnerPanel(){document.body.classList.remove('tapd-owner-tools-mode','ot55-active');var side=document.getElementById('ownerSidePanel55');if(side)side.style.display='none';var over=document.getElementById('ot55Overlay');if(over)over.style.display='none';}
 function closePages(){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});}
 function showById(ids){for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el){closePages();el.classList.add('active');el.style.display='';try{el.scrollIntoView({block:'start'});}catch(e){}return true;}}return false;}
 function clickBack(){var btns=[].slice.call(document.querySelectorAll('button,a'));var b=btns.find(function(x){var t=text(x);return t==='back'||t.indexOf('back')>=0;});if(b){try{b.click();return true}catch(e){}}return false;}
 function openPreview(){closeOwnerPanel();document.body.classList.remove('tapd-owner-tools-mode','ot55-active');document.body.classList.add('tapd-profile-preview-mode');try{if(typeof window.showPage==='function'){window.showPage('profile');setTimeout(function(){window.scrollTo(0,0)},40);return true}}catch(e){}try{if(typeof window.showPage==='function'){window.showPage('home');setTimeout(function(){window.scrollTo(0,0)},40);return true}}catch(e){}if(showById(['profile','home','landing','public-profile','page-profile','page-home','page-landing','page-public-profile']))return true;if(clickBack())return true;window.scrollTo(0,0);return false;}
 function complete(){try{localStorage.setItem('tapd_onboarding_complete','true');localStorage.setItem('tapd_profile_complete','true');localStorage.setItem('tapd_profile_preview_mode','true');localStorage.setItem('tapd_onboarding_completed_at',new Date().toISOString());}catch(e){}setTimeout(function(){openPreview();toast('Profile saved — preview mode is ready. You can edit any time in Owner Tools.');},420)}
 function isProfileSave(btn){var t=text(btn);if(t==='save profile'||t==='save'||t.indexOf('save profile')>=0)return true;if(t.indexOf('complete profile')>=0||t.indexOf('finish profile')>=0||t.indexOf('publish profile')>=0)return true;return false;}
 document.addEventListener('click',function(e){var btn=e.target&&e.target.closest?e.target.closest('button'):null;if(btn&&isProfileSave(btn))setTimeout(complete,520);},true);
 document.addEventListener('submit',function(e){setTimeout(complete,520);},true);
 window.tapdCompleteOnboardingToPreview=complete;
})();
</script>`;

html = html.includes('</head>') ? html.replace(/<\/head>/i, style+'\n</head>') : style+'\n'+html;
html = html.includes('</body>') ? html.replace(/<\/body>(?![\s\S]*<\/body>)/i, script+'\n</body>') : html+'\n'+script;

if(html!==before){fs.writeFileSync(indexPath,html,'utf8');console.log('[TAPD build] Added direct Save profile to preview mode.');}
else console.log('[TAPD build] Onboarding preview mode already present.');
