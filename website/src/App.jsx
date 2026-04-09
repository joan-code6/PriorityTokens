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
