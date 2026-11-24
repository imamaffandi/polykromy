import { CHAPTERS } from '../../content/site'
import { useSiteValue } from '../../lib/siteStore'

/** Chapter index on the story's edge: a stamped letter per chapter and a progress spine. */
export function StoryHud() {
  const section = useSiteValue('section')
  const current = CHAPTERS.findIndex((c) => c.id === section)

  return (
    <nav className="hud" aria-label="Story chapters">
      <span className="hud__track" aria-hidden="true">
        <span className="hud__fill" />
      </span>
      <ol>
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <a
              href={i === 0 ? '#top' : `#story-${c.id}`}
              className={`hud__link${i === current ? ' is-current' : ''}${i < current ? ' is-past' : ''}`}
              aria-current={i === current ? 'step' : undefined}
            >
              <span className="hud__stamp" aria-hidden="true">
                {c.stamp}
              </span>
              <span className="hud__name mono">{c.name}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
