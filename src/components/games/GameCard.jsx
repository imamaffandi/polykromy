import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from '@phosphor-icons/react'
import { PixelImage } from './PixelImage'
import { emit } from '../../lib/siteStore'
import { hasFinePointer } from '../../lib/env'

/**
 * One game. Key art by default; hovering the frame (or pressing the button)
 * crossfades to real gameplay footage. Hover previews stop on leave, a
 * button press keeps playing until pressed again.
 */
export function GameCard({ game, index, total, pixRef }) {
  const video = useRef(null)
  const pix = useRef(null)
  const [hovering, setHovering] = useState(false)
  const [locked, setLocked] = useState(false)
  const playing = hovering || locked

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing])

  const setPix = (handle) => {
    pix.current = handle
    pixRef(handle)
  }

  const onEnter = () => {
    if (!hasFinePointer()) return
    pix.current?.glitch()
    setHovering(true)
    emit('game', { title: game.title })
  }

  const toggle = () => {
    setLocked((l) => !l)
    if (!locked) emit('game', { title: game.title })
  }

  return (
    <article className="game" aria-labelledby={`game-${game.id}`}>
      <div className="game__copy">
        <p className="game__meta mono">
          <span>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span>[ {game.genre} ]</span>
        </p>
        <h3 className="game__title" id={`game-${game.id}`}>
          {game.title}
        </h3>
        <p className="game__subtitle mono">{game.subtitle}</p>
        <p className="game__body">{game.body}</p>
        <button className="btn btn--sun" type="button" onClick={toggle} aria-pressed={locked} data-magnetic>
          {locked ? (
            <Pause size={18} weight="fill" aria-hidden="true" />
          ) : (
            <Play size={18} weight="fill" aria-hidden="true" />
          )}
          <span className="btn__label">{locked ? 'Pause gameplay' : 'Play gameplay'}</span>
        </button>
      </div>

      <figure
        className={`game__media${playing ? ' is-playing' : ''}`}
        onPointerEnter={onEnter}
        onPointerLeave={() => setHovering(false)}
        data-cursor={playing ? 'Playing' : 'Play'}
      >
        <PixelImage ref={setPix} src={game.wide} alt={game.art} width={1600} height={900} />
        <video
          ref={video}
          className="game__video"
          src={game.clip}
          poster={game.wide}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`${game.title} gameplay footage`}
        />
        <figcaption className="game__caption mono">
          <span className="game__rec" aria-hidden="true" />
          {playing ? 'Gameplay footage' : game.alt}
        </figcaption>
      </figure>

      <img className="game__square" src={game.square} alt="" width={900} height={900} loading="lazy" decoding="async" />
    </article>
  )
}
