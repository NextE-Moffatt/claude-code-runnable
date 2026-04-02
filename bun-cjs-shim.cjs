// Preload shim: patches Node.js CJS require to intercept 'bun:bundle'
// This is needed because files loaded via createRequire() bypass bun-loader.mjs
const Module = require('module')
const path = require('path')

const bunMockPath = path.resolve(__dirname, 'bun-mock-cjs.cjs')

const originalResolveFilename = Module._resolveFilename.bind(Module)
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'bun:bundle') {
    return bunMockPath
  }
  return originalResolveFilename(request, parent, isMain, options)
}

// Also set globalThis.MACRO for files that use it as a bare global
globalThis.MACRO = {
  VERSION: '2.1.88',
  ISSUES_EXPLAINER: 'report the issue at https://github.com/anthropics/claude-code/issues',
  VERSION_CHANGELOG: '',
}

// Support require() for .txt files (Bun supports this natively, Node.js does not)
const fs = require('fs')
Module._extensions['.txt'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8')
  module.exports = content
}

// Support require() for .md files too (same reason)
Module._extensions['.md'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8')
  module.exports = content
}
