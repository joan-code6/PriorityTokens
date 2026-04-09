import { useEffect } from 'react'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Solution } from './components/Solution'
import { HowItWorks } from './components/HowItWorks'
import { Implementation } from './components/Implementation'
import { Progress } from './components/Progress'
import { Footer } from './components/Footer'

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-40 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
      >
        Skip to content
      </a>
      <main id="main-content">
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Implementation />
        <Progress />
      </main>
      <Footer />
    </div>
  )
}
