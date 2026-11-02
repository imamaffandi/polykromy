import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Crown, Flask, GameController } from '@phosphor-icons/react'

const CELLS = [
  {
    key: 'experiences',
    tag: 'Worlds',
    title: 'Roblox experiences',
    body: 'Original interactive worlds, built from scratch and tuned with players until they feel right to play.',
    Icon: GameController,
    variant: 'ink',
  },
  {
    key: 'accessories',
    tag: 'Wearables',
    title: 'Digital accessories',
    body: 'Wearable designs for avatars. Clear silhouettes and bold forms that stand out in a crowded server.',
    Icon: Crown,
    variant: 'stripe',
  },
  {
    key: 'experiments',
    tag: 'Lab',
    title: 'Experiments',
    body: 'Prototypes, odd mechanics and side projects. Where the next idea gets tested before it ships.',
    Icon: Flask,
    variant: 'dots',
  },
]

export function Work() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.work__title', {
          yPercent: 100,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.work__head', start: 'top 80%' },
        })
        gsap.from('.cell', {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1.1,
          ease: 'expo.inOut',
          stagger: 0.12,
          scrollTrigger: { trigger: '.work__grid', start: 'top 75%' },
        })
        gsap.from('.cell__icon', {
          rotate: -25,
          scale: 0.6,
          duration: 1.2,
          ease: 'back.out(2)',
          stagger: 0.12,
          scrollTrigger: { trigger: '.work__grid', start: 'top 70%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="work" id="work" ref={root}>
      <div className="work__head">
        <h2 className="work__heading">
          <span className="work__title">Worlds you play in. Things you wear.</span>
        </h2>
      </div>
      <div className="work__grid">
        {CELLS.map(({ key, tag, title, body, Icon, variant }) => (
          <article key={key} className={`cell cell--${variant} cell--${key}`}>
            <div className="cell__top mono">
              <span>[ {tag} ]</span>
            </div>
            <Icon className="cell__icon" weight="thin" aria-hidden="true" />
            <div className="cell__body">
              <h3 className="cell__title">{title}</h3>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
