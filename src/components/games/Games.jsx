import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { GAMES } from '../../content/site'
import { useSectionTracker } from '../../hooks/useSectionTracker'
import { GameCard } from './GameCard'

/**
 * Picks up where the story's ink iris leaves off. On wide screens the section
 * pins and the games slide past horizontally; on phones they simply stack.
 */
export function Games() {
  const root = useRef(null)
  const track = useRef(null)
  const pix = useRef([])
  useSectionTracker(root, 'games')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const cards = gsap.utils.toArray('.game')

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => track.current.scrollWidth - window.innerWidth
        const slide = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })

        cards.forEach((card, i) => {
          ScrollTrigger.create({
            trigger: card,
            containerAnimation: slide,
            start: 'left 80%',
            once: true,
            onEnter: () => pix.current[i]?.resolve(),
          })
          // the square art drifts at a different depth than the frame
          gsap.fromTo(
            card.querySelector('.game__square'),
            { xPercent: 40, rotate: 6 },
            {
              xPercent: -40,
              rotate: -4,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: slide,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          )
          gsap.from(card.querySelector('.game__title'), {
            yPercent: 60,
            autoAlpha: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: slide,
              start: 'left 70%',
              end: 'left 30%',
              scrub: true,
            },
          })
        })
      })

      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        cards.forEach((card, i) => {
          ScrollTrigger.create({
            trigger: card.querySelector('.game__media'),
            start: 'top 80%',
            once: true,
            onEnter: () => pix.current[i]?.resolve(),
          })
          gsap.fromTo(
            card.querySelector('.game__square'),
            { yPercent: 25 },
            {
              yPercent: -25,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="games" id="games" ref={root} data-ink>
      <div className="games__track" ref={track}>
        <header className="games__head">
          <p className="mono">[ Worlds you can play ]</p>
          <h2 className="games__title">
            Four worlds
            <br />
            Four moods
          </h2>
          <p className="games__lede">
            From floating islands to haunted mountains. Hover a frame or press play to watch real gameplay.
          </p>
          <p className="games__hint mono" aria-hidden="true">
            Keep scrolling <span>&rarr;</span>
          </p>
        </header>
        {GAMES.map((g, i) => (
          <GameCard key={g.id} game={g} index={i} total={GAMES.length} pixRef={(h) => (pix.current[i] = h)} />
        ))}
      </div>
    </section>
  )
}
