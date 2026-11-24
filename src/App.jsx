import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Header } from './components/Header'
import { Story } from './components/story/Story'
import { Games } from './components/games/Games'
import { Marquee } from './components/Marquee'
import { Work } from './components/Work'
import { Manifesto } from './components/Manifesto'
import { Footer } from './components/Footer'
import { Loader } from './components/Loader'
import { Companion } from './components/Companion'
import { Interactions } from './components/Interactions'

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
      <a className="skip mono" href="#games">
        Skip the story
      </a>
      <Loader />
      <Header />
      <main>
        <Story />
        <Games />
        <Marquee />
        <Work />
        <Manifesto />
      </main>
      <Footer />
      <Companion />
      <Interactions />
    </>
  )
}
