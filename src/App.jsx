import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Work } from './components/Work'
import { Manifesto } from './components/Manifesto'
import { Worlds } from './components/Worlds'
import { Principles } from './components/Principles'
import { Footer } from './components/Footer'

export default function App() {
  // fonts change line lengths and section heights; re-measure triggers once they land
  useEffect(() => {
    document.fonts?.ready.then(() => {
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    })
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Work />
        <Manifesto />
        <Worlds />
        <Principles />
      </main>
      <Footer />
    </>
  )
}
