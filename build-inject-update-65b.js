const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), 'index.html');
const scriptTag = '<script src="/update-65b-navigation-guardrails.js"></script>';
const styleBlock = `<style id="tapd67-inline-tap-fix">
.tapd-hard-owner-header{pointer-events:none!important;z-index:9600!important;}
.tapd-hard-owner-header button,.owner-bar button,.owner-btn,.owner-side-tab-btn,.quick-template-option,.tpl-list-card-btn,.conn-btn{min-height:46px!important;touch-action:manipulation!important;pointer-events:auto!important;cursor:pointer!important;position:relative!important;z-index:9601!important;-webkit-user-select:none!important;user-select:none!important;}
.tapd-hard-owner-header{gap:10px!important;padding-top:12px!important;padding-bottom:12px!important;}
.tapd-hard-owner-header button{border-radius:999px!important;font-size:11px!important;font-weight:900!important;}
.capture-footer,.send-bar{z-index:9550!important;pointer-events:auto!important;}
.capture-footer button,.send-bar button,.btn-capture,.btn-stop,.btn-confirm,.btn-send{touch-action:manipulation!important;pointer-events:auto!important;position:relative!important;z-index:9551!important;}
.owner-side-backdrop{pointer-events:none!important;} body.owner-panel-open .owner-side-backdrop{pointer-events:auto!important;}
.upgrade-sheet:not(.open),.connect-sheet:not(.open){pointer-events:none!important;} .upgrade-sheet.open,.connect-sheet.open{pointer-events:auto!important;}
</style>`;

if (!fs.existsSync(indexPath)) {
  console.log('[TAPD build] index.html not found; skipping Update 67 injection.');
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

if (!html.includes('tapd67-inline-tap-fix')) {
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${styleBlock}\n</head>`);
  } else {
    html = `${styleBlock}\n${html}`;
  }
}

if (!html.includes('update-65b-navigation-guardrails.js')) {
  if (html.includes('</body>')) {
    html = html.replace('</body>', `${scriptTag}\n</body>`);
  } else {
    html += `\n${scriptTag}\n`;
  }
  console.log('[TAPD build] Update 67 navigation guardrails injected into index.html.');
} else {
  console.log('[TAPD build] Navigation guardrails already present in index.html.');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('[TAPD build] Update 67 tap reliability styles injected.');