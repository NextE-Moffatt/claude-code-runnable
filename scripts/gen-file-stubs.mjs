#!/usr/bin/env node
// Scans all source files to find imports from stub files (files with only "export {}"),
// then upgrades those stubs to export the correct named symbols.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(__dirname, '../src');

const STUB_CONTENT = '// AUTO-GENERATED STUB - file not recovered from source map\nexport {};\nexport const __stub = true;\n';

// Find all stub files
function findStubFiles(dir, stubs = new Set()) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { findStubFiles(full, stubs); continue; }
    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
    const content = readFileSync(full, 'utf8');
    if (content === STUB_CONTENT) stubs.add(full);
  }
  return stubs;
}

// Scan all source files and collect: for each stub file, what names are imported from it
function collectImports(srcRoot, stubFiles) {
  // Map: stubFilePath -> Set of exported names needed
  const needed = new Map();
  for (const f of stubFiles) needed.set(f, new Set());

  function scanFile(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const fileDir = dirname(filePath);

    const importRe = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s*['"]([^'"]+)['"]/gs;
    let m;
    while ((m = importRe.exec(content)) !== null) {
      const specifier = m[2];
      if (!specifier.startsWith('.')) continue;

      // Resolve the specifier to an absolute path
      const resolvedBase = resolve(fileDir, specifier.replace(/\.js$/, ''));
      const candidates = [
        resolvedBase + '.ts',
        resolvedBase + '.tsx',
        join(resolvedBase, 'index.ts'),
        join(resolvedBase, 'index.tsx'),
      ];

      let stubPath = null;
      for (const c of candidates) {
        if (needed.has(c)) { stubPath = c; break; }
      }
      if (!stubPath) continue;

      const names = needed.get(stubPath);
      m[1].split(',').forEach(part => {
        const name = part.trim()
          .replace(/^type\s+/, '')
          .replace(/\s+as\s+\w+/, '')
          .trim();
        if (name && /^[a-zA-Z_$]/.test(name)) {
          names.add(name);
        }
      });
    }
  }

  function walkSrc(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { walkSrc(full); continue; }
      if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) scanFile(full);
    }
  }
  walkSrc(srcRoot);
  return needed;
}

// Generate a proper stub with all needed exports
function generateStub(filePath, names) {
  const lines = [
    '// AUTO-GENERATED STUB - file not recovered from source map',
    '// Exports all symbols referenced by importing files',
    '',
  ];

  for (const name of [...names].sort()) {
    if (/^[A-Z]/.test(name)) {
      // Likely a class or type
      lines.push(`export class ${name} { constructor(..._args: any[]) {} }`);
    } else {
      lines.push(`export const ${name} = undefined as any;`);
    }
  }

  lines.push('');
  lines.push('export default {} as any;');
  return lines.join('\n') + '\n';
}

console.log('Finding stub files...');
const stubs = findStubFiles(srcRoot);
console.log(`Found ${stubs.size} stub files\n`);

console.log('Scanning imports...');
const needed = collectImports(srcRoot, stubs);

let upgraded = 0;
for (const [stubPath, names] of needed) {
  if (names.size === 0) continue;
  const content = generateStub(stubPath, names);
  writeFileSync(stubPath, content);
  console.log(`  upgraded: ${relative(srcRoot, stubPath)} (${[...names].join(', ')})`);
  upgraded++;
}

console.log(`\nUpgraded ${upgraded} stub files.`);
