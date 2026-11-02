import { useRef } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react'
import { useFitText } from '../hooks/useFitText'

const CHANNELS = [
  { label: 'Discord', href: 'https://discord.gg/FXTWvbpBY' },
  { label: 'YouTube', href: 'https://www.youtube.com/@Polykromy' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@polykromy' },
  { label: 'Instagram', href: 'https://www.instagram.com/polykromy.id/' },
]

export function Footer() {
  const word = useRef(null)
  useFitText(word)

  return (
    <footer className="footer" id="contact">
      <div className="footer__big">
        <span ref={word} className="footer__big-inner">
          Endless possibilities.
        </span>
      </div>
      <div className="footer__grid">
        <img
          className="footer__plate"
          src="/polykromy-logo.jpg"
          alt="Polykromy logo: wordmark above the purple bird mark on yellow"
          width="1254"
          height="1254"
          loading="lazy"
        />
        <p className="footer__about">
          Polykromy is an independent game development brand focused on creating original Roblox experiences and
          distinctive digital accessories.
        </p>
        <ul className="footer__links">
          {CHANNELS.map((c) => (
            <li key={c.label}>
              <a href={c.href} target="_blank" rel="noopener noreferrer">
                <span>{c.label}</span>
                <ArrowUpRight size={22} weight="bold" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer__bar mono">
        <span>© {new Date().getFullYear()} Polykromy</span>
        <span>Different ideas. Distinctive worlds. Endless possibilities.</span>
      </div>
    </footer>
  )
}
