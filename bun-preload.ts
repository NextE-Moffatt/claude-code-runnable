// Bun preload: set globalThis.MACRO before any module loads
// bun:bundle is replaced by src/bun-bundle-shim.ts via source-level replacement
;(globalThis as any).MACRO = {
  VERSION: '2.1.88',
  ISSUES_EXPLAINER: 'report the issue at https://github.com/anthropics/claude-code/issues',
  VERSION_CHANGELOG: '',
}
