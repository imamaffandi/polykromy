import { useEffect, useRef } from 'react'
import { PROCESS } from '../../content/site'

/**
 * Chapter D. Pins float over the island (positioned every frame by WorldStage
 * via `pinsRef`); the rail beside it shows the focused step's real footage.
 * Both are buttons that fly the camera to that step.
 */
export function ProcessRail({ focus, pinsRef, onSelect, isStatic }) {
  const videos = useRef([])

  // only the focused clip plays; everything else is paused and costs nothing
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return
      if (i === focus && !isStatic) {
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [focus, isStatic])

  return (
    <>
      <div className="pins">
        {PROCESS.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => (pinsRef.current[i] = el)}
            className={`pin${focus === i ? ' is-active' : ''}`}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Fly to ${p.title}`}
            data-cursor="Open"
            tabIndex={-1}
          >
            <span className="pin__dot" aria-hidden="true" />
            <span className="pin__label mono">{p.label}</span>
          </button>
        ))}
      </div>

      <aside className="process" aria-label="How a world gets made">
        <ol className="process__list">
          {PROCESS.map((p, i) => {
            const open = isStatic || focus === i
            return (
              <li key={p.id} className={`process__item${open ? ' is-open' : ''}`}>
                <button
                  className="process__head"
                  type="button"
                  aria-expanded={open}
                  aria-controls={`process-${p.id}`}
                  onClick={() => onSelect(i)}
                >
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="process__title">{p.title}</span>
                </button>
                <div className="process__panel" id={`process-${p.id}`}>
                  <div className="process__inner">
                    <video
                      ref={(el) => (videos.current[i] = el)}
                      className="process__video"
                      src={p.clip}
                      muted
                      loop
                      playsInline
                      preload="none"
                      controls={isStatic}
                      aria-label={`${p.title} footage`}
                    />
                    <p>{p.body}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </aside>
    </>
  )
}
