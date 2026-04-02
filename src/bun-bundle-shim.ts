// Shim for bun:bundle at Bun runtime
// At build time, MACRO is injected by Bun bundler; at runtime we provide it here.

export const MACRO: {
  VERSION: string
  ISSUES_EXPLAINER: string
  VERSION_CHANGELOG: string
} = (globalThis as any).MACRO ?? {
  VERSION: '2.1.88',
  ISSUES_EXPLAINER:
    'report the issue at https://github.com/anthropics/claude-code/issues',
  VERSION_CHANGELOG: '',
}

export function feature(_name: string): boolean {
  return false
}
