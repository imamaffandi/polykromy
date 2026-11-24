import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { X } from '@phosphor-icons/react'
import { loadPiixpal } from 'piixpal/load'
import { CHANNELS, NAV } from '../content/site'
import { onEmit, useSiteValue } from '../lib/siteStore'
import { hasFinePointer, isNarrow, prefersReducedMotion } from '../lib/env'

const discord = CHANNELS.find((c) => c.label === 'Discord')
const STORAGE_KEY = 'polykromy:inky'

/** What Inky says on entering a section, once per visit. Sections without a line stay quiet. */
const SECTION_LINES = {
  arrive: {
    text: "Hi, I'm Inky. Scroll and I'll show you how a Polykromy world comes together.",
    actions: [{ label: 'Skip to the games', href: '#games' }],
  },
  scatter: { text: 'Messy on purpose. Every world starts as loose pieces like these.' },
  detail: { text: 'Pick a step to fly over and watch real footage from the studio.' },
  games: { text: 'Four worlds, four moods. Press play on any of them to watch real gameplay.' },
  contact: {
    text: 'Want to say hi? The Discord is the quickest way to reach the team.',
    actions: [{ label: 'Open Discord', href: discord.href, external: true }],
  },
}

/** Sides Inky docks to, chosen so it never sits on that section's copy. */
const LEFT_SECTIONS = new Set(['detail', 'games', 'contact'])
const INK_SECTIONS = new Set(['games'])

const readPref = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}
const writePref = (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, v)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable: preference lasts for this page view */
  }
}

