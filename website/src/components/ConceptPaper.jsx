import { Reveal } from './Reveal'

const conceptPaperPath = '/Priority%20Tokens.pdf'

export function ConceptPaper() {
  return (
    <section id="concept-paper" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            Read the full{' '}
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-[#d6f36b]/40 via-[#d6f36b]/20 to-[#d6f36b]/40 blur-2xl -z-10" />
              <span className="relative inline-block bg-gradient-to-r from-[#d6f36b] to-[#c8e83d] px-4 py-1.5 rounded-lg text-black font-semibold">
                concept paper
              </span>
            </span>
            .
          </h2>
          <p className="mt-10 max-w-2xl text-pretty text-base leading-relaxed text-gray-400 md:text-lg">
            The complete concept document describes the problem framing, priority token strategy, technical scope, and planned validation path.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <article className="rounded-[2.5rem] border border-white/15 bg-gradient-to-br from-[#0b0d16] to-[#08090f] p-8 md:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d6f36b]">Document</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">Priority Tokens Concept Paper (PDF)</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65 md:text-base">
                  Open the paper in a new tab or download it directly for offline reading and review.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={conceptPaperPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 active:scale-[0.98]"
                >
                  Open PDF
                </a>
                <a
                  href={conceptPaperPath}
                  download
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5 active:scale-[0.98]"
                >
                  Download
                </a>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
