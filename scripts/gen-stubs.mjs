#!/usr/bin/env node
// Auto-generates stub .ts files for missing internal modules
// Run: node scripts/gen-stubs.mjs

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(__dirname, '../src');

// Run tsc and collect missing relative module paths
let tscOutput = '';
try {
  execSync('npx tsc --noEmit 2>&1', { cwd: resolve(__dirname, '..'), encoding: 'utf8' });
} catch (e) {
  tscOutput = e.stdout || '';
}

// Parse: src/foo/bar.ts(1,2): error TS2307: Cannot find module '../baz/qux.js'
const regex = /^(src\/.+?\.tsx?)\(\d+,\d+\): error TS2307: Cannot find module '([^']+)'/gm;
const missingByFile = new Map();

let match;
while ((match = regex.exec(tscOutput)) !== null) {
  const [, sourceFile, modulePath] = match;
  // Only handle relative imports (internal files)
  if (!modulePath.startsWith('.')) continue;
  if (!missingByFile.has(sourceFile)) missingByFile.set(sourceFile, new Set());
  missingByFile.get(sourceFile).add(modulePath);
}

// Resolve absolute paths for each missing module
const toCreate = new Set();
for (const [sourceFile, modulePaths] of missingByFile) {
  const sourceDir = dirname(join(srcRoot, '..', sourceFile));
  for (const modulePath of modulePaths) {
    // Strip .js extension and resolve
    const cleanPath = modulePath.replace(/\.js$/, '');
    const absPath = resolve(sourceDir, cleanPath);

    // Try .ts and .tsx
    const tsPath = absPath + '.ts';
    const tsxPath = absPath + '.tsx';

    if (!existsSync(tsPath) && !existsSync(tsxPath)) {
      toCreate.add(tsPath);
    }
  }
}

console.log(`Found ${toCreate.size} missing files to stub...`);

let created = 0;
for (const filePath of toCreate) {
  // Don't create stubs outside of src/
  if (!filePath.startsWith(srcRoot)) continue;

  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (!existsSync(filePath)) {
    writeFileSync(filePath, `// AUTO-GENERATED STUB - file not recovered from source map\nexport {};\nexport const __stub = true;\n`);
    created++;
    console.log(`  created: ${filePath.replace(srcRoot + '/', 'src/')}`);
  }
}

console.log(`\nDone! Created ${created} stub files.`);
