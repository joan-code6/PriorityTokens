import { useEffect, useState } from 'react'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Solution } from './components/Solution'
import { HowItWorks } from './components/HowItWorks'
import { Implementation } from './components/Implementation'
import { RelatedWork } from './components/RelatedWork'
import { Progress } from './components/Progress'
import { Footer } from './components/Footer'

export default function App() {
  const [isNoticeOpen, setIsNoticeOpen] = useState(true)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (!isNoticeOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isNoticeOpen])

  function handleDismissNotice() {
    setIsNoticeOpen(false)
  }

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-40 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
      >
        Skip to content
      </a>
      <main id="main-content">
        {isNoticeOpen ? (
          <section
            className="fixed inset-0 z-40 flex items-start justify-center bg-black/55 px-4 py-6 backdrop-blur-sm sm:py-8"
            aria-label="Temporary project note"
            role="dialog"
            aria-modal="true"
            onClick={handleDismissNotice}
          >
            <div className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-1 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
              <div
                className="rounded-[calc(2rem-0.25rem)] border border-white/10 bg-[#0b0b0b]/95 px-5 py-5 sm:px-7 sm:py-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6f36b]">
                      temporary note
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-white/88 sm:text-lg text-pretty">
                      Hey Carlson, this is a project to retrain Qwen to be able to understand Importancy (the brackets i talked about). I can&apos;t really show you anything other than my concept I am writing on (or the already written AI version you see in the readme) since im actively working on it. I usually wouldnt have shipped it this early but sadly the lockin challange requires me to ship smth not just track it
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDismissNotice}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                    aria-label="Dismiss temporary note"
                  >
                    <span aria-hidden="true">X</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        <Hero />
        <Problem />
        <RelatedWork />
        <Solution />
        <HowItWorks />
        <Implementation />
        <Progress />
      </main>
      <Footer />
    </div>
  )
}
