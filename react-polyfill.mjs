// Re-export everything from React 18, plus polyfill missing React 19 APIs
import React from 'react';

export const {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} = React;

// React 19 / experimental APIs — polyfill with React 18 equivalents

/** useEffectEvent: stable ref wrapper (React 19 API) */
export function useEffectEvent(fn) {
  const ref = useRef(fn);
  useInsertionEffect(() => { ref.current = fn; });
  return useCallback((...args) => ref.current(...args), []);
}

/** use: simplified polyfill (React 19 API) */
export function use(resource) {
  if (resource && typeof resource.then === 'function') {
    throw resource; // Suspense-compatible
  }
  if (resource && typeof resource[Symbol.iterator] === 'function') {
    return resource;
  }
  return resource;
}

export default React;
