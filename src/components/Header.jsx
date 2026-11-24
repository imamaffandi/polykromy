import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Mark } from './Mark'
import { CHANNELS, NAV } from '../content/site'
import { useSiteValue } from '../lib/siteStore'
import { prefersReducedMotion } from '../lib/env'

export function Header() {
  const root = useRef(null)
  const nav = useRef(null)
  const marker = useRef(null)
  const menu = useRef(null)
  const menuButton = useRef(null)
  const [open, setOpen] = useState(false)
  const section = useSiteValue('section')
  // the Contact button already covers #contact, so the inline nav skips it
  const links = NAV.filter((l) => l.href !== '#contact')
  const active = links.findIndex((l) => l.sections.includes(section))

  // page scroll progress on the header's bottom rule (no React state per frame)
  useGSAP(
    () => {
      gsap.to('.header__progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      })
    },
    { scope: root },
  )

  // slide the bracket marker under the active link
  useLayoutEffect(() => {
    const m = marker.current
    const link = nav.current?.children[active]
    if (!m) return
    if (!link) {
      gsap.to(m, { autoAlpha: 0, duration: 0.2 })
      return
    }
    const props = { x: link.offsetLeft, width: link.offsetWidth, autoAlpha: 1 }
    if (prefersReducedMotion()) gsap.set(m, props)
    else gsap.to(m, { ...props, duration: 0.5, ease: 'expo.out' })
  }, [active])

  // mobile menu: inert page, focus management, Escape to close
  useEffect(() => {
    const main = document.querySelector('main')
    const footer = document.querySelector('footer')
    if (main) main.inert = open
    if (footer) footer.inert = open
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    menu.current?.querySelector('a')?.focus()
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      menuButton.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useGSAP(
    () => {
      if (!open || prefersReducedMotion()) return
      gsap.from('.menu__link > span', { yPercent: 110, stagger: 0.06, duration: 0.8, ease: 'expo.out' })
      gsap.from('.menu__foot', { autoAlpha: 0, y: 12, duration: 0.6, delay: 0.25 })
    },
    { scope: menu, dependencies: [open] },
  )

  const close = () => setOpen(false)

  return (
    <header className={`header${open ? ' is-open' : ''}`} ref={root}>
      <a className="header__brand" href="#top" aria-label="Polykromy home" onClick={close}>
        <Mark className="header__mark" title="" />
        <span className="header__word">Polykromy</span>
      </a>

      <nav className="header__nav mono" aria-label="Primary">
        <div className="header__links" ref={nav}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href} aria-current={i === active ? 'location' : undefined} data-scramble>
              {l.label}
            </a>
          ))}
        </div>
        <span className="header__marker" ref={marker} aria-hidden="true" />
      </nav>

      <a
        className="btn btn--solid btn--sm header__cta"
        href="#contact"
        aria-current={section === 'contact' ? 'location' : undefined}
        data-magnetic
      >
        <span className="btn__label">Contact</span>
      </a>

      <button
        ref={menuButton}
        className="header__toggle mono"
        type="button"
        aria-expanded={open}
        aria-controls="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="header__burger" aria-hidden="true">
          <i />
          <i />
        </span>
        {open ? 'Close' : 'Menu'}
      </button>

      <span className="header__progress" aria-hidden="true" />

      <div className="menu" id="menu" ref={menu} hidden={!open} data-ink>
        <nav aria-label="Menu">
          <ul>
            {NAV.map((l, i) => (
              <li key={l.href}>
                <a className="menu__link" href={l.href} onClick={close}>
                  <span>
                    <small className="mono">{String(i + 1).padStart(2, '0')}</small>
                    {l.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu__foot mono">
          {CHANNELS.map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer">
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}
