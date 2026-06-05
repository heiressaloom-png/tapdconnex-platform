const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

// Keep the original Owner Tools / Templates / Relationship Hub UI structure intact.
// This build step only removes obsolete external runtime references, cleans visible copy,
// and adds one final routing guard for the top buttons.
html = html.replace('<script src="/update-65b-navigation-guardrails.js"></script>', '');
html = html.replace('<script src="/update-68-owner-toggle-fix.js"></script>', '');
html = html.replace(/<script id="tapdCanonicalTopNavController">[\s\S]*?<\/script>/g, '');
html = html.replace(/<script id="tapdTopNavDesignCorrection">[\s\S]*?<\/script>/g, '');

// NFC URL clarity.
html = html.replace(/Your NFC Tag URI/g, 'Your NFC Profile URL');
html = html.replace(/Program this exact URL onto your NFC card\. Every tap opens your live profile\./g, 'This is the profile URL to program onto your NFC card. Every tap opens this live TAPD profile.');

// Relationship Hub copy and tab cleanup.
html = html.replace("['connections','captured','drafts','followUps','sent','waiting','archived']", "['connections','captured','followUps','sent']");
html = html.replace("var labels={connections:'Connections',captured:'Captured',drafts:'Drafts',\n          followUps:'Follow-Ups',sent:'Sent',waiting:'Waiting',archived:'Archived'};", "var labels={connections:'Connections',captured:'Awaiting Review',followUps:'Follow-Ups',sent:'Sent'};");
html = html.replace("'Connections','People who tapped your NFC card and sent their TAPD card. Accept to start capturing.'", "'Connections','People you\\'ve connected with. Connections from NFC taps and captured conversations appear here.'");
html = html.replace("'Captured Conversations','Recordings transcribed, not yet drafted.'", "'Awaiting Review','Captured conversations waiting for your review.'");
html = html.replace("'🎤','No captures yet','Tap the gold Capture button to record a conversation.'", "'🎤','Nothing awaiting review','Captured conversations will appear here before follow-up approval.'");
html = html.replace("onclick=\"rh56Tab('drafts')\"", "onclick=\"rh56Tab('captured')\"");
html = html.replace(/statusLabels=\{connections:'New',captured:'Captured',drafts:'AI Draft',/g, "statusLabels={connections:'New',captured:'Awaiting Review',drafts:'AI Draft',");
html = html.replace(/name:'Keep Warm'/g, "name:'Stay in Touch'");
html = html.replace(/id:'keep_warm'/g, "id:'stay_in_touch'");
html = html.replace(/keep_warm/g, 'stay_in_touch');

// ✅ vCard button upgrade — Option B.
// Old: outlined gold button, generic label "Save contact card to your phone"
// New: gold filled primary button, personalised name, explainer line underneath.
// The <span id="tapdVcardName"> is patched at runtime by the showConnected override below.
html = html.replace(
  /<button onclick="generateVCard\(\)" style="margin-top:12px[\s\S]*?Save contact card to your phone\s*<\/button>/,
  '<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.07);padding-top:14px;">'
  + '<button id="tapdVcardBtn" onclick="generateVCard()" style="width:100%;height:50px;border-radius:14px;background:linear-gradient(135deg,#EAB308,#ca8a04);border:none;color:#050505;font-family:\'Inter\',sans-serif;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;letter-spacing:-.1px;">'
  + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  + '<span>Save <span id="tapdVcardName">contact</span> to your contacts</span>'
  + '</button>'
  + '<p style="margin-top:8px;font-size:11px;color:rgba(255,255,255,.4);text-align:center;letter-spacing:.1px;">One tap \xb7 saves number, email &amp; profile</p>'
  + '</div>'
);

// ✅ FIX: String.raw preserves all \n \' \\ escape sequences so the injected
// script block arrives in index.html with correct JS syntax. Without it the
// template literal ate backslashes, breaking line 17299 with
// "missing ) after argument list".
const controller = String.raw`
<!-- UPDATE 69C: ACTIVE NAV + TEMPLATE CAPTURE WORKFLOW -->
<script id="tapdTopNavDesignCorrection">
(function(){
  if(window.__tapdTopNavDesignCorrection)return;
  window.__tapdTopNavDesignCorrection=true;

  var lastTap={key:'',at:0};
  var TEMPLATE_NAMES={
    direct_opportunity:'Direct Opportunity',
    connector_referral:'Connector / Referral',
    stay_in_touch:'Stay in Touch',
    pilot_beta:'Pilot / Beta Testing',
    collaboration:'Collaboration / Partnership',
    customer_discovery:'Customer Discovery',
    investor_funding:'Investor / Funding',
    strategic_partnership:'Strategic Partnership',
    speaking_media:'Speaking / Media',
    advisory_mentor:'Advisory / Mentor',
    community_access:'Community Access',
    custom:'Custom Template'
  };
  var TEMPLATE_HINTS={
    direct_opportunity:[
      'What brought this up for you today?',
      'What are you currently trying to solve or improve?',
      'What made this feel relevant or interesting?',
      'What would make this useful enough to explore properly?',
      'Would it make sense to continue this conversation after today?'
    ],
    connector_referral:[
      'Who came to mind when we were speaking about this?',
      'Why do you think this would be relevant for them?',
      'What would be the easiest way for me to explain it to them?',
      'Would a short intro message make it easier for you?',
      'Would you be comfortable making a light introduction after today?'
    ],
    stay_in_touch:[
      'What are you focused on at the moment?',
      'What kind of ideas or people are useful for you right now?',
      'What part of our conversation feels worth remembering?',
      'Would it be useful if I shared something relevant later?',
      'What would be a natural reason for us to stay connected?'
    ],
    pilot_beta:[
      'What would you be curious to test first?',
      'Where would this fit into how you currently work?',
      'What would make the test worthwhile for you?',
      'Who else would need to be involved before trying it?',
      'What would be a simple next step to explore a pilot?'
    ],
    collaboration:[
      'Where do you see overlap between what we both do?',
      'What would a small first collaboration look like?',
      'What would each side need to bring for this to work?',
      'What would need to be clear before moving forward?',
      'Would it make sense to explore one practical next step?'
    ],
    customer_discovery:[
      'How are you handling this today?',
      'What tends to be frustrating about the current way?',
      'When does this problem become most noticeable?',
      'What would a better outcome look like for you?',
      'What would make you consider changing what you use now?'
    ],
    investor_funding:[
      'What part of this space are you most interested in?',
      'What would you want to understand before taking this seriously?',
      'Does this feel aligned with the types of opportunities you usually look at?',
      'What questions or concerns would you expect someone to raise?',
      'Would it be useful if I sent a short summary, deck, or follow-up note?'
    ],
    strategic_partnership:[
      'Where do you think there could be mutual business value?',
      'What would make this useful for your side?',
      'Who normally needs to be involved in a partnership like this?',
      'Are there any timing issues, dependencies, or blockers I should know about?',
      'What would be the right next conversation if we wanted to explore this?'
    ],
    speaking_media:[
      'What audience are you trying to serve with this?',
      'What topic or angle do you think would be most useful for them?',
      'What made you think I could be a fit?',
      'What would you need from me to consider it properly?',
      'What is the timeline or next step for this opportunity?'
    ],
    advisory_mentor:[
      'Where do you think your experience could be most useful here?',
      'What have you seen others get wrong at this stage?',
      'What would you suggest I think about next?',
      'Would it make sense to stay connected around this topic?',
      'What would make this valuable or easy for you as well?'
    ],
    community_access:[
      'What kind of people are usually in that community?',
      'What makes someone a good fit?',
      'Why do you think it could be useful for me?',
      'What is the best way to be introduced or included?',
      'Is there anything I should prepare before reaching out?'
    ],
    custom:[
      'What is the main thing you want to understand from this conversation?',
      'What context would make the follow-up more useful?',
      'What is the most important thing to capture right now?',
      'What would a good outcome from this conversation look like?',
      'What is the clearest next step?'
    ]
  };

  function byId(id){return document.getElementById(id);}
  function now(){return Date.now?Date.now():(new Date()).getTime();}
  function txt(el){return (el&&el.textContent?el.textContent:'').replace(/\s+/g,' ').trim().toLowerCase();}
  function titleCaseFromId(id){return TEMPLATE_NAMES[id]||String(id||'Selected template').replace(/_/g,' ').replace(/\b\w/g,function(m){return m.toUpperCase();});}
  function getActiveTemplate(){try{return localStorage.getItem('tapd_active_template')||'direct_opportunity';}catch(e){return'direct_opportunity';}}
  function inVisitorMode(){
    try{var q=new URLSearchParams(location.search||'');return q.get('visitor')==='1'||q.get('mode')==='visitor'||q.get('view')==='visitor'||q.get('nfc')==='1'||document.body.classList.contains('tapd-hard-header-off');}catch(e){return false;}
  }

  function injectWorkspaceStyles(){
    if(byId('tapd69cWorkspaceStyles'))return;
    var style=document.createElement('style');
    style.id='tapd69cWorkspaceStyles';
    style.textContent='\n'
      +'#tapdHardOwnerHeader button{background:linear-gradient(135deg,#0ECEC0,#10B981)!important;border-color:#0ECEC0!important;color:#050505!important;font-weight:800!important;opacity:1!important;filter:none!important;}\n'
      +'#tapdHardOwnerHeader button.tapd-nav-active{background:linear-gradient(135deg,#EAB308,#ca8a04)!important;border-color:#EAB308!important;color:#050505!important;box-shadow:0 0 0 2px rgba(234,179,8,.30),0 8px 24px rgba(234,179,8,.22)!important;}\n'
      +'#connectBar,.connect-bar,.btn-connect,.connect-sheet{display:none!important;}\n'
      +'.tapd-template-action-bar{margin:0 0 14px;padding:13px;border-radius:16px;border:1px solid rgba(234,179,8,.24);background:linear-gradient(135deg,rgba(234,179,8,.10),rgba(234,179,8,.035));display:grid;gap:10px;}\n'
      +'.tapd-template-action-title{font-size:13px;font-weight:900;color:#F0F4F8;margin:0;}\n'
      +'.tapd-template-action-sub{font-size:11px;color:#8B9EB0;line-height:1.45;margin:2px 0 0;}\n'
      +'.tapd-template-action-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}\n'
      +'.tapd-template-capture-btn,.tapd-template-cheat-btn{height:42px;border-radius:13px;font-family:Inter,sans-serif;font-size:12px;font-weight:900;cursor:pointer;}\n'
      +'.tapd-template-capture-btn{background:linear-gradient(135deg,#EAB308,#ca8a04);border:1px solid #EAB308;color:#050505;}\n'
      +'.tapd-template-cheat-btn{background:rgba(255,255,255,.03);border:1px solid rgba(234,179,8,.22);color:#EAB308;}\n'
      +'@media(max-width:360px){.tapd-template-action-row{grid-template-columns:1fr}.tapd-template-capture-btn,.tapd-template-cheat-btn{height:40px}}\n'
      +'#tapdTemplateCheatSheet{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.38);opacity:0;pointer-events:none;transition:opacity .18s ease;}\n'
      +'#tapdTemplateCheatSheet.show{opacity:1;pointer-events:auto;}\n'
      +'.tapd-cheat-card{width:min(430px,calc(100vw - 24px));margin:0 12px 18px;background:#0D1117;border:1px solid rgba(234,179,8,.35);border-radius:22px;padding:18px 16px 16px;box-shadow:0 18px 60px rgba(0,0,0,.55);position:relative;font-family:Inter,sans-serif;}\n'
      +'.tapd-cheat-close{position:absolute;right:12px;top:10px;width:30px;height:30px;border-radius:999px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);color:#8B9EB0;font-size:18px;}\n'
      +'.tapd-cheat-kicker{font-size:10px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;color:#EAB308;margin-bottom:4px;}\n'
      +'.tapd-cheat-title{font-size:18px;font-weight:900;color:#F0F4F8;margin-bottom:6px;}\n'
      +'.tapd-cheat-sub{font-size:12px;line-height:1.55;color:#8B9EB0;margin-bottom:12px;padding-right:22px;}\n'
      +'.tapd-cheat-list{display:grid;gap:7px;margin-bottom:10px;}\n'
      +'.tapd-cheat-list span{font-size:12px;color:#F0F4F8;background:rgba(234,179,8,.07);border:1px solid rgba(234,179,8,.18);border-radius:12px;padding:9px 10px;line-height:1.45;}\n'
      +'.tapd-cheat-list .tapd-cheat-extra{display:none;}\n'
      +'.tapd-cheat-list.tapd-cheat-show-all .tapd-cheat-extra{display:block;}\n'
      +'.tapd-cheat-expand{width:100%;height:36px;margin-bottom:12px;border-radius:10px;background:transparent;border:1px dashed rgba(234,179,8,.30);color:#EAB308;font-size:11px;font-weight:800;font-family:Inter,sans-serif;cursor:pointer;letter-spacing:.3px;}\n'
      +'.tapd-cheat-expand:active{background:rgba(234,179,8,.05);}\n'
      +'.cheat-prep-angle.tapd-prep-extra{display:none;}\n'
      +'.cheat-prep-angles.tapd-prep-show-all .tapd-prep-extra{display:flex;}\n'
      +'.tapd-prep-expand{width:100%;height:32px;margin:6px 0 8px;border-radius:9px;background:transparent;border:1px dashed rgba(234,179,8,.25);color:#EAB308;font-size:11px;font-weight:800;font-family:Inter,sans-serif;cursor:pointer;letter-spacing:.3px;}\n'
      +'.tapd-prep-expand:active{background:rgba(234,179,8,.05);}\n'
      +'.cheat-peek-item.tapd-peek-extra{display:none;}\n'
      +'.cheat-peek-list.tapd-peek-show-all .tapd-peek-extra{display:block;}\n'
      +'.tapd-peek-expand{width:100%;height:32px;margin-top:8px;border-radius:9px;background:transparent;border:1px dashed rgba(234,179,8,.25);color:#EAB308;font-size:11px;font-weight:800;font-family:Inter,sans-serif;cursor:pointer;letter-spacing:.3px;}\n'
      +'#tapdPainHub{padding:0 16px 24px;font-family:Inter,sans-serif;}\n'
      +'.pain-hero{margin:6px 0 14px;}\n'
      +'.pain-kicker{font-size:9px;font-weight:900;letter-spacing:2.2px;text-transform:uppercase;color:#EAB308;opacity:.8;margin-bottom:3px;}\n'
      +'.pain-title{font-size:19px;font-weight:900;color:#F0F4F8;line-height:1.2;letter-spacing:-.3px;}\n'
      +'.pain-summary-line{display:flex;flex-wrap:wrap;gap:0;font-size:12px;color:rgba(255,255,255,.55);margin:8px 0 16px;letter-spacing:.1px;line-height:1.5;}\n'
      +'.pain-summary-seg{cursor:pointer;padding:2px 0;}\n'
      +'.pain-summary-seg b{font-weight:900;color:#F0F4F8;}\n'
      +'.pain-summary-seg.urgent b{color:#FCA5A5;}\n'
      +'.pain-summary-seg.warn b{color:#EAB308;}\n'
      +'.pain-summary-seg.calm b{color:#0ECEC0;}\n'
      +'.pain-summary-sep{padding:0 8px;color:rgba(255,255,255,.20);}\n'
      +'.pain-scope-wrap{margin-bottom:14px;}\n'
      +'.pain-scope-pill{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 13px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.78);font-size:11px;font-weight:800;font-family:Inter,sans-serif;cursor:pointer;letter-spacing:.2px;}\n'
      +'.pain-scope-pill.active{background:rgba(14,206,192,.10);border-color:rgba(14,206,192,.45);color:#0ECEC0;}\n'
      +'.pain-scope-sheet{display:none;margin:8px 0 0;padding:10px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);}\n'
      +'.pain-scope-sheet.show{display:block;}\n'
      +'.pain-scope-opt{display:block;width:100%;text-align:left;height:36px;padding:0 12px;margin:2px 0;border-radius:9px;background:transparent;border:none;color:rgba(255,255,255,.72);font-size:12px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;}\n'
      +'.pain-scope-opt.active{background:rgba(14,206,192,.10);color:#0ECEC0;}\n'
      +'.pain-custom-range{display:none;gap:8px;margin:8px 0 0;align-items:center;flex-wrap:wrap;}\n'
      +'.pain-custom-range.show{display:flex;}\n'
      +'.pain-custom-range label{font-size:10px;color:rgba(255,255,255,.55);font-weight:700;letter-spacing:.5px;text-transform:uppercase;}\n'
      +'.pain-custom-range input[type="date"]{height:32px;padding:0 10px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);color:#F0F4F8;font-family:Inter,sans-serif;font-size:12px;}\n'
      +'.pain-custom-range button{height:32px;padding:0 12px;border-radius:8px;background:rgba(14,206,192,.12);border:1px solid rgba(14,206,192,.40);color:#0ECEC0;font-size:11px;font-weight:800;font-family:Inter,sans-serif;cursor:pointer;}\n'
      +'.pain-filter-chip{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;padding:8px 12px;border-radius:10px;background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.30);}\n'
      +'.pain-filter-chip-text{font-size:11px;font-weight:700;color:#EAB308;line-height:1.3;}\n'
      +'.pain-filter-chip-text b{font-weight:900;}\n'
      +'.pain-filter-chip-clear{width:22px;height:22px;border-radius:50%;background:rgba(234,179,8,.18);border:none;color:#EAB308;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}\n'
      +'.pain-tabs{display:flex;gap:6px;margin-bottom:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px;}\n'
      +'.pain-tabs::-webkit-scrollbar{display:none;}\n'
      +'.pain-tab{flex-shrink:0;height:36px;padding:0 13px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.72);font-size:12px;font-weight:800;font-family:Inter,sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;letter-spacing:-.1px;}\n'
      +'.pain-tab-count{font-size:10px;font-weight:900;opacity:.55;padding:1px 6px;border-radius:999px;background:rgba(255,255,255,.06);}\n'
      +'.pain-tab.active{background:linear-gradient(135deg,#EAB308,#ca8a04);border-color:#EAB308;color:#050505;}\n'
      +'.pain-tab.active .pain-tab-count{background:rgba(0,0,0,.15);opacity:.85;}\n'
      +'.pain-section-heading{display:flex;align-items:baseline;justify-content:space-between;margin:14px 0 8px;font-family:Inter,sans-serif;}\n'
      +'.pain-section-title{font-size:11px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;color:#F0F4F8;}\n'
      +'.pain-section-meta{font-size:10px;letter-spacing:.4px;color:rgba(255,255,255,.40);font-weight:600;}\n'
      +'.pain-list{display:flex;flex-direction:column;}\n'
      +'.pain-row-clean{display:grid;grid-template-columns:8px 1fr auto 14px;gap:11px;align-items:center;padding:13px 4px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;background:transparent;border-left:none;border-right:none;border-top:none;width:100%;text-align:left;font-family:Inter,sans-serif;transition:background .12s;}\n'
      +'.pain-row-clean:active{background:rgba(255,255,255,.02);}\n'
      +'.pain-row-clean:last-child{border-bottom:none;}\n'
      +'.pain-dot{width:8px;height:8px;border-radius:50%;}\n'
      +'.pain-dot.opp{background:#EAB308;box-shadow:0 0 6px rgba(234,179,8,.45);}\n'
      +'.pain-dot.warm{background:#0ECEC0;}\n'
      +'.pain-dot.calm{background:rgba(255,255,255,.30);}\n'
      +'.pain-row-text{min-width:0;}\n'
      +'.pain-row-name{font-size:14px;font-weight:800;color:#F0F4F8;letter-spacing:-.1px;line-height:1.25;}\n'
      +'.pain-row-line{font-size:11px;color:rgba(255,255,255,.50);line-height:1.4;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n'
      +'.pain-warn{color:#FCA5A5;font-size:13px;font-weight:900;}\n'
      +'.pain-row-chev{color:rgba(255,255,255,.25);font-size:14px;}\n'
      +'.pain-row-clean.open .pain-row-chev{transform:rotate(90deg);}\n'
      +'.pain-expanded{padding:14px 4px 18px;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(234,179,8,.025);margin:0 -4px;border-radius:0;will-change:transform,opacity;touch-action:pan-y;}\n'
      +'.pain-exp-badge{display:inline-block;padding:3px 9px;border-radius:999px;font-size:9px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;margin-bottom:10px;margin-left:14px;}\n'
      +'.pain-exp-badge.opp{background:rgba(234,179,8,.12);color:#EAB308;border:1px solid rgba(234,179,8,.30);}\n'
      +'.pain-exp-badge.warm{background:rgba(14,206,192,.10);color:#0ECEC0;border:1px solid rgba(14,206,192,.25);}\n'
      +'.pain-exp-badge.calm{background:rgba(255,255,255,.04);color:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.10);}\n'
      +'.pain-exp-label{font-size:9px;font-weight:900;color:#0ECEC0;letter-spacing:.7px;text-transform:uppercase;margin:6px 14px 4px;}\n'
      +'.pain-exp-action{font-size:13px;color:#F0F4F8;line-height:1.5;margin:0 14px 12px;}\n'
      +'.pain-exp-age{font-size:10px;color:rgba(255,255,255,.42);letter-spacing:.3px;margin:0 14px 12px;}\n'
      +'.pain-exp-age.overdue{color:#FCA5A5;font-weight:700;}\n'
      +'.pain-exp-actions{display:flex;gap:8px;margin:0 14px;}\n'
      +'.pain-exp-btn{flex:1;height:36px;border-radius:9px;font-size:11px;font-weight:800;font-family:Inter,sans-serif;cursor:pointer;letter-spacing:.2px;border:1px solid;}\n'
      +'.pain-exp-btn.primary{background:linear-gradient(135deg,#EAB308,#ca8a04);border-color:#EAB308;color:#050505;}\n'
      +'.pain-exp-btn.secondary{background:transparent;border-color:rgba(14,206,192,.40);color:#0ECEC0;}\n'
      +'.pain-exp-swipe-hint{text-align:center;font-size:9px;color:rgba(255,255,255,.30);margin:10px 0 0;letter-spacing:.5px;}\n'
      +'.pain-empty{padding:36px 16px;text-align:center;color:rgba(255,255,255,.45);}\n'
      +'.pain-empty-emoji{font-size:28px;margin-bottom:8px;opacity:.6;}\n'
      +'.pain-empty-title{font-size:13px;font-weight:700;color:rgba(255,255,255,.65);margin-bottom:4px;}\n'
      +'.pain-empty-sub{font-size:11px;line-height:1.5;}\n'
      +'.tapd-scenario-save-primary{width:100%;min-height:62px;border-radius:16px;background:linear-gradient(135deg,#EAB308,#ca8a04);border:none;color:#050505;font-family:Inter,sans-serif;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:10px 16px;margin-bottom:16px;letter-spacing:-.1px;box-shadow:0 6px 20px rgba(234,179,8,.20);}\n'
      +'.tapd-scenario-save-primary-line1{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:900;}\n'
      +'.tapd-scenario-save-primary-line2{font-size:10px;font-weight:700;opacity:.70;letter-spacing:.3px;}\n'
      +'.tapd-scenario-or{font-size:9px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.32);text-align:center;margin:6px 0 12px;display:flex;align-items:center;gap:10px;}\n'
      +'.tapd-scenario-or:before,.tapd-scenario-or:after{content:"";flex:1;height:1px;background:rgba(255,255,255,.08);}\n'
      +'.tapd-mutual-section{margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.07);}\n'
      +'.tapd-mutual-title{font-size:13px;font-weight:900;color:#F0F4F8;margin-bottom:4px;letter-spacing:-.1px;}\n'
      +'.tapd-mutual-sub{font-size:11px;color:rgba(255,255,255,.50);line-height:1.5;margin-bottom:12px;}\n'
      +'.tapd-mutual-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;}\n'
      +'.tapd-mutual-btn{height:42px;border-radius:11px;font-family:Inter,sans-serif;font-size:11px;font-weight:800;cursor:pointer;letter-spacing:-.1px;line-height:1.2;padding:0 8px;}\n'
      +'.tapd-mutual-btn.primary{background:rgba(14,206,192,.10);border:1px solid rgba(14,206,192,.45);color:#0ECEC0;}\n'
      +'.tapd-mutual-btn.primary:active{background:rgba(14,206,192,.16);}\n'
      +'.tapd-mutual-btn.secondary{background:transparent;border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.78);}\n'
      +'.tapd-mutual-btn.secondary:active{background:rgba(255,255,255,.04);}\n'
      +'@media(max-width:360px){.tapd-mutual-actions{grid-template-columns:1fr;}}\n'
      +'.tapd-nudge-overlay{position:fixed;inset:0;z-index:9998;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.50);opacity:0;pointer-events:none;transition:opacity .22s ease;}\n'
      +'.tapd-nudge-overlay.show{opacity:1;pointer-events:auto;}\n'
      +'.tapd-nudge-card{width:min(440px,calc(100vw - 24px));margin:0 12px 18px;padding:24px 20px 18px;border-radius:22px;background:#0D1117;border:1px solid rgba(34,197,94,.30);box-shadow:0 18px 60px rgba(0,0,0,.55);font-family:Inter,sans-serif;text-align:center;transform:translateY(20px);transition:transform .22s ease;}\n'
      +'.tapd-nudge-overlay.show .tapd-nudge-card{transform:translateY(0);}\n'
      +'.tapd-nudge-icon{width:50px;height:50px;border-radius:50%;background:rgba(34,197,94,.14);color:#22C55E;font-size:24px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;}\n'
      +'.tapd-nudge-title{font-size:18px;font-weight:900;color:#F0F4F8;margin-bottom:6px;letter-spacing:-.2px;}\n'
      +'.tapd-nudge-sub{font-size:13px;color:#F0F4F8;line-height:1.45;margin-bottom:10px;}\n'
      +'.tapd-nudge-detail{font-size:11px;color:rgba(255,255,255,.55);line-height:1.55;margin-bottom:18px;padding:0 4px;}\n'
      +'.tapd-nudge-primary{width:100%;height:48px;border-radius:14px;background:linear-gradient(135deg,#22C55E,#16A34A);border:none;color:#FFFFFF;font-size:14px;font-weight:900;font-family:Inter,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;letter-spacing:-.1px;margin-bottom:8px;box-shadow:0 6px 18px rgba(34,197,94,.30);}\n'
      +'.tapd-nudge-secondary{width:100%;height:40px;background:transparent;border:none;color:rgba(255,255,255,.50);font-size:12px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;letter-spacing:.2px;}\n'
      +'.tapd-mini-toast{position:fixed;left:50%;bottom:32px;transform:translate(-50%,12px);z-index:9999;padding:11px 18px;border-radius:999px;background:rgba(14,206,192,.16);border:1px solid rgba(14,206,192,.40);color:#0ECEC0;font-family:Inter,sans-serif;font-size:12px;font-weight:800;letter-spacing:.1px;opacity:0;transition:opacity .22s ease,transform .22s ease;box-shadow:0 12px 30px rgba(0,0,0,.40);max-width:calc(100vw - 32px);text-align:center;}\n'
      +'.tapd-mini-toast.show{opacity:1;transform:translate(-50%,0);}\n'
      +'.tapd-cheat-primary{width:100%;height:44px;border-radius:14px;border:1px solid #EAB308;background:linear-gradient(135deg,#EAB308,#ca8a04);color:#050505;font-size:13px;font-weight:900;font-family:Inter,sans-serif;}';
    document.head.appendChild(style);
  }

  function setActiveNav(action){
    var h=byId('tapdHardOwnerHeader'); if(!h)return;
    h.querySelectorAll('button').forEach(function(btn){
      var a=actionForButton(btn);
      btn.classList.toggle('tapd-nav-active',a===action);
      btn.setAttribute('aria-current',a===action?'page':'false');
    });
  }
  function closeOwnerPanel(){
    document.body.classList.remove('tapd-owner-tools-mode','ot55-active');
    var side=byId('ownerSidePanel55'); if(side)side.style.display='none';
    var over=byId('ot55Overlay'); if(over)over.style.display='none';
  }
  function closeFullPages(){
    document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  }
  function openOwnerToolsPreserved(){
    setActiveNav('owner');
    document.body.classList.add('tapd-owner-tools-mode','ot55-active');
    var side=byId('ownerSidePanel55');
    if(side){side.style.display='flex';return;}
    if(typeof window.ot55Open==='function'){window.ot55Open();return;}
    var page=byId('page-owner-tools-55');
    if(page){closeFullPages();page.classList.add('active');}
    else if(typeof window.tapdToast==='function')window.tapdToast('Owner Tools not available on this build','warn');
  }
  function openTemplatesClean(){
    setActiveNav('templates');
    closeOwnerPanel();
    document.body.classList.remove('tapd-relhub-mode');
    if(typeof window.tpl56Open==='function'){window.tpl56Open();return;}
    var page=byId('page-template-editor');
    if(page){closeFullPages();page.classList.add('active');}
    else if(typeof window.tapdToast==='function')window.tapdToast('Templates not available on this build yet','warn');
    setTimeout(ensureTemplateActionBar,60);
  }
  function cleanRelationshipHubText(){
    try{
      document.querySelectorAll('.rh56-tab-label,.rh56-empty-msg,.rh56-section-title').forEach(function(el){
        var v=el.textContent;
        v=v.replace('People who tapped your NFC card and sent their TAPD card. Accept to start capturing.','People you\'ve connected with. Connections from NFC taps and captured conversations appear here.');
        v=v.replace('Recordings transcribed, not yet drafted.','Captured conversations waiting for your review.');
        v=v.replace('Tap the gold Capture button to record a conversation.','Captured conversations will appear here before follow-up approval.');
        if(v!==el.textContent)el.textContent=v;
      });
    }catch(e){}
  }
  function openRelationshipHubClean(){
    setActiveNav('relationship');
    closeOwnerPanel();
    document.body.classList.remove('tapd-owner-tools-mode','ot55-active');
    document.body.classList.add('tapd-relhub-mode');
    if(typeof window.rh56Open==='function')window.rh56Open();
    else{
      var page=byId('page-relhub-56');
      if(page){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});page.classList.add('active');try{if(typeof window.rh56Render==='function')window.rh56Render();}catch(e){}}
      else if(typeof window.tapdToast==='function')window.tapdToast('Relationship Hub is not available on this build yet','warn');
    }
    setTimeout(cleanRelationshipHubText,30);
    setTimeout(cleanRelationshipHubText,180);
  }
  function route(action){
    if(action==='owner')return openOwnerToolsPreserved();
    if(action==='templates')return openTemplatesClean();
    if(action==='relationship')return openRelationshipHubClean();
  }
  function actionForButton(btn){
    if(!btn)return '';
    var t=txt(btn);
    if(btn.id==='hardOwnerToolsBtn'||btn.classList.contains('hard-owner-tools')||btn.classList.contains('hard-primary')||t.indexOf('owner')>=0)return 'owner';
    if(btn.id==='hardTemplatesBtn'||btn.classList.contains('hard-template')||t.indexOf('template')>=0)return 'templates';
    if(btn.id==='hardInboxBtn'||btn.id==='hardRelHubBtn'||btn.classList.contains('hard-inbox')||btn.classList.contains('hard-relhub')||t.indexOf('relationship')>=0||t.indexOf('hub')>=0)return 'relationship';
    return '';
  }
  function handleTopNav(ev){
    if(inVisitorMode())return;
    var h=byId('tapdHardOwnerHeader');
    if(!h)return;
    var btn=ev.target&&ev.target.closest?ev.target.closest('button'):null;
    if(!btn||!h.contains(btn))return;
    var action=actionForButton(btn);
    if(!action)return;
    if(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();}
    var t=now();
    if(lastTap.key===action&&(t-lastTap.at)<420)return false;
    lastTap={key:action,at:t};
    route(action);
    return false;
  }
  function goCaptureWithTemplate(id){
    setActiveNav('');
    closeOwnerPanel();
    closeFullPages();
    try{localStorage.setItem('tapd_active_template',id);}catch(e){}
    if(typeof window.currentRelationshipMode!=='undefined')window.currentRelationshipMode=id;
    if(typeof window.goCapture==='function')window.goCapture();
    else if(typeof window.showPage==='function')window.showPage('capture');
    else{document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});var c=byId('capture');if(c)c.classList.add('active');}
    try{if(typeof window.showScreen==='function')window.showScreen('sc-idle');}catch(e){}
    setTimeout(function(){showTemplateCheatSheet(id);},80);
  }
  function showTemplateCheatSheet(id){
    var old=byId('tapdTemplateCheatSheet'); if(old)old.remove();
    var hints=TEMPLATE_HINTS[id]||TEMPLATE_HINTS.custom;
    // Show Q1 (opener), Q3 (relevance/fit), Q5 (next step) by default — the 3-beat arc.
    // Q2 and Q4 stay hidden until the owner taps "Show 2 more".
    var primaryIdx={0:true,2:true,4:true};
    var chipsHtml=hints.map(function(h,i){
      var cls=primaryIdx[i]?'':' class="tapd-cheat-extra"';
      return '<span'+cls+'><b style="color:#EAB308;margin-right:6px;">'+(i+1)+'.</b>'+h+'</span>';
    }).join('');
    var sheet=document.createElement('div');
    sheet.id='tapdTemplateCheatSheet';
    sheet.innerHTML='<div class="tapd-cheat-card">'
      +'<button class="tapd-cheat-close" type="button" aria-label="Close">\xd7</button>'
      +'<p class="tapd-cheat-kicker">Conversation prompts</p>'
      +'<p class="tapd-cheat-title">'+titleCaseFromId(id)+'</p>'
      +'<p class="tapd-cheat-sub">Use one or two that fit the flow. You don\u2019t need to ask all five.</p>'
      +'<div class="tapd-cheat-list" id="tapdCheatList">'+chipsHtml+'</div>'
      +'<button type="button" class="tapd-cheat-expand" id="tapdCheatExpand">Show 2 more questions \u2193</button>'
      +'<button class="tapd-cheat-primary" type="button">Got it \u2014 capture now</button>'
      +'</div>';
    document.body.appendChild(sheet);
    sheet.querySelector('.tapd-cheat-close').onclick=function(){sheet.remove();};
    sheet.querySelector('.tapd-cheat-primary').onclick=function(){sheet.remove();};
    sheet.querySelector('#tapdCheatExpand').onclick=function(){
      var list=sheet.querySelector('#tapdCheatList');
      var expanded=list.classList.toggle('tapd-cheat-show-all');
      this.textContent=expanded?'Show fewer \u2191':'Show 2 more questions \u2193';
    };
    setTimeout(function(){sheet.classList.add('show');},20);
  }
  function ensureTemplateActionBar(){
    var body=byId('tpl56Body'); if(!body)return;
    var active=getActiveTemplate();
    var old=byId('tapdTemplateActionBar'); if(old)old.remove();
    var bar=document.createElement('div');
    bar.id='tapdTemplateActionBar';
    bar.className='tapd-template-action-bar';
    bar.innerHTML='<div><p class="tapd-template-action-title">Ready to capture with '+titleCaseFromId(active)+'</p><p class="tapd-template-action-sub">Use this when you are about to record the conversation. The cheat sheet reminds you what this template is listening for.</p></div><div class="tapd-template-action-row"><button type="button" class="tapd-template-capture-btn">Capture this moment</button><button type="button" class="tapd-template-cheat-btn">View cheat sheet</button></div>';
    body.insertBefore(bar,body.firstChild);
    bar.querySelector('.tapd-template-capture-btn').onclick=function(){goCaptureWithTemplate(getActiveTemplate());};
    bar.querySelector('.tapd-template-cheat-btn').onclick=function(){showTemplateCheatSheet(getActiveTemplate());};
  }
  function wrapTemplateSelection(){
    if(window.__tapdTemplateSelectionWrapped||typeof window.tpl56SetActive!=='function')return;
    window.__tapdTemplateSelectionWrapped=true;
    var original=window.tpl56SetActive;
    window.tpl56SetActive=function(id){
      try{original.call(window,id);}catch(e){try{localStorage.setItem('tapd_active_template',id);}catch(x){}}
      setTimeout(function(){goCaptureWithTemplate(id);},140);
    };
  }
  function wrapTemplateOpen(){
    if(window.__tapdTemplateOpenWrapped||typeof window.tpl56Open!=='function')return;
    window.__tapdTemplateOpenWrapped=true;
    var originalOpen=window.tpl56Open;
    window.tpl56Open=function(){
      var result=originalOpen.apply(window,arguments);
      setActiveNav('templates');
      setTimeout(ensureTemplateActionBar,40);
      setTimeout(ensureTemplateActionBar,180);
      return result;
    };
  }
  // ── Zero-friction visitor strip ──────────────────────────────────────────
  // Removes the "Send my TAPD card back" button and manual connectSheet entirely.
  // The visitor flow is now: tap NFC → see profile → tap a channel → vCard. No typing.
  // The owner captures the relationship on their side using the voice capture tool.
  function buildCleanVisitorStrip(){
    var p=typeof getProfileData==='function'?getProfileData():{};
    var name=p.name||'';
    var firstName=(name||'').split(' ')[0]||'them';
    var title=byId('visitorStripTitle');
    if(title)title.textContent=name?'You tapped '+name+'\u2019s card':'You tapped this TAPD card';
    var opts=byId('connectOptions');
    if(!opts)return;
    opts.innerHTML='';

    // ── SCENARIO A: Primary "Save to your contacts" CTA ──
    // This is the lead action. Saves vCard, then nudges to WhatsApp so the
    // owner gets the visitor's thread back.
    var saveBtn=document.createElement('button');
    saveBtn.className='tapd-scenario-save-primary';
    saveBtn.innerHTML='<span class="tapd-scenario-save-primary-line1">'
      +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      +'Save '+esc(firstName)+' to your contacts'
      +'</span>'
      +'<span class="tapd-scenario-save-primary-line2">One tap \u00B7 number, email &amp; profile</span>';
    saveBtn.onclick=function(){
      // Trigger the existing vCard generator
      try{if(typeof generateVCard==='function')generateVCard();}catch(e){}
      // Then nudge to WhatsApp so the owner gets the thread back
      setTimeout(function(){tapdShowWhatsAppNudge();},420);
    };
    opts.appendChild(saveBtn);

    // OR divider
    var orDiv=document.createElement('p');
    orDiv.className='tapd-scenario-or';
    orDiv.textContent='Or reach out directly';
    opts.appendChild(orDiv);

    function makeBtn(label,bg,primary,svgHtml,action){
      var btn=document.createElement('button');
      btn.className='connect-opt'+(primary?' primary':'');
      if(bg&&bg!=='transparent')btn.style.background=bg;
      btn.innerHTML=svgHtml+' '+label;
      btn.onclick=function(){action();};
      return btn;
    }
    if(p.whatsApp){
      var waNum=String(p.whatsApp).replace(/\D/g,'');
      var waMsg='Hi '+( name||'there')+', I just tapped your TAPD card. Please send me the next step here.';
      opts.appendChild(makeBtn('Message on WhatsApp','#22C55E',true,
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
        function(){window.open('https://wa.me/'+waNum+'?text='+encodeURIComponent(waMsg),'_blank');showConnected('Sent via WhatsApp');}
      ));
    }
    if(p.linkedIn){
      var liUrl=p.linkedIn.startsWith('http')?p.linkedIn:'https://linkedin.com/in/'+p.linkedIn.replace('@','');
      opts.appendChild(makeBtn('Connect on LinkedIn','transparent',false,
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        function(){window.open(liUrl,'_blank');showConnected('Opened LinkedIn');}
      ));
    }
    if(p.instagram){
      var igUrl=p.instagram.startsWith('http')?p.instagram:'https://instagram.com/'+p.instagram.replace('@','');
      opts.appendChild(makeBtn('Follow on Instagram','transparent',false,
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
        function(){window.open(igUrl,'_blank');showConnected('Opened Instagram');}
      ));
    }
    if(p.email){
      opts.appendChild(makeBtn('Send an email','transparent',false,
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        function(){window.open('mailto:'+p.email);showConnected('Email opened');}
      ));
    }

    // ── SCENARIO B: Mutual TAPD Exchange ──
    // For the case both people have TAPD. Save the owner into the visitor's
    // local TAPD connections + send the visitor's TAPD profile back via WhatsApp.
    var mutual=document.createElement('div');
    mutual.className='tapd-mutual-section';
    mutual.innerHTML='<p class="tapd-mutual-title">Both have TAPD?</p>'
      +'<p class="tapd-mutual-sub">Save each other into TAPD so both sides remember the conversation, not just the contact.</p>'
      +'<div class="tapd-mutual-actions">'
      +  '<button type="button" class="tapd-mutual-btn primary" onclick="tapdSaveOwnerToMyTAPD()">Save to my TAPD</button>'
      +  '<button type="button" class="tapd-mutual-btn secondary" onclick="tapdSendMyTAPDBack()">Send my TAPD back</button>'
      +'</div>';
    opts.appendChild(mutual);
  }

  // Block the manual form from ever opening — form defeats NFC zero-friction purpose.
  function noopConnectSheet(){
    window.openConnectSheet=function(){};
    window.closeConnectSheet=function(){};
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO A — TAP-TO-NUDGE
  // After the visitor saves the vCard, prompt them to tap WhatsApp once.
  // Why: vCard gives the OWNER's details to the VISITOR. WhatsApp gives the
  // VISITOR's thread back to the OWNER. The exchange is only balanced if
  // both happen — and the only way to get the WhatsApp thread back without
  // typing is for the visitor to send the first message themselves.
  // ═══════════════════════════════════════════════════════════════════════
  function tapdShowWhatsAppNudge(){
    try{
      var p=typeof getProfileData==='function'?getProfileData():{};
      if(!p.whatsApp)return; // No WA on profile — nudge would 404
      var old=document.getElementById('tapdWhatsAppNudge');
      if(old)old.remove();
      var first=String(p.name||'').split(' ')[0]||'them';
      var sheet=document.createElement('div');
      sheet.id='tapdWhatsAppNudge';
      sheet.className='tapd-nudge-overlay';
      sheet.innerHTML='<div class="tapd-nudge-card">'
        +'<div class="tapd-nudge-icon">\u2713</div>'
        +'<p class="tapd-nudge-title">Details saved.</p>'
        +'<p class="tapd-nudge-sub">Want '+esc(first)+' to know where to send the next step?</p>'
        +'<p class="tapd-nudge-detail">Tap WhatsApp once \u2014 '+esc(first)+' will have your thread, and you\u2019ll have the follow-up plan.</p>'
        +'<button type="button" class="tapd-nudge-primary" onclick="tapdSendNudgedWhatsApp()">'
        +  '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'
        +  'Tap WhatsApp'
        +'</button>'
        +'<button type="button" class="tapd-nudge-secondary" onclick="tapdDismissNudge()">Not now</button>'
        +'</div>';
      document.body.appendChild(sheet);
      setTimeout(function(){sheet.classList.add('show');},20);
    }catch(e){}
  }
  window.tapdShowWhatsAppNudge=tapdShowWhatsAppNudge;

  window.tapdSendNudgedWhatsApp=function(){
    try{
      var p=typeof getProfileData==='function'?getProfileData():{};
      if(!p.whatsApp){tapdDismissNudge();return;}
      var waNum=String(p.whatsApp).replace(/\D/g,'');
      var name=p.name||'there';
      var msg='Hi '+name+', I just tapped your TAPD card. Please send me the next step here.';
      window.open('https://wa.me/'+waNum+'?text='+encodeURIComponent(msg),'_blank');
      // Mark event in localStorage for later analytics / capture matching
      try{localStorage.setItem('tapd_last_nudge',JSON.stringify({owner:name,at:Date.now()}));}catch(e){}
      // Reflect connection state in the existing visitorSent area
      if(typeof showConnected==='function')showConnected('Sent via WhatsApp');
      tapdDismissNudge();
    }catch(e){tapdDismissNudge();}
  };
  window.tapdDismissNudge=function(){
    var s=document.getElementById('tapdWhatsAppNudge');
    if(!s)return;
    s.classList.remove('show');
    setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);},220);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO B — MUTUAL TAPD EXCHANGE
  // Save the owner profile into the visitor's local TAPD connections,
  // and send the visitor's TAPD profile back via WhatsApp. MVP version
  // uses localStorage. Future backend can sync this between accounts.
  // ═══════════════════════════════════════════════════════════════════════
  window.tapdSaveOwnerToMyTAPD=function(){
    try{
      var p=typeof getProfileData==='function'?getProfileData():{};
      var entry={
        id:'tapd_conn_'+Date.now(),
        name:p.name||'Unknown',
        role:p.role||'',
        company:p.company||p.brand||'',
        profileUrl:window.location.href.split('?')[0],
        whatsApp:p.whatsApp||'',
        linkedIn:p.linkedIn||'',
        instagram:p.instagram||'',
        email:p.email||'',
        source:'tapd_mutual_exchange',
        status:'saved_to_tapd',
        savedAt:new Date().toISOString()
      };
      var key='tapd_visitor_saved_profiles';
      var arr=[];
      try{arr=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){arr=[];}
      // De-dupe by profileUrl
      arr=arr.filter(function(x){return x&&x.profileUrl!==entry.profileUrl;});
      arr.push(entry);
      localStorage.setItem(key,JSON.stringify(arr));
      tapdMiniToast('\u2713 Saved '+(p.name||'profile')+' to your TAPD');
    }catch(e){
      tapdMiniToast('Could not save \u2014 storage unavailable');
    }
  };

  window.tapdSendMyTAPDBack=function(){
    try{
      var p=typeof getProfileData==='function'?getProfileData():{};
      if(!p.whatsApp){tapdMiniToast('No WhatsApp on this profile');return;}
      var myUrl='';
      try{myUrl=localStorage.getItem('tapd_my_profile_url')||'';}catch(e){}
      if(!myUrl){
        myUrl=window.prompt('Your TAPD profile URL (we\u2019ll remember it for next time):','')||'';
        myUrl=myUrl.trim();
        if(!myUrl)return;
        try{localStorage.setItem('tapd_my_profile_url',myUrl);}catch(e){}
      }
      var name=p.name||'there';
      var waNum=String(p.whatsApp).replace(/\D/g,'');
      var msg='Hi '+name+', I have TAPD too. Here\u2019s my TAPD profile: '+myUrl;
      window.open('https://wa.me/'+waNum+'?text='+encodeURIComponent(msg),'_blank');
      tapdMiniToast('Opening WhatsApp with your TAPD profile\u2026');
    }catch(e){tapdMiniToast('Could not open WhatsApp');}
  };

  function tapdMiniToast(text){
    try{
      var old=document.querySelector('.tapd-mini-toast');
      if(old)old.remove();
      var t=document.createElement('div');
      t.className='tapd-mini-toast';
      t.textContent=text;
      document.body.appendChild(t);
      setTimeout(function(){t.classList.add('show');},20);
      setTimeout(function(){
        t.classList.remove('show');
        setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},220);
      },2400);
    }catch(e){}
  }
  window.tapdMiniToast=tapdMiniToast;

  // ── Sync prep panel + peek card to new TEMPLATE_HINTS ─────────────────────
  // Update 27 renders #cheatPrepPanel27 (idle/pre-capture) and #cheatPeekCard27
  // (mid-recording peek). Both use their own internal question source. We patch
  // them at the DOM level so the questions match the cheat sheet overlay AND
  // apply the same Q1/Q3/Q5 default + "Show 2 more" expand pattern.
  function patchPrepPanel(){
    var panel=document.getElementById('cheatPrepPanel27');
    if(!panel)return;
    var anglesContainer=panel.querySelector('.cheat-prep-angles');
    if(!anglesContainer)return;
    // Bail if our patch is already in place (prevents observer feedback loop)
    if(anglesContainer.querySelector('.tapd-prep-extra'))return;
    var key=(window._nextStepTemplateKey||window.currentRelationshipMode||'direct_opportunity');
    var hints=TEMPLATE_HINTS[key]||TEMPLATE_HINTS.custom;
    if(!hints||!hints.length)return;
    var primaryIdx={0:true,2:true,4:true};
    anglesContainer.innerHTML=hints.map(function(h,i){
      var extra=primaryIdx[i]?'':' tapd-prep-extra';
      return '<div class="cheat-prep-angle'+extra+'">'
        +'<div class="cheat-prep-dot"></div>'
        +'<span><b style="color:#EAB308;margin-right:6px;font-weight:800;">'+(i+1)+'.</b>'+h+'</span>'
        +'</div>';
    }).join('');
    // Remove any previous expand button before adding a fresh one
    var oldBtn=panel.querySelector('.tapd-prep-expand');
    if(oldBtn)oldBtn.remove();
    var expand=document.createElement('button');
    expand.type='button';
    expand.className='tapd-prep-expand';
    expand.textContent='Show 2 more \u2193';
    expand.onclick=function(){
      var expanded=anglesContainer.classList.toggle('tapd-prep-show-all');
      this.textContent=expanded?'Show fewer \u2191':'Show 2 more \u2193';
    };
    anglesContainer.parentNode.insertBefore(expand,anglesContainer.nextSibling);
  }

  function patchPeekCard(){
    var card=document.getElementById('cheatPeekCard27');
    if(!card)return;
    var list=card.querySelector('.cheat-peek-list');
    if(!list)return;
    if(list.querySelector('.tapd-peek-extra'))return;
    var key=(window._nextStepTemplateKey||window.currentRelationshipMode||'direct_opportunity');
    var hints=TEMPLATE_HINTS[key]||TEMPLATE_HINTS.custom;
    if(!hints||!hints.length)return;
    var primaryIdx={0:true,2:true,4:true};
    list.innerHTML=hints.map(function(h,i){
      var extra=primaryIdx[i]?'':' tapd-peek-extra';
      return '<div class="cheat-peek-item'+extra+'"><b style="color:#EAB308;margin-right:6px;font-weight:800;">'+(i+1)+'.</b>'+h+'</div>';
    }).join('');
    var oldBtn=card.querySelector('.tapd-peek-expand');
    if(oldBtn)oldBtn.remove();
    var expand=document.createElement('button');
    expand.type='button';
    expand.className='tapd-peek-expand';
    expand.textContent='Show 2 more \u2193';
    expand.onclick=function(){
      var expanded=list.classList.toggle('tapd-peek-show-all');
      this.textContent=expanded?'Show fewer \u2191':'Show 2 more \u2193';
    };
    list.parentNode.insertBefore(expand,list.nextSibling);
  }

  function watchCheatPanels(){
    try{
      var obs=new MutationObserver(function(){
        patchPrepPanel();
        patchPeekCard();
      });
      obs.observe(document.body,{childList:true,subtree:true});
    }catch(e){}
    // Also run once now in case panels already exist
    patchPrepPanel();
    patchPeekCard();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PAINKILLER RELATIONSHIP HUB
  // Replaces the vanity-metric layout (X captured, Y sent) with a
  // pain-surfacing layout: "What needs you next" + 4 action-tab list.
  // Reads the same data store the existing rh56 hub reads.
  // ═══════════════════════════════════════════════════════════════════════

  // Template → human-readable status badge.
  var TEMPLATE_STATUS={
    direct_opportunity:'Direct Opportunity',
    stay_in_touch:'Warm Conversation',
    collaboration:'Collaboration Opportunity',
    connector_referral:'Referral Source',
    strategic_partnership:'Partnership Discussion',
    customer_discovery:'Discovery Conversation',
    investor_funding:'Investor Conversation',
    pilot_beta:'Pilot Opportunity',
    speaking_media:'Speaking Opportunity',
    advisory_mentor:'Advisory Conversation',
    community_access:'Community Connection',
    custom:'Captured Conversation'
  };
  // Templates that count as "opportunities".
  var OPPORTUNITY_TEMPLATES={
    direct_opportunity:1,investor_funding:1,strategic_partnership:1,
    collaboration:1,pilot_beta:1,connector_referral:1,speaking_media:1
  };

  function safeGetCaptures(){try{return (typeof getCaptures==='function')?(getCaptures()||[]):[];}catch(e){return [];}}
  function safeGetConnections(){try{return (typeof getConnections==='function')?(getConnections()||[]):[];}catch(e){return [];}}

  function templateOf(item){
    return item.template_id||item.selected_template_id||item.relationship_pathway||item.detected_engagement_type||'custom';
  }
  function badgeForTemplate(t){return TEMPLATE_STATUS[t]||TEMPLATE_STATUS.custom;}
  function badgeClass(t){
    if(OPPORTUNITY_TEMPLATES[t])return 'opp';
    if(t==='stay_in_touch'||t==='advisory_mentor'||t==='customer_discovery'||t==='community_access')return 'warm';
    return 'calm';
  }
  function isOpportunity(item){return !!OPPORTUNITY_TEMPLATES[templateOf(item)];}

  function daysSince(item){
    var t=item.captured_at||item.date||item.created_at||item.timestamp||0;
    if(!t)return 0;
    var ms=(typeof t==='string')?Date.parse(t):t;
    if(!ms||isNaN(ms))return 0;
    return Math.floor((Date.now()-ms)/86400000);
  }
  function ageLabel(d){
    if(d<=0)return 'today';
    if(d===1)return 'yesterday';
    if(d<7)return d+' days ago';
    if(d<14)return 'last week';
    if(d<31)return Math.floor(d/7)+' weeks ago';
    return Math.floor(d/30)+' months ago';
  }

  // What does this person need next? Short, action-oriented.
  function nextActionFor(item){
    var s=String(item.status||item.followup_status||'').toLowerCase();
    if(s==='sent')return 'Sent — awaiting reply';
    if(s==='waiting')return 'Awaiting response';
    if(s==='archived')return 'Closed';
    if(s==='needs_capture'||s==='pending')return 'Capture this conversation';
    if(s==='draft'||s==='ready'||s==='follow_up_ready')return 'Review draft and send';
    var summary=(item.action_summary||item.contact_message||item.summary||'').trim();
    if(summary){
      var first=summary.split(/[.!?\n]/)[0].trim();
      return first.length>72?first.slice(0,69)+'...':first;
    }
    return 'Review and decide next step';
  }

  // Status flags used downstream.
  function isSent(item){var s=String(item.status||item.followup_status||'').toLowerCase();return s==='sent'||s==='waiting';}
  function isAwaitingFollowup(item){var s=String(item.status||item.followup_status||'').toLowerCase();return s==='draft'||s==='ready'||s==='follow_up_ready';}
  function isUncaptured(item){var s=String(item.status||'').toLowerCase();return s==='pending'||s==='needs_capture'||s==='accepted';}

  // Returns a single normalised list of people, captures preferred over bare connections.
  function getAllPeople(){
    var caps=safeGetCaptures();
    var conns=safeGetConnections();
    var seenNames={};
    var out=[];
    caps.forEach(function(c){
      if(!c)return;
      var n=(c.person_name||c.name||'').toLowerCase().trim();
      if(n)seenNames[n]=1;
      out.push(c);
    });
    conns.forEach(function(c){
      if(!c)return;
      var n=(c.person_name||c.name||'').toLowerCase().trim();
      if(n&&seenNames[n])return; // already represented by a capture
      out.push(c);
    });
    return out;
  }

  // Categorise once, use everywhere. Respects the active date scope.
  function categorisePeople(){
    var people=getAllPeople().filter(inDateScope);
    var opportunities=[],needs=[],done=[],all=people;
    var cold=[],awaiting=[],uncaptured=[];
    people.forEach(function(p){
      var sent=isSent(p);
      if(isOpportunity(p))opportunities.push(p);
      if(!sent&&(isAwaitingFollowup(p)||isUncaptured(p)))needs.push(p);
      if(sent)done.push(p);
      // Pain detection
      if(isOpportunity(p)&&!sent&&daysSince(p)>=3)cold.push(p);
      if(isAwaitingFollowup(p))awaiting.push(p);
      if(isUncaptured(p))uncaptured.push(p);
    });
    return {opportunities:opportunities,needs:needs,done:done,all:all,
            cold:cold,awaiting:awaiting,uncaptured:uncaptured};
  }

  function nameOf(p){return p.person_name||p.name||'Name not captured';}
  function idOf(p){return String(p.id||p.capture_id||p.connection_id||(p.person_name||p.name||'')+(p.captured_at||p.date||''));}

  // The action one-liner. MUST come from the AI summary, not a status word.
  // Priority: action_summary → first sentence of contact_message → summary → notes.
  function summaryOneLiner(item){
    var sources=[item.action_summary,item.contact_message,item.summary,item.notes,item.priority_reason];
    for(var i=0;i<sources.length;i++){
      var s=String(sources[i]==null?'':sources[i]).trim();
      if(!s)continue;
      var line=s.split(/[.!?\n]/)[0].trim();
      if(line.length<6)continue;
      if(line.length>72)line=line.slice(0,69)+'\u2026';
      return line;
    }
    return nextActionFor(item); // status-based fallback only when nothing's captured yet
  }

  function sortOldestFirst(arr){
    return arr.slice().sort(function(a,b){return daysSince(b)-daysSince(a);});
  }

  // ── Filter state ──────────────────────────────────────────────────────
  // Active date scope: 'now' (last 72h) | 'week' | 'month' | 'all' | 'custom'
  // Active drill: null | 'cold' | 'awaiting' | 'uncaptured'
  var painState={scope:'now',customFrom:null,customTo:null,drill:null,expandedId:null,scopeSheetOpen:false};

  function getTimestamp(item){
    var t=item.captured_at||item.date||item.created_at||item.timestamp||0;
    if(!t)return 0;
    return (typeof t==='string')?Date.parse(t):t;
  }
  function inDateScope(item){
    var ts=getTimestamp(item);
    var now=Date.now();
    if(painState.scope==='all')return true;
    if(!ts)return painState.scope==='all'; // undated items show only in All
    if(painState.scope==='now')return (now-ts)<=(72*3600*1000);
    if(painState.scope==='week')return (now-ts)<=(7*86400000);
    if(painState.scope==='month')return (now-ts)<=(30*86400000);
    if(painState.scope==='custom'){
      var from=painState.customFrom||0;
      var to=painState.customTo||now;
      return ts>=from && ts<=to;
    }
    return true;
  }
  function scopeLabel(){
    if(painState.scope==='now')return 'last 72 hours';
    if(painState.scope==='week')return 'this week';
    if(painState.scope==='month')return 'this month';
    if(painState.scope==='custom')return 'your selected range';
    return 'all time';
  }

  function renderPersonCard(p){
    var t=templateOf(p);
    var bClass=badgeClass(t);
    var d=daysSince(p);
    // Overdue: opps 3d+, drafts/awaiting 1d+
    var overdue=false;
    if(isOpportunity(p)&&!isSent(p)&&d>=3)overdue=true;
    else if(isAwaitingFollowup(p)&&d>=1)overdue=true;
    var rowId=idOf(p);
    var oneLine=summaryOneLiner(p);
    var isOpen=painState.expandedId===rowId;
    var rowHtml='<button type="button" class="pain-row-clean'+(isOpen?' open':'')+'" data-row-id="'+esc(rowId)+'" onclick="tapdPainToggleRow(this.getAttribute(\'data-row-id\'))">'
      +'<span class="pain-dot '+bClass+'"></span>'
      +'<span class="pain-row-text">'
        +'<span class="pain-row-name">'+esc(nameOf(p))+'</span>'
        +'<span class="pain-row-line">'+esc(oneLine)+'</span>'
      +'</span>'
      +'<span class="pain-warn">'+(overdue?'\u26A0':'')+'</span>'
      +'<span class="pain-row-chev">\u203A</span>'
      +'</button>';
    if(!isOpen)return rowHtml;
    // Expanded inline detail. Touch-swipe-right to close.
    var firstName=String(nameOf(p)).split(' ')[0]||'them';
    var badgeTxt=badgeForTemplate(t);
    var ageStr='Captured '+ageLabel(d);
    var actionLine=summaryOneLiner(p);
    var expHtml='<div class="pain-expanded" data-row-id="'+esc(rowId)+'">'
      +'<span class="pain-exp-badge '+bClass+'">'+esc(badgeTxt)+'</span>'
      +'<p class="pain-exp-label">What '+esc(firstName)+' is expecting from you</p>'
      +'<p class="pain-exp-action">'+esc(actionLine)+'</p>'
      +'<p class="pain-exp-age'+(overdue?' overdue':'')+'">'+(overdue?'\u26A0 ':'')+esc(ageStr)+'</p>'
      +'<div class="pain-exp-actions">'
        +'<button type="button" class="pain-exp-btn primary" onclick="tapdPainOpenItem(\''+esc(rowId)+'\')">Open follow-up</button>'
        +'<button type="button" class="pain-exp-btn secondary" onclick="tapdPainCloseRow()">Close</button>'
      +'</div>'
      +'<p class="pain-exp-swipe-hint">Swipe right to close \u2192</p>'
      +'</div>';
    return rowHtml+expHtml;
  }

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});}

  function renderEmpty(emoji,title,sub){
    return '<div class="pain-empty"><div class="pain-empty-emoji">'+emoji+'</div>'
      +'<p class="pain-empty-title">'+title+'</p>'
      +'<p class="pain-empty-sub">'+sub+'</p></div>';
  }

  function renderTabContent(tab,cats){
    var list,empty;
    if(tab==='opp'){list=cats.opportunities;empty=renderEmpty('\uD83D\uDD25','No opportunities in '+scopeLabel(),'Captured conversations with opportunity templates appear here.');}
    else if(tab==='need'){list=cats.needs;empty=renderEmpty('\uD83E\uDD1D','Nothing awaits you in '+scopeLabel(),'Anything waiting on your next move will appear here.');}
    else if(tab==='done'){list=cats.done;empty=renderEmpty('\u2705','Nothing followed up in '+scopeLabel(),'Follow-ups you send appear here so you can track replies.');}
    else {list=cats.all;empty=renderEmpty('\uD83D\uDC65','No people in '+scopeLabel(),'Captured conversations and connections in this window appear here.');}
    if(painState.drill==='cold')list=list.filter(function(p){return isOpportunity(p)&&!isSent(p)&&daysSince(p)>=3;});
    else if(painState.drill==='awaiting')list=list.filter(isAwaitingFollowup);
    else if(painState.drill==='uncaptured')list=list.filter(isUncaptured);
    if(!list.length)return empty;
    list=sortOldestFirst(list); // oldest pain first
    return '<div class="pain-list">'+list.map(renderPersonCard).join('')+'</div>';
  }

  // Toggle inline expand on a row.
  window.tapdPainToggleRow=function(rowId){
    painState.expandedId=(painState.expandedId===rowId)?null:rowId;
    rerenderHub();
  };
  window.tapdPainCloseRow=function(){
    painState.expandedId=null;
    rerenderHub();
  };
  // Hook to the existing follow-up open functions if present.
  window.tapdPainOpenItem=function(rowId){
    try{
      if(typeof tapd49OpenFollowup==='function'){tapd49OpenFollowup(rowId);return;}
      if(typeof tapd49OpenConnection==='function'){tapd49OpenConnection(rowId);return;}
    }catch(e){}
  };
  // Toggle the date scope sheet.
  window.tapdPainToggleScopeSheet=function(){
    painState.scopeSheetOpen=!painState.scopeSheetOpen;
    rerenderHub();
  };

  // Switch tab — re-renders the whole hub so chips and counts stay in sync.
  window.tapdPainTab=function(tab){
    var hub=document.getElementById('tapdPainHub');if(!hub)return;
    try{hub.dataset.activeTab=tab;}catch(e){}
    // Tab switch alone does not clear drill-down — user can layer them.
    rerenderHub();
  };

  // Pain row click → set drill-down filter AND jump to the relevant tab.
  window.tapdPainJump=function(tab,drill){
    var hub=document.getElementById('tapdPainHub');if(!hub)return;
    try{hub.dataset.activeTab=tab;}catch(e){}
    painState.drill=drill||null;
    rerenderHub();
  };

  // Clear drill-down filter chip.
  window.tapdPainClearDrill=function(){
    painState.drill=null;
    rerenderHub();
  };

  // Change date scope.
  window.tapdPainSetScope=function(scope){
    painState.scope=scope;
    // Custom scope: do not auto-apply until user hits Apply, but show inputs.
    if(scope!=='custom'){painState.customFrom=null;painState.customTo=null;}
    rerenderHub();
    if(scope==='custom'){
      var box=document.querySelector('.pain-custom-range');
      if(box)box.classList.add('show');
    }
  };

  // Apply custom date range.
  window.tapdPainApplyCustom=function(){
    var f=document.getElementById('painCustomFrom');
    var t=document.getElementById('painCustomTo');
    var from=f&&f.value?Date.parse(f.value):null;
    var to=t&&t.value?(Date.parse(t.value)+86400000-1):null; // include the "to" day
    if(from)painState.customFrom=from;
    if(to)painState.customTo=to;
    painState.scope='custom';
    rerenderHub();
  };

  function rerenderHub(){
    var body=findHubBody();
    if(body){body.innerHTML=renderPainkillerHub();body.dataset.tapdPainHubRendered='1';}
  }

  function renderPainkillerHub(){
    var cats=categorisePeople();
    var n=function(a){return a.length;};
    var activeTab=(document.getElementById('tapdPainHub')&&document.getElementById('tapdPainHub').dataset.activeTab)||'opp';

    // Pain summary line — one row replacing the old 3 stacked rows.
    var segs=[];
    var actionCount=0;
    if(n(cats.cold)>0){
      actionCount+=n(cats.cold);
      segs.push('<span class="pain-summary-seg urgent" onclick="tapdPainJump(\'opp\',\'cold\')"><b>'+n(cats.cold)+' cold</b></span>');
    }
    if(n(cats.awaiting)>0){
      actionCount+=n(cats.awaiting);
      segs.push('<span class="pain-summary-seg warn" onclick="tapdPainJump(\'need\',\'awaiting\')"><b>'+n(cats.awaiting)+' in draft</b></span>');
    }
    if(n(cats.uncaptured)>0){
      actionCount+=n(cats.uncaptured);
      segs.push('<span class="pain-summary-seg calm" onclick="tapdPainJump(\'need\',\'uncaptured\')"><b>'+n(cats.uncaptured)+' uncaptured</b></span>');
    }
    var summaryLine='';
    if(segs.length){
      summaryLine='<div class="pain-summary-line">'+segs.join('<span class="pain-summary-sep">\u00B7</span>')+'</div>';
    }

    var heroTitle=actionCount>0
      ? actionCount+' waiting on your next move'
      : 'You\u2019re all caught up';

    // Single scope pill with expandable sheet underneath.
    var scopeLabels={now:'Right now',week:'This week',month:'This month',all:'All time',custom:'Custom range'};
    var scopePill='<button class="pain-scope-pill'+(painState.scope!=='now'?' active':'')+'" onclick="tapdPainToggleScopeSheet()">'
      +'\uD83D\uDCC5 '+esc(scopeLabels[painState.scope]||'Right now')+' '+(painState.scopeSheetOpen?'\u25B4':'\u25BE')+'</button>';
    function so(id,label){return '<button class="pain-scope-opt'+(painState.scope===id?' active':'')+'" onclick="tapdPainSetScope(\''+id+'\');tapdPainToggleScopeSheet();">'+label+'</button>';}
    var scopeSheet='<div class="pain-scope-sheet'+(painState.scopeSheetOpen?' show':'')+'">'
      +so('now','Right now (last 72h)')
      +so('week','This week')
      +so('month','This month')
      +so('all','All time')
      +so('custom','Custom range\u2026')
      +'</div>';
    var customRange='<div class="pain-custom-range'+(painState.scope==='custom'?' show':'')+'">'
      +'<label>From</label><input type="date" id="painCustomFrom" />'
      +'<label>To</label><input type="date" id="painCustomTo" />'
      +'<button onclick="tapdPainApplyCustom()">Apply</button>'
      +'</div>';

    // Horizontal tab pills — icon + count only. Full label shown as section heading.
    function tab(id,emoji,count){
      return '<button class="pain-tab'+(id===activeTab?' active':'')+'" data-tab="'+id+'" onclick="tapdPainTab(\''+id+'\')">'
        +'<span>'+emoji+'</span>'
        +'<span class="pain-tab-count">'+count+'</span></button>';
    }
    var fullLabels={opp:'Opportunities',need:'Awaiting your move',done:'Followed up',all:'Everyone you\u2019ve met'};

    // Drill-down filter chip
    var drillChip='';
    if(painState.drill){
      var drillLabels={cold:'opportunities going cold',awaiting:'follow-ups sitting in draft',uncaptured:'conversations you haven\u2019t captured'};
      var drilledCount=0;
      if(painState.drill==='cold')drilledCount=cats.cold.length;
      else if(painState.drill==='awaiting')drilledCount=cats.awaiting.length;
      else if(painState.drill==='uncaptured')drilledCount=cats.uncaptured.length;
      drillChip='<div class="pain-filter-chip">'
        +'<div class="pain-filter-chip-text">Filtered: <b>'+esc(drillLabels[painState.drill]||'')+' ('+drilledCount+')</b></div>'
        +'<button class="pain-filter-chip-clear" onclick="tapdPainClearDrill()" aria-label="Clear filter">\u00D7</button>'
        +'</div>';
    }

    return '<div id="tapdPainHub" data-active-tab="'+activeTab+'">'
      +'<div class="pain-hero">'
      +'<p class="pain-kicker">The people who need you now</p>'
      +'<p class="pain-title">'+esc(heroTitle)+'</p>'
      +summaryLine
      +'</div>'
      +'<div class="pain-scope-wrap">'+scopePill+scopeSheet+customRange+'</div>'
      +'<div class="pain-tabs">'
      +tab('opp','\uD83D\uDD25',n(cats.opportunities))
      +tab('need','\uD83E\uDD1D',n(cats.needs))
      +tab('done','\u2705',n(cats.done))
      +tab('all','\uD83D\uDC65',n(cats.all))
      +'</div>'
      +'<div class="pain-section-heading">'
      +'<span class="pain-section-title">'+esc(fullLabels[activeTab]||'')+'</span>'
      +'<span class="pain-section-meta">Oldest first</span>'
      +'</div>'
      +drillChip
      +'<div id="tapdPainTabContent">'+renderTabContent(activeTab,cats)+'</div>'
      +'</div>';
  }

  // Find the rh56 body container and replace its contents with our hub.
  function findHubBody(){
    var ids=['rh56Body','rh56-body','tapd54RelHubShell','page-relhub-56'];
    for(var i=0;i<ids.length;i++){
      var el=document.getElementById(ids[i]);
      if(el)return el;
    }
    var anchor=document.querySelector('.tapd54-hub-header,#rh56Tabs,.tapd54-section-tabs');
    if(anchor){
      var p=anchor.parentNode;
      while(p&&p!==document.body){
        if(p.scrollHeight>200||p.classList.contains('owner-side-body'))return p;
        p=p.parentNode;
      }
      return anchor.parentNode;
    }
    return null;
  }

  function patchRelationshipHub(){
    if(!document.body.classList.contains('tapd-relhub-mode'))return;
    var body=findHubBody();
    if(!body)return;
    if(body.dataset.tapdPainHubRendered==='1'&&body.querySelector('#tapdPainHub'))return;
    body.innerHTML=renderPainkillerHub();
    body.dataset.tapdPainHubRendered='1';
  }

  function watchRelationshipHub(){
    try{
      var obs=new MutationObserver(function(){
        if(document.body.classList.contains('tapd-relhub-mode'))patchRelationshipHub();
      });
      obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    }catch(e){}
    setTimeout(patchRelationshipHub,80);
    setTimeout(patchRelationshipHub,280);
    setTimeout(patchRelationshipHub,800);
  }

  // Swipe-right to close the expanded card. Single delegated handler on body.
  function installSwipeToCloseExpanded(){
    if(window.__tapdPainSwipeInstalled)return;
    window.__tapdPainSwipeInstalled=true;
    var startX=0,startY=0,target=null,dragging=false;
    document.addEventListener('touchstart',function(e){
      var el=e.target&&e.target.closest?e.target.closest('.pain-expanded'):null;
      if(!el)return;
      target=el;
      startX=e.touches[0].clientX;
      startY=e.touches[0].clientY;
      dragging=false;
    },{passive:true});
    document.addEventListener('touchmove',function(e){
      if(!target)return;
      var dx=e.touches[0].clientX-startX;
      var dy=e.touches[0].clientY-startY;
      // Only treat as horizontal swipe when clearly horizontal AND rightward.
      if(!dragging){
        if(Math.abs(dx)>10 && Math.abs(dx)>Math.abs(dy)*1.4 && dx>0)dragging=true;
        else return;
      }
      if(dx>0){
        target.style.transform='translateX('+dx+'px)';
        target.style.opacity=String(Math.max(0,1-(dx/220)));
      }
    },{passive:true});
    document.addEventListener('touchend',function(){
      if(!target){return;}
      var el=target;target=null;
      if(!dragging){return;}
      var transform=el.style.transform||'';
      var m=transform.match(/translateX\(([-\d.]+)px\)/);
      var dx=m?parseFloat(m[1]):0;
      el.style.transition='transform .22s ease, opacity .22s ease';
      if(dx>80){
        el.style.transform='translateX(100%)';
        el.style.opacity='0';
        setTimeout(function(){painState.expandedId=null;rerenderHub();},200);
      } else {
        el.style.transform='';
        el.style.opacity='';
        setTimeout(function(){el.style.transition='';},220);
      }
      dragging=false;
    });
  }

  // Personalise the vCard button: inject owner's first name the moment visitor connects.
  // Runs after showConnected() hides the options and reveals visitorSent.
  function upgradeShowConnected(){
    var _orig=window.showConnected;
    if(!_orig||window.__tapdShowConnectedUpgraded)return;
    window.__tapdShowConnectedUpgraded=true;
    window.showConnected=function(msg){
      if(typeof _orig==='function')_orig(msg);
      try{
        var p=typeof getProfileData==='function'?getProfileData():{};
        var first=(p.name||'').trim().split(' ')[0]||'contact';
        var el=document.getElementById('tapdVcardName');
        if(el)el.textContent=first;
      }catch(e){}
    };
  }

  function boot(){
    injectWorkspaceStyles();
    document.addEventListener('pointerup',handleTopNav,true);
    document.addEventListener('click',handleTopNav,true);
    window.openTapdInboxFromSide=openRelationshipHubClean;
    window.tapd49OpenRelationshipHub=openRelationshipHubClean;
    window.tapd52OpenRelationshipHub=openRelationshipHubClean;
    window.tapd54OpenRelationshipHub=openRelationshipHubClean;
    window.openRelationshipHub=openRelationshipHubClean;
    window.tapdOpenTemplates=openTemplatesClean;
    window.openQuickTemplateSwitcher=openTemplatesClean;
    wrapTemplateOpen();
    wrapTemplateSelection();
    setTimeout(wrapTemplateOpen,250);
    setTimeout(wrapTemplateSelection,250);
    setTimeout(wrapTemplateOpen,800);
    setTimeout(wrapTemplateSelection,800);
    setTimeout(cleanRelationshipHubText,400);
    upgradeShowConnected();
    noopConnectSheet();
    watchCheatPanels();
    watchRelationshipHub();
    installSwipeToCloseExpanded();
    window.buildVisitorStrip=buildCleanVisitorStrip;
    // Re-assert ownership of the visitor strip render. If a later script
    // overrides window.buildVisitorStrip, this guarantees the Scenario A+B
    // version wins. Cheap defensive interval — Date.now check avoids running
    // when nothing has changed.
    setInterval(function(){
      if(window.buildVisitorStrip!==buildCleanVisitorStrip){
        window.buildVisitorStrip=buildCleanVisitorStrip;
        if(inVisitorMode()){
          var vs=byId('visitorStrip');
          if(vs&&vs.classList.contains('show'))buildCleanVisitorStrip();
        }
      }
    },1500);
    // Re-run if strip already rendered before our script loaded
    if(inVisitorMode()){
      var vs=byId('visitorStrip');
      if(vs&&vs.classList.contains('show'))buildCleanVisitorStrip();
    }
    console.log('[TAPD] Update 69C loaded \u2014 active nav, template capture, vCard name, zero-friction visitor strip active.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
</script>`;

if (html.includes('</body>')) {
  html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, controller + '\n</body>');
} else {
  html += '\n' + controller + '\n';
}

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Applied active nav state and template capture actions.');
} else {
  console.log('[TAPD build] No active-nav changes required.');
}