export function Companion() {
  const root = useRef(null)
  const body = useRef(null)
  const shown = useRef(new Set())
  const hideTimer = useRef(null)
  const hovering = useRef(false)
  const [message, setMessage] = useState(null)
  // on phones tips wait behind a badge instead of covering the content
  const [pending, setPending] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [minimized, setMinimized] = useState(() => readPref() === 'min')
  const [loaded, setLoaded] = useState(false)
  const section = useSiteValue('section')
  const ready = useSiteValue('ready')
  // Inky is literally ink: on the dark sections it swaps to the sun colour to stay visible
  const onInk = INK_SECTIONS.has(section)

  const show = useCallback((msg) => {
    setMessage(msg)
    clearTimeout(hideTimer.current)
    const hide = () => {
      if (hovering.current) hideTimer.current = setTimeout(hide, 1500)
      else setMessage(null)
    }
    hideTimer.current = setTimeout(hide, Math.max(5000, msg.text.length * 70))
  }, [])

  const say = useCallback(
    (key, line) => {
      if (minimized || shown.current.has(key)) return
      shown.current.add(key)
      if (isNarrow()) setPending({ key, ...line })
      else show({ key, ...line })
    },
    [minimized, show],
  )

  const hop = useCallback(() => {
    if (prefersReducedMotion() || !body.current) return
    gsap.fromTo(body.current, { y: 0 }, { y: -18, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 })
  }, [])

  // Piixpal is decorative and heavy-ish: load it once the page is interactive
  useEffect(() => {
    if (!ready) return
    let alive = true
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300))
    idle(() =>
      loadPiixpal()
        .then(() => alive && setLoaded(true))
        .catch(() => {}),
    )
    return () => {
      alive = false
    }
  }, [ready])

  // contextual line per section
  useEffect(() => {
    if (!ready) return
    const line = SECTION_LINES[section]
    if (!line) return
    const t = setTimeout(() => say(section, line), section === 'arrive' ? 1400 : 500)
    return () => clearTimeout(t)
  }, [section, ready, say])

  // dock side follows the section, with a little arc between sides
  useEffect(() => {
    const el = root.current
    if (!el) return
    const left = LEFT_SECTIONS.has(section)
    if (el.classList.contains('is-left') === left) return
    const flip = () => el.classList.toggle('is-left', left)
    if (prefersReducedMotion()) return flip()
    gsap
      .timeline()
      .to(el, { y: 30, autoAlpha: 0, duration: 0.25, ease: 'power2.in', onComplete: flip })
      .to(el, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' })
  }, [section])

  // reactions to things the visitor does elsewhere on the page
  useEffect(
    () =>
      onEmit((type, detail) => {
        hop()
        if (type === 'mark-spun') say('spun', { text: "Careful, that's the logo! Okay, one more spin." })
        if (type === 'game') say('game', { text: `Ooh, ${detail.title}. Good pick.` })
      }),
    [hop, say],
  )

  // lean into scroll velocity; perk up when the cursor comes close
  useEffect(() => {
    if (prefersReducedMotion() || minimized) return
    const el = body.current
    if (!el) return
    const rotTo = gsap.quickTo(el, 'rotation', { duration: 0.5, ease: 'power3' })
    const settle = gsap.delayedCall(0.15, () => rotTo(0)).pause()
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        rotTo(gsap.utils.clamp(-14, 14, self.getVelocity() / -150))
        settle.restart(true)
      },
    })

    let near = false
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
      if (d < 150 !== near) {
        near = d < 150
        gsap.to(el, { scale: near ? 1.12 : 1, duration: 0.4, ease: 'back.out(3)' })
      }
    }
    if (hasFinePointer()) window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      st.kill()
      settle.kill()
      window.removeEventListener('pointermove', onMove)
    }
  }, [minimized])

  // if the visitor stalls on the intro, offer a way forward (once)
  useEffect(() => {
    if (!ready || minimized) return
    let timer
    const arm = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (window.scrollY < window.innerHeight * 0.5) {
          say('idle', {
            text: 'Not sure where to start? I can take you somewhere.',
            actions: NAV.slice(0, 2).map((n) => ({ label: n.label, href: n.href })),
          })
        }
      }, 16000)
    }
    arm()
    window.addEventListener('scroll', arm, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', arm)
    }
  }, [ready, minimized, say])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  const minimize = () => {
    setMinimized(true)
    setMenuOpen(false)
    setMessage(null)
    writePref('min')
  }
  const restore = () => {
    setMinimized(false)
    writePref(null)
  }

  if (minimized) {
    return (
      <button className="companion-tab mono" type="button" onClick={restore} aria-label="Show Inky, your guide">
        Inky
      </button>
    )
  }

  return (
    <aside
      className="companion"
      ref={root}
      aria-label="Inky, your guide"
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <div className="companion__bubble" role="status" aria-live="polite">
        {message && !menuOpen && (
          <div className="bubble" key={message.key}>
            <p>{message.text}</p>
            {message.actions && (
              <div className="bubble__actions">
                {message.actions.map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    className="bubble__action mono"
                    {...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    onClick={() => setMessage(null)}
                  >
                    {a.label}
                  </a>
                ))}
              </div>
            )}
            <button
              className="bubble__close"
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Dismiss message"
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          </div>
        )}
        {menuOpen && (
          <div className="bubble bubble--menu" id="inky-menu">
            <p className="mono">Take me to</p>
            <div className="bubble__actions">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="bubble__action mono" onClick={() => setMenuOpen(false)}>
                  {n.label}
                </a>
              ))}
            </div>
            <button className="bubble__hide mono" type="button" onClick={minimize}>
              Hide Inky
            </button>
          </div>
        )}
      </div>

      <button
        ref={body}
        className="companion__body"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="inky-menu"
        aria-label={pending ? 'Inky has a tip for you' : 'Inky, your guide. Open quick navigation'}
        onClick={() => {
          if (pending) {
            show(pending)
            setPending(null)
            setMenuOpen(false)
            return
          }
          setMenuOpen((o) => !o)
          setMessage(null)
        }}
        data-cursor="Hi"
      >
        <span className="companion__float">
          {loaded ? (
            <piix-sprite name="inky" size="76" color={onInk ? '#fdc003' : '#35028a'} sleep-after="40" />
          ) : (
            <span className="companion__placeholder" aria-hidden="true" />
          )}
        </span>
        <span className="companion__shadow" aria-hidden="true" />
        {pending && <span className="companion__badge" aria-hidden="true" />}
      </button>
    </aside>
  )
}
