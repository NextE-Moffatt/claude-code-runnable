// Runtime mock for bun: protocol and internal Anthropic packages
// Uses Proxy to satisfy any named import without throwing

// MACRO: build-time constant injection (replaced at bundle time by Bun)
export const MACRO = {
  VERSION: '2.1.88',
  ISSUES_EXPLAINER: 'report the issue at https://github.com/anthropics/claude-code/issues',
  VERSION_CHANGELOG: '',
};
// Make MACRO available as a bare global for files that use it without importing
globalThis.MACRO = MACRO;

// feature: Bun's bundle-time feature flags (called as a function: feature('FLAG_NAME'))
export const feature = () => false;

// bun:ffi stubs
export const dlopen = () => { throw new Error('bun:ffi not available in Node.js'); };
export const CString = String;
export const ptr = () => 0;
export const toArrayBuffer = () => new ArrayBuffer(0);
export const FFIType = {};

// --- Generic stubs for all other packages routed here ---
// A no-op class factory that can be instantiated and has any property accessed
function makeStubClass(name) {
  return class StubClass {
    constructor(...args) {}
    static get [Symbol.hasInstance]() { return () => false; }
  };
}

const stubProxy = new Proxy({}, {
  get(_, key) {
    if (key === '__esModule' || key === 'default') return stubProxy;
    if (key === Symbol.toPrimitive) return () => '[Stub]';
    if (key === Symbol.iterator) return function*() {};
    // Return a proxy for nested access, callable, and instantiable
    const fn = new Proxy(function() {}, {
      get(__, k) { return stubProxy; },
      apply() { return stubProxy; },
      construct() { return stubProxy; },
    });
    return fn;
  },
  apply() { return stubProxy; },
  construct() { return stubProxy; },
});

// Named exports that code commonly destructures from mocked packages
export const SandboxManager = makeStubClass('SandboxManager');
export const SandboxError = makeStubClass('SandboxError');
export const createSandbox = () => stubProxy;
export const MCPBClient = makeStubClass('MCPBClient');
export const BedrockSDK = stubProxy;
export const FoundrySDK = stubProxy;
export const AgentSDK = stubProxy;

// computer-use stubs
export const createComputerUseClient = () => stubProxy;
export const ComputerUseMCP = makeStubClass('ComputerUseMCP');
export const sentinelApps = [];
export const getInput = () => stubProxy;

// NAPI stubs
export const captureAudio = () => { throw new Error('audio-capture-napi not available'); };
export const processImage = () => { throw new Error('image-processor-napi not available'); };
export const diffColors = () => [];
export const openUrl = () => {};

export default stubProxy;
