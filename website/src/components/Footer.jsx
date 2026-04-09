export function Footer() {
  return (
    <footer className="px-4 pb-12 pt-24 md:px-8 md:pt-32">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 backdrop-blur-sm">
        <div className="rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-gradient-to-br from-[#0d1020] to-[#0a0c14] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] md:p-10">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <a href="#" className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-3 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/90">
                    <path d="M8 4L5 12H11L8 20L19 10H13L16 4H8Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-white">Priority Tokens</span>
              </a>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
                A compact experiment in prompt-time control for long-context attention behavior.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Resources</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#solution" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">Syntax overview</a></li>
                <li><a href="#tech" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">Technical scope</a></li>
                <li><a href="#progress" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Concept</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#problem" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">The problem</a></li>
                <li><a href="#solution" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">The idea</a></li>
                <li><a href="#how-it-works" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">Behavior targets</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Execution</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#tech" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">Technical execution</a></li>
                <li><a href="#progress" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">Scope and constraints</a></li>
                <li><a href="#progress" className="text-white/70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">North star eval</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Priority Tokens.</p>
            <p>Built as a constrained research prototype for controllable attention.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
