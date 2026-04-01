// Stub declarations for Bun-specific modules (not available in Node.js)
// These allow TypeScript to compile without errors when targeting Node.js

declare module 'bun:bundle' {
  export const MACRO: any;
  export default any;
}

declare module 'bun:ffi' {
  export const dlopen: any;
  export const CString: any;
  export const ptr: any;
  export const toArrayBuffer: any;
  export const FFIType: any;
  export default any;
}
