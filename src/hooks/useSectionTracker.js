import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { siteStore } from '../lib/siteStore'

/**
 * Marks `id` as the active section while the element crosses the viewport centre.
 * Runs after layout effects, so if the section is pinned its pin-spacer already
 * exists; tracking the spacer covers the whole pinned scroll distance.
 */
export function useSectionTracker(ref, id) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const parent = el.parentElement
    const target = parent?.classList.contains('pin-spacer') ? parent : el
    const st = ScrollTrigger.create({
      trigger: target,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && siteStore.set({ section: id }),
    })
    return () => st.kill()
  }, [ref, id])
}
