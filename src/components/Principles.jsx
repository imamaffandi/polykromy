import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

const ROWS = [
  {
    word: 'Experimentation',
    body: 'We try the strange version first. Ideas start as rough prototypes and earn their polish.',
  },
  {
    word: 'Thoughtful design',
    body: 'Every world and wearable is built with intent, from the first sketch to the final detail.',
  },
  {
    word: 'Passion for play',
    body: 'We make what we want to play ourselves, then test it with players until it clicks.',
  },
]

export function Principles() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.principle').forEach((row) => {
          gsap.from(row.querySelector('.principle__word'), {
            xPercent: -8,
            autoAlpha: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: { trigger: row, start: 'top 85%' },
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="principles" id="studio" ref={root}>
      <h2 className="sr-only">How we work</h2>
      {ROWS.map(({ word, body }, i) => (
        <article className="principle" key={word}>
          <span className="principle__key mono">{String.fromCharCode(65 + i)}</span>
          <h3 className="principle__word">{word}</h3>
          <p className="principle__body">{body}</p>
        </article>
      ))}
    </section>
  )
}
