import { useSyncExternalStore } from 'react'

/**
 * Tiny external store for state that many parts of the page read but that
 * changes rarely: the active section, loader readiness and the companion's
 * one-off events. Per-frame values (scroll progress, camera) never go here.
 */
const state = {
  section: 'arrive',
  loadProgress: 0, // 3D kit download, 0..1
  worldReady: false, // island built (or failed; never blocks the loader)
  ready: false, // loader finished, intro may play
}
const listeners = new Set()

const emitChange = () => listeners.forEach((l) => l())

export const siteStore = {
  set(patch) {
    let changed = false
    for (const k in patch) {
      if (state[k] !== patch[k]) {
        state[k] = patch[k]
        changed = true
      }
    }
    if (changed) emitChange()
  },
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export function useSiteValue(key) {
  return useSyncExternalStore(siteStore.subscribe, () => state[key])
}

/* ---- companion event bus: interactions the guide can react to ---- */

const busListeners = new Set()

/** Fire-and-forget event, e.g. emit('hotspot', { id: 'model' }) */
export function emit(type, detail = {}) {
  busListeners.forEach((l) => l(type, detail))
}

export function onEmit(listener) {
  busListeners.add(listener)
  return () => busListeners.delete(listener)
}
