import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowDownRight, ArrowUpRight } from '@phosphor-icons/react'
import { useFitText } from '../hooks/useFitText'
import { useSiteValue } from '../lib/siteStore'
import { MOTION_OK } from '../lib/env'
import { PixelText } from './PixelText'

const WORD = 'POLYKROMY'

/** Chapter A. Lives inside the story's sticky viewport, over the 3D mark. */
export function Hero() {
  const root = useRef(null)
  const word = useRef(null)
  const intro = useRef(null)
  const ready = useSiteValue('ready')
  useFitText(word)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        intro.current = gsap
          .timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1.1 } })
          .from('.hero__line > span', { yPercent: 112, stagger: 0.09 })
          .from('.hero__kicker', { autoAlpha: 0, x: -16, duration: 0.8 }, 0.1)
          .from('.hero__sub, .hero__ctas', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.35)
          .from('.hero__glyph', { yPercent: 105, stagger: 0.045, duration: 1 }, 0.2)
          .from('.hero__cue > *', { autoAlpha: 0, x: 12, stagger: 0.1, duration: 0.6 }, 0.9)
        return () => {
          intro.current = null
        }
      })
    },
    { scope: root },
  )

  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])

  return (
    <div className="hero" ref={root}>
      <div className="hero__copy">
        <p className="hero__kicker mono">[ Independent game studio / Roblox ]</p>
        <h1 className="hero__title">
          <span className="hero__line">
            <span>
              <PixelText>Different ideas.</PixelText>
            </span>
          </span>
          <span className="hero__line">
            <span>
              <PixelText>Distinctive worlds.</PixelText>
            </span>
          </span>
        </h1>
        <p className="hero__sub">
          Polykromy is an independent studio making original Roblox experiences and distinctive digital accessories.
        </p>
        <div className="hero__ctas">
          <a className="btn btn--solid" href="#games" data-magnetic data-cursor="Play">
            <span className="btn__label">See the games</span>
            <ArrowDownRight size={18} weight="bold" aria-hidden="true" />
          </a>
          <a className="btn btn--line" href="#contact" data-magnetic>
            <span className="btn__label">Contact</span>
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </a>
        </div>
      </div>

      <a className="hero__cue mono" href="#story-scatter">
        <span className="hero__cue-pixels" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>Scroll to build a world</span>
      </a>

      <div className="hero__word" aria-hidden="true">
        <span ref={word} className="hero__word-inner">
          {WORD.split('').map((c, i) => (
            <span className="hero__char" key={i}>
              <span className="hero__glyph">{c}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
