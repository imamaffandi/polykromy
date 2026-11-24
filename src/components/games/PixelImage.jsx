import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../../lib/env'

/**
 * An <img> with a canvas twin that can "de-res" it into chunky pixels.
 * `resolve()` sharpens from big blocks to the full image (the entrance);
 * `glitch()` is a short crunch-and-recover used as hover feedback.
 * The real <img> is always in the DOM for accessibility and no-JS.
 */
export const PixelImage = forwardRef(function PixelImage({ src, alt, width, height, className = '' }, ref) {
  const img = useRef(null)
  const canvas = useRef(null)
  const tween = useRef(null)
  const block = useRef({ size: 1 })

  const draw = () => {
    const c = canvas.current
    const i = img.current
    if (!c || !i?.complete || !i.naturalWidth) return
    const { width: w, height: h } = c.getBoundingClientRect()
    if (!w || !h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (c.width !== Math.round(w * dpr)) {
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
    }
    const ctx = c.getContext('2d')
    const size = Math.max(1, block.current.size)
    const sw = Math.max(1, Math.round(c.width / (size * dpr)))
    const sh = Math.max(1, Math.round(c.height / (size * dpr)))
    // cover-fit the image into the small buffer, then blow it up unsmoothed
    const scale = Math.max(sw / i.naturalWidth, sh / i.naturalHeight)
    const dw = i.naturalWidth * scale
    const dh = i.naturalHeight * scale
    ctx.imageSmoothingEnabled = true
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.drawImage(i, (sw - dw) / 2, (sh - dh) / 2, dw, dh)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(c, 0, 0, sw, sh, 0, 0, c.width, c.height)
  }

  const run = (keyframes) => {
    tween.current?.kill()
    const c = canvas.current
    if (!c) return
    c.style.opacity = '1'
    tween.current = gsap.to(block.current, {
      keyframes,
      onUpdate: draw,
      onComplete: () => {
        c.style.opacity = '0'
      },
    })
  }

  useImperativeHandle(ref, () => ({
    resolve() {
      if (prefersReducedMotion()) return
      const go = () => {
        block.current.size = 42
        run([{ size: 1, duration: 1.1, ease: 'steps(9)' }])
      }
      const i = img.current
      if (i?.complete && i.naturalWidth) go()
      else i?.addEventListener('load', go, { once: true })
    },
    glitch() {
      if (prefersReducedMotion()) return
      run([
        { size: 14, duration: 0.12, ease: 'steps(3)' },
        { size: 1, duration: 0.35, ease: 'steps(5)' },
      ])
    },
  }))

  useEffect(() => () => tween.current?.kill(), [])

  return (
    <span className={`pximg ${className}`}>
      <img ref={img} src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      <canvas ref={canvas} aria-hidden="true" />
    </span>
  )
})
