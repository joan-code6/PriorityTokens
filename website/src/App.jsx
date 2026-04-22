import { useEffect, useState } from 'react'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Solution } from './components/Solution'
import { ConceptPaper } from './components/ConceptPaper'
import { HowItWorks } from './components/HowItWorks'
import { Implementation } from './components/Implementation'
import { RelatedWork } from './components/RelatedWork'
import { Progress } from './components/Progress'
import { Footer } from './components/Footer'

export default function App() {
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (!showPopup) {
      return undefined
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowPopup(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showPopup])

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white">
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className="w-full max-w-2xl rounded-2xl border border-white/20 bg-[#101010] p-6 shadow-2xl"
            role="dialog"
            aria-labelledby="voter-popup-title"
            aria-modal="true"
          >
            <h2 id="voter-popup-title" className="text-2xl font-semibold">
              Hello voters!
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-200 sm:text-base">
              <p>
                This project is a bit different from what you might be used to. I am currently fine-tuning LLMs to
                help them better understand priority. Unfortunately, I cannot show you much beyond this website and my
                core concept.
              </p>
              <p>
                Please do not rate this project lower simply because of these circumstances; I ask that you treat all
                projects equally. In the past, I have received lower marks because voters felt they didn’t fully
                understand the concept or see a live demo.
              </p>
              <p>Thank you for your time!</p>
              <p>Bennet</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-40 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
      >
        Skip to content
      </a>
      <main id="main-content">
        <Hero />
        <Problem />
        <RelatedWork />
        <Solution />
        <ConceptPaper />
        <HowItWorks />
        <Implementation />
        <Progress />
      </main>
      <Footer />
    </div>
  )
}
