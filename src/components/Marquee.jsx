import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mark } from './Mark'

const PHRASES = ['Different ideas', 'Distinctive worlds', 'Endless possibilities']

function Run() {
  return (
    <div className="marquee__run">
      {PHRASES.map((p) => (
        <span className="marquee__item" key={p}>
          {p}
          <Mark className="marquee__mark" title="" />
        </span>
      ))}
    </div>
  )
}

export function Marquee() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const loop = gsap.to('.marquee__track', { xPercent: -50, ease: 'none', duration: 26, repeat: -1 })
        // scroll direction steers the band, scroll speed briefly boosts it
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const boost = gsap.utils.clamp(1, 5, Math.abs(self.getVelocity()) / 300)
            gsap.to(loop, { timeScale: self.direction * boost, duration: 0.2, overwrite: true })
            gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.2, ease: 'power2.out' })
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="marquee" ref={root} aria-label="Different ideas. Distinctive worlds. Endless possibilities.">
      <div className="marquee__track" aria-hidden="true">
        <Run />
        <Run />
      </div>
    </section>
  )
}
