// CJS mock for bun:bundle - used when files are loaded via require() (CJS path)
const MACRO = {
  VERSION: '2.1.88',
  ISSUES_EXPLAINER: 'report the issue at https://github.com/anthropics/claude-code/issues',
  VERSION_CHANGELOG: '',
}

function feature(name) {
  return false
}

module.exports = { feature, MACRO }
