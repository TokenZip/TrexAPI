#!/usr/bin/env node
/**
 * Sync public/demo.html into worker/src/demo.html.ts as DEMO_HTML string.
 * Run from repo root: node scripts/sync-demo-html.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'public', 'demo.html');
const outPath = path.join(root, 'worker', 'src', 'demo.html.ts');

let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const out = `// Auto-generated from public/demo.html. Re-run: node scripts/sync-demo-html.cjs
// Includes i18n (EN/ZH, auto-detect + manual switch).

export const DEMO_HTML = \`${html}\`;
`;
fs.writeFileSync(outPath, out);
console.log('Synced public/demo.html -> worker/src/demo.html.ts');
