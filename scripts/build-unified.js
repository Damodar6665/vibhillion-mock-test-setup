// ==============================================================================
// VIBHILLION AI: UNIFIED DEPLOYMENT PACKAGER
// Generates a single deployable distribution where:
// - index.html (or /) -> Student Mock Test App (http://localhost:8081/tests)
// - admin.html (or /admin) -> Admin Backend Panel (http://localhost:5173/)
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'dist_unified');

console.log('🚀 Starting Unified Packaging for Vercel / Cloudflare...');

// 1. Ensure clean output directory
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// 2. Build shared package
console.log('📦 Step 1/3: Building @vibhillion/shared...');
execSync('npm --prefix packages/shared run build', { cwd: ROOT_DIR, stdio: 'inherit' });

// 3. Build Admin app
console.log('🖥️ Step 2/3: Building Admin App (Vite)...');
execSync('npm --prefix apps/admin run build', { cwd: ROOT_DIR, stdio: 'inherit' });

// 4. Export Student app (Expo web)
console.log('📱 Step 3/3: Exporting Student App for Web (Expo)...');
execSync('npx expo export --platform web', { cwd: path.join(ROOT_DIR, 'apps/student'), stdio: 'inherit' });

// Helper to copy recursive
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

// 5. Copy Student Web to OUTPUT_DIR as primary index.html
console.log('📂 Merging Student Web app into root (index.html)...');
const studentDist = path.join(ROOT_DIR, 'apps/student/dist');
copyDirSync(studentDist, OUTPUT_DIR);

// 6. Copy Admin Web to OUTPUT_DIR as admin.html and /admin/index.html
console.log('📂 Merging Admin App into admin.html and /admin/ ...');
const adminDist = path.join(ROOT_DIR, 'apps/admin/dist');

// Copy admin assets
if (fs.existsSync(path.join(adminDist, 'assets'))) {
  copyDirSync(path.join(adminDist, 'assets'), path.join(OUTPUT_DIR, 'assets'));
}

// Copy other admin root files (icons.svg, favicon.svg)
const adminEntries = fs.readdirSync(adminDist);
for (const file of adminEntries) {
  if (file === 'assets') continue;
  if (file === 'index.html') {
    // Write admin.html
    fs.copyFileSync(path.join(adminDist, 'index.html'), path.join(OUTPUT_DIR, 'admin.html'));
    // Also create /admin/index.html for clean URLs
    const adminFolder = path.join(OUTPUT_DIR, 'admin');
    fs.mkdirSync(adminFolder, { recursive: true });
    fs.copyFileSync(path.join(adminDist, 'index.html'), path.join(adminFolder, 'index.html'));
  } else {
    fs.copyFileSync(path.join(adminDist, file), path.join(OUTPUT_DIR, file));
  }
}

// 7. Write Vercel configuration (vercel.json) in output
const vercelConfig = {
  version: 2,
  cleanUrls: true,
  routes: [
    { src: '/admin.html', dest: '/admin.html' },
    { src: '/admin', dest: '/admin.html' },
    { src: '/admin/(.*)', dest: '/admin.html' },
    { src: '/_expo/(.*)', dest: '/_expo/$1' },
    { src: '/assets/(.*)', dest: '/assets/$1' },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' }
  ]
};
fs.writeFileSync(path.join(OUTPUT_DIR, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
fs.writeFileSync(path.join(ROOT_DIR, 'vercel.json'), JSON.stringify({
  ...vercelConfig,
  outputDirectory: 'dist_unified'
}, null, 2));

console.log('✅ Unified packaging complete!');
console.log(`📁 Distribution generated in: ${OUTPUT_DIR}`);
console.log('   - index.html   -> Student Mock Test App (http://localhost:8081/tests)');
console.log('   - admin.html   -> Admin Backend Panel (http://localhost:5173/)');
console.log('   - /admin/      -> Admin Backend Panel');
