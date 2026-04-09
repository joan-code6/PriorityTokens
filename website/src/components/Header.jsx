import { Zap, Moon, Sun } from 'lucide-react'

export function Header({ isDark, setIsDark }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-lg text-gray-900 dark:text-white">Priority Tokens</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#problem" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Problem
          </a>
          <a href="#solution" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Solution
          </a>
          <a href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            How it Works
          </a>
          <a href="#tech" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Tech
          </a>
          <a href="#progress" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Progress
          </a>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={2} />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={2} />
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
