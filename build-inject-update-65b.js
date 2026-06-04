const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), 'index.html');
const scriptTag = '<script src="/update-65b-navigation-guardrails.js"></script>';

if (!fs.existsSync(indexPath)) {
  console.log('[TAPD build] index.html not found; skipping Update 65B injection.');
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

if (!html.includes('update-65b-navigation-guardrails.js')) {
  if (html.includes('</body>')) {
    html = html.replace('</body>', `${scriptTag}\n</body>`);
  } else {
    html += `\n${scriptTag}\n`;
  }
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Update 65B navigation guardrails injected into index.html.');
} else {
  console.log('[TAPD build] Update 65B already present in index.html.');
}
