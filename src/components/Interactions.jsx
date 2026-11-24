import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { hasFinePointer, prefersReducedMotion } from '../lib/env'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/'

/** Re-types an element's text through random glyphs, left to right. */
function scramble(el) {
  if (el.dataset.scrambling) return
  const original = el.dataset.text || el.textContent
  el.dataset.text = original
  el.dataset.scrambling = '1'
  const state = { p: 0 }
  gsap.to(state, {
    p: 1,
    duration: 0.45,
    ease: 'none',
    onUpdate: () => {
      const settled = Math.floor(state.p * original.length)
      el.textContent = original
        .split('')
        .map((ch, i) => (i < settled || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join('')
    },
    onComplete: () => {
      el.textContent = original
      delete el.dataset.scrambling
    },
  })
}

/**
 * Site-wide pointer layer: custom cursor with contextual labels, magnetic
 * buttons and scramble-on-hover text. Mounted once; uses delegated listeners,
 * so components only opt in with data attributes (data-cursor, data-magnetic,
 * data-scramble). Disabled entirely on touch and with reduced motion.
 */
export function Interactions() {
  const cursor = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return
    const el = cursor.current
    document.documentElement.classList.add('has-cursor')

    const xTo = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3' })
    let magnet = null
    let hovered = null

    const setTarget = (target) => {
      if (target === hovered) return
      hovered = target
      const text = target?.closest('[data-cursor]')?.dataset.cursor
      const interactive = target?.closest('a, button, [data-cursor]')
      el.classList.toggle('is-active', Boolean(interactive))
      el.classList.toggle('has-label', Boolean(text))
      el.classList.toggle('on-ink', Boolean(target?.closest('[data-ink]')))
      label.current.textContent = text || ''
    }

    const onMove = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
      setTarget(e.target)
      if (magnet) {
        const r = magnet.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        gsap.to(magnet, { x: dx * 0.3, y: dy * 0.4, duration: 0.4, ease: 'power3' })
      }
    }

    const onOver = (e) => {
      const m = e.target.closest?.('[data-magnetic]')
      if (m && m !== magnet) magnet = m
      const s = e.target.closest?.('[data-scramble]')
      if (s) scramble(s)
    }

    const onOut = (e) => {
      const m = e.target.closest?.('[data-magnetic]')
      if (m && !m.contains(e.relatedTarget)) {
        gsap.to(m, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
        if (magnet === m) magnet = null
      }
    }

    const onDown = () => el.classList.add('is-down')
    const onUp = () => el.classList.remove('is-down')
    const onLeave = () => el.classList.add('is-hidden')
    const onEnter = () => el.classList.remove('is-hidden')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.documentElement.addEventListener('pointerenter', onEnter)

    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.documentElement.removeEventListener('pointerenter', onEnter)
    }
  }, [])

  return (
    <div className="cursor" ref={cursor} aria-hidden="true">
      <span className="cursor__ring" />
      <span className="cursor__label mono" ref={label} />
    </div>
  )
}
