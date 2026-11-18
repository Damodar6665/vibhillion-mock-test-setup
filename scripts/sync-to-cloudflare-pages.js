// ==============================================================================
// VIBHILLION AI: SYNC STUDENT APP TO CLOUDFLARE PAGES (vibhillionsite-admin)
// ==============================================================================

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const STUDENT_DIST = path.join(ROOT_DIR, 'apps/student/dist');
const PAGES_DIR = path.resolve('E:/vibhillionsite-admin');

console.log('🚀 Syncing Student Web App to Cloudflare Pages site:', PAGES_DIR);

if (!fs.existsSync(STUDENT_DIST)) {
  console.error('❌ Error: student dist does not exist. Run expo export first.');
  process.exit(1);
}

if (!fs.existsSync(PAGES_DIR)) {
  console.error('❌ Error: vibhillionsite-admin does not exist at:', PAGES_DIR);
  process.exit(1);
}

// Recursive directory copy
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy _expo/
console.log('📦 1/5: Copying _expo bundle...');
copyDirSync(path.join(STUDENT_DIST, '_expo'), path.join(PAGES_DIR, '_expo'));

// 2. Copy student assets to PAGES_DIR/assets
console.log('🖼️ 2/5: Merging student assets...');
copyDirSync(path.join(STUDENT_DIST, 'assets'), path.join(PAGES_DIR, 'assets'));

// 3. Prepare student.html and tests.html with proper title
console.log('📄 3/5: Generating student.html, tests.html...');
let studentHtml = fs.readFileSync(path.join(STUDENT_DIST, 'index.html'), 'utf8');
studentHtml = studentHtml.replace(
  /<title>.*?<\/title>/,
  '<title>VibhillionAI — Student Mock Test Portal</title>'
);

fs.writeFileSync(path.join(PAGES_DIR, 'student.html'), studentHtml, 'utf8');
fs.writeFileSync(path.join(PAGES_DIR, 'tests.html'), studentHtml, 'utf8');
fs.writeFileSync(path.join(PAGES_DIR, 'mock-test.html'), studentHtml, 'utf8');

// Ensure no conflicting directory names that break Cloudflare clean URLs
if (fs.existsSync(path.join(PAGES_DIR, 'student'))) {
  fs.rmSync(path.join(PAGES_DIR, 'student'), { recursive: true, force: true });
}
if (fs.existsSync(path.join(PAGES_DIR, 'tests'))) {
  fs.rmSync(path.join(PAGES_DIR, 'tests'), { recursive: true, force: true });
}

// 4. Update _redirects (SPA subroute fallback only)
console.log('🔀 4/5: Updating Cloudflare Pages _redirects...');
const redirectsContent = `# VibhillionAI Cloudflare Pages SPA Rewrites
# Native clean URLs automatically map /student -> student.html and /tests -> tests.html.
# Only subroutes require rewrite rules to avoid 404s:
/student/*     /student.html  200
/tests/*       /tests.html    200
/exam/*        /student.html  200
/auth/*        /student.html  200
`;
fs.writeFileSync(path.join(PAGES_DIR, '_redirects'), redirectsContent, 'utf8');

// 5. Update _headers
console.log('⚡ 5/5: Updating Cloudflare Pages _headers...');
let headersContent = fs.readFileSync(path.join(PAGES_DIR, '_headers'), 'utf8');
if (!headersContent.includes('/student.html')) {
  headersContent += `
/student.html
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  CDN-Cache-Control: no-store
  Cloudflare-CDN-Cache-Control: no-store

/tests.html
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  CDN-Cache-Control: no-store
  Cloudflare-CDN-Cache-Control: no-store

/_expo/*
  Cache-Control: public, max-age=31536000, immutable
`;
  fs.writeFileSync(path.join(PAGES_DIR, '_headers'), headersContent, 'utf8');
}

console.log('✅ Student App successfully synced to Cloudflare Pages repository!');
console.log('   - Live URL on push: https://vibhillionsite-admin.pages.dev/student');
console.log('   - Direct URL:      https://vibhillionsite-admin.pages.dev/tests');
console.log('   - Admin URL:       https://vibhillionsite-admin.pages.dev/admin');
