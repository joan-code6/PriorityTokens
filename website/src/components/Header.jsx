import { useEffect, useState } from 'react'

const links = [
  { href: '#problem', label: 'Problem' },
  { href: '#solution', label: 'Solution' },
  { href: '#concept-paper', label: 'Concept paper' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#tech', label: 'Technical scope' },
  { href: '#progress', label: 'Progress' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 px-4 py-6 md:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.03] px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:px-6">
          <a
            href="#"
            className="group flex items-center gap-2.5 rounded-lg px-2 py-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 border border-accent-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent-300">
                <path d="M8 4L5 12H11L8 20L19 10H13L16 4H8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-[0.05em] text-white">Priority Tokens</span>
          </a>

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:border-white/30 md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-label="Open menu"
          >
            <span
              className={`absolute h-[1.5px] w-5 bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-[5px]'
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-5 bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-5 bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[5px]'
              }`}
            />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-20 flex items-center justify-center bg-black/80 px-4 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav className="w-full max-w-sm space-y-3 text-center">
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] px-6 py-4 text-xl font-medium text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/25 hover:bg-white/[0.12] ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ transitionDelay: `${100 + index * 50}ms` }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}
