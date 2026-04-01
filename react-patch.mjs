// Patches the React singleton to add missing APIs (useEffectEvent, use)
// Must be imported before any React code runs.
// Usage: NODE_OPTIONS="--import ./react-patch.mjs --experimental-loader ./bun-loader.mjs"

import React from 'react';

// useEffectEvent: stable ref wrapper (React 19 API, polyfilled with React 18)
if (!React.useEffectEvent) {
  React.useEffectEvent = function useEffectEvent(fn) {
    const ref = React.useRef(fn);
    React.useInsertionEffect(() => { ref.current = fn; });
    return React.useCallback((...args) => ref.current(...args), []);
  };
}

// use: simplified polyfill (React 19 API)
if (!React.use) {
  React.use = function use(resource) {
    if (resource && typeof resource.then === 'function') throw resource;
    return resource;
  };
}
