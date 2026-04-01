// ESM loader:
// 1. Intercepts bun: protocol -> bun-mock.mjs
// 2. Patches React CJS module to add useEffectEvent and other React 19 APIs

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const bunMockUrl = new URL('./bun-mock.mjs', import.meta.url).href;

// Detect the react main entry path (CJS)
let reactMainPath = null;
try {
  const { createRequire } = await import('module');
  const req = createRequire(import.meta.url);
  reactMainPath = req.resolve('react');
} catch {}
const reactMainUrl = reactMainPath ? `file://${reactMainPath}` : null;

const REACT_POLYFILL = `
// --- React 19 API Polyfills (injected by bun-loader) ---
exports.useEffectEvent = function useEffectEvent(fn) {
  var ref = exports.useRef(fn);
  exports.useInsertionEffect(function() { ref.current = fn; });
  return exports.useCallback(function() { return ref.current.apply(this, arguments); }, []);
};
exports.use = function use(resource) {
  if (resource && typeof resource.then === 'function') throw resource;
  return resource;
};
`;

export function resolve(specifier, context, nextResolve) {
  if (specifier === 'bun:bundle' || specifier === 'bun:ffi') {
    return { shortCircuit: true, url: bunMockUrl };
  }
  return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
  // Handle .md files imported as modules
  if (url.endsWith('.md.ts') || (url.endsWith('.md') && !url.includes('/node_modules/'))) {
    return {
      shortCircuit: true,
      format: 'module',
      source: `export default ''; // stub for markdown file`,
    };
  }

  // Patch the React main CJS entry to add missing APIs
  if (reactMainUrl && url === reactMainUrl) {
    const original = readFileSync(fileURLToPath(url), 'utf8');
    return {
      shortCircuit: true,
      format: 'commonjs',
      source: original + REACT_POLYFILL,
    };
  }

  return nextLoad(url, context);
}
