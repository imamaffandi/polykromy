// Environment queries, evaluated lazily so they are safe during module init.

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A precise pointer that can hover: mouse or trackpad, not touch. */
export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const isNarrow = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'
