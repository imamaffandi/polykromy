import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { siteStore, useSiteValue } from '../lib/siteStore'
import { prefersReducedMotion } from '../lib/env'

const CELLS = 16
const MAX_WAIT = 5000

/**
 * "Loading world" screen: waits for the four fonts and the 3D kit, but never
 * longer than MAX_WAIT. Content underneath is already in the DOM; this only
 * covers the first paint so the intro choreography starts on a ready stage.
 */
export function Loader() {
  const root = useRef(null)
  const progress = useSiteValue('loadProgress')
  const worldReady = useSiteValue('worldReady')
  const [fontsReady, setFontsReady] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
    fonts.then(() => setFontsReady(true))
    const t = setTimeout(() => setTimedOut(true), MAX_WAIT)
    return () => clearTimeout(t)
  }, [])

  const done = (worldReady && fontsReady) || timedOut

  useEffect(() => {
    if (!done) return
    const finish = () => {
      setGone(true)
      document.documentElement.classList.remove('is-loading')
      siteStore.set({ ready: true })
      ScrollTrigger.refresh()
    }
    if (prefersReducedMotion()) return finish()
    const tl = gsap
      .timeline({ onComplete: finish })
      .to(root.current.querySelectorAll('.loader__cell'), { opacity: 1, duration: 0.01, stagger: 0.012 })
      .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut' }, '+=0.15')
    return () => tl.kill()
  }, [done])

  if (gone) return null
  const lit = Math.round(progress * CELLS)

  return (
    <div
      className="loader"
      ref={root}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      data-ink
    >
      <p className="loader__title">Loading world</p>
      <div className="loader__bar" aria-hidden="true">
        {Array.from({ length: CELLS }, (_, i) => (
          <span key={i} className="loader__cell" style={{ opacity: i < lit ? 1 : 0.15 }} />
        ))}
      </div>
      <p className="loader__pct mono">{String(Math.round(progress * 100)).padStart(3, '0')}%</p>
    </div>
  )
}
