import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionTracker } from '../hooks/useSectionTracker'
import { MOTION_OK } from '../lib/env'

const TEXT =
  'Our goal is simple: to make things that feel different, spark curiosity, and give players something worth remembering.'
const STRONG = new Set(['different,', 'curiosity,', 'remembering.'])

export function Manifesto() {
  const root = useRef(null)
  useSectionTracker(root, 'manifesto')

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        // words ink in as the reader reaches them; key words stamp in
        gsap.fromTo(
          '.manifesto__word',
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
          },
        )
        gsap.utils.toArray('.manifesto__word.is-strong').forEach((w) => {
          gsap.from(w, {
            scale: 1.6,
            rotate: -8,
            duration: 0.35,
            ease: 'power4.in',
            scrollTrigger: { trigger: w, start: 'top 62%', toggleActions: 'play none none reverse' },
          })
        })
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
