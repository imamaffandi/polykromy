import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowDownRight, ArrowUpRight } from '@phosphor-icons/react'
import { HeroMark } from '../gl/HeroMark'
import { useFitText } from '../hooks/useFitText'

const WORD = 'POLYKROMY'

export function Hero() {
  const root = useRef(null)
  const word = useRef(null)
  useFitText(word)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.1 } })
        tl.from('.hero__line > span', { yPercent: 110, stagger: 0.09 })
          .from('.hero__sub, .hero__ctas', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, '-=0.7')
          .from('.hero-mark', { clipPath: 'inset(50% 50% 50% 50%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
          .from('.hero__glyph', { yPercent: 105, stagger: 0.045, duration: 1 }, 0.25)

        // wordmark drifts apart as the hero scrolls away
        gsap.to('.hero__char', {
          yPercent: (i) => (i % 2 ? -18 : 18),
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__grid">
        <div className="hero__copy">
          <h1 className="hero__title">
            <span className="hero__line">
              <span>Different ideas.</span>
            </span>
            <span className="hero__line">
              <span>Distinctive worlds.</span>
            </span>
          </h1>
          <p className="hero__sub">
            Polykromy is an independent studio making original Roblox experiences and distinctive digital
            accessories.
          </p>
          <div className="hero__ctas">
            <a className="btn btn--solid" href="#work">
              See the work <ArrowDownRight size={18} weight="bold" />
            </a>
            <a className="btn btn--line" href="#contact">
              Contact <ArrowUpRight size={18} weight="bold" />
            </a>
          </div>
        </div>
        <HeroMark />
      </div>
      <div className="hero__word" aria-hidden="true">
        <span ref={word} className="hero__word-inner">
          {WORD.split('').map((c, i) => (
            <span className="hero__char" key={i}>
              <span className="hero__glyph">{c}</span>
            </span>
          ))}
        </span>
      </div>
    </section>
  )
}
