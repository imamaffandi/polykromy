import { useCallback, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { WorldStage } from '../../gl/WorldStage'
import { CHAPTERS } from '../../content/site'
import { emit, siteStore } from '../../lib/siteStore'
import { prefersReducedMotion } from '../../lib/env'
import {
  applyHeroFraming,
  buildOverlayTimeline,
  buildSceneTimeline,
  createStoryState,
  FOCUS_AT,
  STORY_UNITS,
} from '../../story/storyTimeline'
import { Hero } from '../Hero'
import { StoryChapter } from './StoryChapter'
import { ProcessRail } from './ProcessRail'
import { StoryHud } from './StoryHud'

/**
 * The scroll-driven 3D story (chapters A S C D F L). One sticky viewport holds
 * the canvas and every chapter's copy; a single scrubbed ScrollTrigger drives
 * both the scene state and the HTML from one master timeline.
 */
export function Story() {
  const root = useRef(null)
  const pinsRef = useRef([])
  const trigger = useRef(null)
  const [state] = useState(createStoryState)
  const [isStatic] = useState(prefersReducedMotion)
  const [focus, setFocus] = useState(-1)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ narrow: '(max-width: 767px)', motion: '(prefers-reduced-motion: no-preference)' }, ({ conditions }) => {
        // static mode is chosen at mount; its DOM has no HUD or motion layout to animate
        if (!conditions.motion || isStatic) return
        const { narrow } = conditions
        applyHeroFraming(state, narrow)

        const master = gsap.timeline()
        master.add(buildSceneTimeline(state, { narrow }), 0)
        master.add(buildOverlayTimeline(root.current, { narrow }), 0)

        const setChapter = (progress) => {
          const i = Math.min(STORY_UNITS - 1, Math.floor(progress * STORY_UNITS))
          siteStore.set({ section: CHAPTERS[i].id })
        }
        trigger.current = ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
          animation: master,
          onUpdate: (self) => setChapter(self.progress),
          onToggle: (self) => self.isActive && setChapter(self.progress),
        })
        return () => {
          trigger.current = null
        }
      })
    },
    { scope: root },
  )

  const flyTo = useCallback((i) => {
    const st = trigger.current
    if (!st) return
    const y = st.start + ((st.end - st.start) * FOCUS_AT[i]) / STORY_UNITS
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [])

  const onFocus = useCallback((i) => {
    setFocus(i)
    if (i >= 0) emit('hotspot', { index: i })
  }, [])

  return (
    <section className={`story${isStatic ? ' is-static' : ''}`} id="top" ref={root} aria-label="The Polykromy story">
      {!isStatic &&
        CHAPTERS.slice(1).map((c, i) => (
          <span
            key={c.id}
            className="story__anchor"
            id={`story-${c.id}`}
            style={{ '--at': (i + 1.35) / STORY_UNITS }}
          />
        ))}

      <div className="story__sticky">
        <WorldStage state={state} pinsRef={pinsRef} onFocus={onFocus} isStatic={isStatic} />
        <Hero />
        <div className="story__chapters">
          {CHAPTERS.slice(1).map((c, i) => (
            <StoryChapter
              key={c.id}
              chapter={c}
              index={i + 1}
              align={i % 2 ? 'right' : 'left'}
              anchorId={isStatic ? `story-${c.id}` : undefined}
            />
          ))}
        </div>
        <ProcessRail focus={focus} pinsRef={pinsRef} onSelect={flyTo} isStatic={isStatic} />
        {!isStatic && <StoryHud />}
        <div className="story__wipe story__wipe--rim" aria-hidden="true" />
        <div className="story__wipe" aria-hidden="true" />
      </div>
    </section>
  )
}
