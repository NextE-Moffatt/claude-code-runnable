#!/usr/bin/env node
// Scans source files to find all named imports from mocked packages,
// then generates real node_modules stub packages with matching exports.

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcRoot = join(root, 'src');
const nmRoot = join(root, 'node_modules');

// Packages to stub (these aren't on npm or need runtime mocks)
const STUB_PACKAGES = [
  '@ant/claude-for-chrome-mcp',
  '@ant/computer-use-input',
  '@ant/computer-use-mcp',
  '@ant/computer-use-swift',
  '@anthropic-ai/mcpb',
  '@anthropic-ai/sandbox-runtime',
  '@anthropic-ai/foundry-sdk',
  '@anthropic-ai/claude-agent-sdk',
  'audio-capture-napi',
  'image-processor-napi',
  'color-diff-napi',
  'url-handler-napi',
  'react/compiler-runtime',
];

// Scan all .ts/.tsx source files and collect named imports from a given package
function scanImports(pkg) {
  const exports = new Set(['default']);

  function scanDir(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        scanDir(full);
        continue;
      }
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;

      let src;
      try { src = readFileSync(full, 'utf8'); } catch { continue; }

      // Collect all import blocks that reference this package
      // Handle multiline: import {\n  Foo,\n  Bar\n} from 'pkg'
      const importRe = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s*['"]([^'"]+)['"]/gs;
      let m;
      while ((m = importRe.exec(src)) !== null) {
        if (m[2] !== pkg) continue;
        m[1].split(',').forEach(part => {
          // Handle "Foo as Bar" and "type Foo"
          const name = part.trim()
            .replace(/^type\s+/, '')
            .replace(/\s+as\s+\w+/, '')
            .trim();
          if (name && /^[a-zA-Z_$]/.test(name)) {
            exports.add(name);
          }
        });
      }
    }
  }

  scanDir(srcRoot);
  return exports;
}

// Generate stub module source
function genStubModule(pkg, namedExports) {
  const lines = [
    `// AUTO-GENERATED STUB for ${pkg}`,
    `// This package is internal to Anthropic and not publicly available.`,
    ``,
  ];

  for (const name of namedExports) {
    if (name === 'default') continue;
    const isAllCaps = /^[A-Z][A-Z0-9_]+$/.test(name);  // ALL_CAPS = constant
    const isPascal = /^[A-Z][a-zA-Z0-9]*$/.test(name); // PascalCase = class
    if (isAllCaps) {
      // Likely a constant array, object, or string
      lines.push(`export const ${name} = [];`);
    } else if (isPascal) {
      lines.push(`export class ${name} {`);
      lines.push(`  constructor(...args) {}`);
      lines.push(`}`);
    } else {
      lines.push(`export const ${name} = undefined;`);
    }
  }

  lines.push(``);
  lines.push(`const _default = {};`);
  lines.push(`export default _default;`);

  return lines.join('\n') + '\n';
}

// Create a stub package in node_modules
function createStubPackage(pkg, namedExports) {
  const pkgDir = join(nmRoot, pkg);
  mkdirSync(pkgDir, { recursive: true });

  const source = genStubModule(pkg, namedExports);

  // Write package.json
  const pkgName = pkg.replace(/\//g, '-');
  writeFileSync(join(pkgDir, 'package.json'), JSON.stringify({
    name: pkg,
    version: '0.0.0-stub',
    type: 'module',
    main: 'index.mjs',
    exports: { '.': './index.mjs', './*': './index.mjs' },
  }, null, 2) + '\n');

  // Write index.mjs
  writeFileSync(join(pkgDir, 'index.mjs'), source);

  console.log(`  stubbed: ${pkg} (${[...namedExports].filter(e => e !== 'default').join(', ') || 'default only'})`);
}

console.log('Scanning imports and generating package stubs...\n');

for (const pkg of STUB_PACKAGES) {
  // Skip react/compiler-runtime (needs different handling)
  if (pkg === 'react/compiler-runtime') continue;

  const namedExports = scanImports(pkg);
  createStubPackage(pkg, namedExports);
}

// Special: react/compiler-runtime - create as a file inside react package
const reactCompilerDir = join(nmRoot, 'react');
writeFileSync(join(reactCompilerDir, 'compiler-runtime.mjs'), [
  '// Stub for React compiler runtime',
  'export const c = (count, fn) => fn();',
  'export default { c };',
].join('\n') + '\n');

// Patch react package.json exports to include compiler-runtime
const reactPkgPath = join(reactCompilerDir, 'package.json');
const reactPkg = JSON.parse(readFileSync(reactPkgPath, 'utf8'));
if (!reactPkg.exports['./compiler-runtime']) {
  reactPkg.exports['./compiler-runtime'] = './compiler-runtime.mjs';
  writeFileSync(reactPkgPath, JSON.stringify(reactPkg, null, 2) + '\n');
  console.log('  patched: react/compiler-runtime export');
}

console.log('\nDone!');
