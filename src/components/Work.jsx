import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Crown, Flask, GameController } from '@phosphor-icons/react'
import { useSectionTracker } from '../hooks/useSectionTracker'
import { hasFinePointer, MOTION_OK } from '../lib/env'
import { PixelText } from './PixelText'

const ROWS = [
  {
    key: 'experiences',
    tag: 'Worlds',
    title: 'Roblox experiences',
    body: 'Original interactive worlds, built from scratch and tuned with players until they feel right to play.',
    Icon: GameController,
    link: { href: '#games', label: 'See the games' },
  },
  {
    key: 'accessories',
    tag: 'Wearables',
    title: 'Digital accessories',
    body: 'Wearable designs for avatars. Clear silhouettes and bold forms that stand out in a crowded server.',
    Icon: Crown,
  },
  {
    key: 'experiments',
    tag: 'Lab',
    title: 'Experiments',
    body: 'Prototypes, odd mechanics and side projects. Where the next idea gets tested before it ships.',
    Icon: Flask,
  },
]

/** Splits a title into per-letter spans for the hover wave. */
function Wave({ text }) {
  return (
    <span className="wave" aria-label={text}>
      {text.split('').map((ch, i) => (
        <span key={i} aria-hidden="true" style={{ '--i': i }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

export function Work() {
  const root = useRef(null)
  const [open, setOpen] = useState(0)
  useSectionTracker(root, 'work')

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from('.work__heading .chapter__line > span', {
          yPercent: 110,
          stagger: 0.06,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.work__head', start: 'top 80%' },
        })
        gsap.from('.row', {
          clipPath: 'inset(0% 100% 0% 0%)',
          duration: 1,
          ease: 'expo.inOut',
          stagger: 0.1,
          scrollTrigger: { trigger: '.work__rows', start: 'top 80%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="work" id="studio" ref={root}>
      <div className="work__head">
        <p className="mono">[ What we make ]</p>
        <h2 className="work__heading">
          {'Worlds you play in. Things you wear.'.split(' ').map((w, i) => (
            <span key={i}>
              <span className="chapter__line">
                <span>
                  <PixelText>{w}</PixelText>
                </span>
              </span>{' '}
            </span>
          ))}
        </h2>
      </div>

      <ul className="work__rows">
        {ROWS.map(({ key, tag, title, body, Icon, link }, i) => {
          const isOpen = open === i
          return (
            <li
              key={key}
              className={`row${isOpen ? ' is-open' : ''}`}
              onPointerEnter={() => hasFinePointer() && setOpen(i)}
            >
              <h3>
                <button
                  className="row__head"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`row-${key}`}
                  onClick={() => setOpen(i)}
                  data-cursor="Open"
                >
                  <span className="row__key mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="row__title">
                    <Wave text={title} />
                  </span>
                  <span className="row__tag mono">[ {tag} ]</span>
                </button>
              </h3>
              <div className="row__panel" id={`row-${key}`}>
                <div className="row__inner">
                  <Icon className="row__icon" weight="thin" aria-hidden="true" />
                  <p>{body}</p>
                  {link && (
                    <a className="btn btn--line btn--sm" href={link.href} data-magnetic>
                      <span className="btn__label">{link.label}</span>
                    </a>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
