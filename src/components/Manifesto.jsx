import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

const TEXT =
  'Our goal is simple: to make things that feel different, spark curiosity, and give players something worth remembering.'
const STRONG = new Set(['different,', 'curiosity,', 'remembering.'])

export function Manifesto() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // words ink in as the reader reaches them
        gsap.fromTo(
          '.manifesto__word',
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
          },
        )
      })
    },
    { scope: root },
  )

  return (
    <section className="manifesto" ref={root}>
      <p className="manifesto__label mono">[ Our goal ]</p>
      <p className="manifesto__text">
        {TEXT.split(' ').map((w, i) => (
          <span key={i}>
            <span className={`manifesto__word${STRONG.has(w) ? ' is-strong' : ''}`}>{w}</span>{' '}
          </span>
        ))}
      </p>
    </section>
  )
}
