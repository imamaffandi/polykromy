import { Mark } from './Mark'

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#worlds', label: 'Worlds' },
  { href: '#studio', label: 'Studio' },
]

export function Header() {
  return (
    <header className="header">
      <a className="header__brand" href="#top" aria-label="Polykromy home">
        <Mark className="header__mark" />
        <span className="header__word">Polykromy</span>
      </a>
      <nav className="header__nav mono" aria-label="Primary">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="btn btn--solid btn--sm" href="#contact">
        Contact
      </a>
    </header>
  )
}
