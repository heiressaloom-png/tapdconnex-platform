const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), 'index.html');
const tag = '<script src="/update-68-owner-toggle-fix.js"></script>';

if (!fs.existsSync(indexPath)) {
  console.log('[TAPD build] index.html not found; Update 68 skipped.');
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

if (!html.includes('update-68-owner-toggle-fix.js')) {
  html = html.includes('</body>')
    ? html.replace('</body>', `${tag}\n</body>`)
    : `${html}\n${tag}\n`;
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Update 68 owner toggle fix added.');
} else {
  console.log('[TAPD build] Update 68 owner toggle fix already present.');
}