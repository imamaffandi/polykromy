import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight, DiscordLogo } from '@phosphor-icons/react'
import { useFitText } from '../hooks/useFitText'
import { useSectionTracker } from '../hooks/useSectionTracker'
import { CHANNELS } from '../content/site'
import { MOTION_OK } from '../lib/env'

const logo = `${import.meta.env.BASE_URL}polykromy-logo.jpg`
const discord = CHANNELS.find((c) => c.label === 'Discord')

export function Footer() {
  const root = useRef(null)
  const word = useRef(null)
  useFitText(word)
  useSectionTracker(root, 'contact')

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from('.footer__glyph', {
          yPercent: 100,
          stagger: 0.03,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.footer__big', start: 'top 85%' },
        })
        gsap.from('.footer__plate', {
          rotate: -10,
          scale: 0.8,
          autoAlpha: 0,
          duration: 1,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.footer__grid', start: 'top 85%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <footer className="footer" id="contact" ref={root}>
      <div className="footer__cta">
        <p className="mono">[ Say hi ]</p>
        <h2 className="footer__ask">Got an idea or just want to play along?</h2>
        <div className="footer__ctas">
          <a className="btn btn--solid" href={discord.href} target="_blank" rel="noopener noreferrer" data-magnetic>
            <DiscordLogo size={20} weight="fill" aria-hidden="true" />
            <span className="btn__label">Join the Discord</span>
          </a>
          <a className="btn btn--line" href="#top" data-magnetic>
            <span className="btn__label">Back to the top</span>
          </a>
        </div>
        {/* Pip the Piixpal bird hops between these buttons, a nod to the bird mark */}
        <piix-pal pal="pip" on=".footer__ctas .btn" />
      </div>

      <div className="footer__big" aria-label="Endless possibilities.">
        <span ref={word} className="footer__big-inner" aria-hidden="true">
          {'Endless possibilities'.split('').map((c, i) => (
            <span className="footer__char" key={i}>
              <span className="footer__glyph">{c === ' ' ? ' ' : c}</span>
            </span>
          ))}
        </span>
      </div>

      <div className="footer__grid">
        <img
          className="footer__plate"
          src={logo}
          alt="Polykromy logo: wordmark above the purple bird mark on yellow"
          width="1254"
          height="1254"
          loading="lazy"
        />
        <p className="footer__about">
          Polykromy is an independent game development brand focused on creating original Roblox experiences and
          distinctive digital accessories.
        </p>
        <ul className="footer__links">
          {CHANNELS.map((c) => (
            <li key={c.label}>
              <a href={c.href} target="_blank" rel="noopener noreferrer" data-cursor="Visit">
                <span data-scramble>{c.label}</span>
                <ArrowUpRight size={22} weight="bold" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer__bar mono">
        <span>© {new Date().getFullYear()} Polykromy</span>
        <span>Different ideas. Distinctive worlds. Endless possibilities.</span>
      </div>
    </footer>
  )
}
