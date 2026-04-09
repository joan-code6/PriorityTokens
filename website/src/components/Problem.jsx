import { Reveal } from './Reveal'

export function Problem() {
  return (
    <section id="problem" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-6">
          <Reveal>

            <h2 className="mt-8 text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              Long context means nothing when importance is{' '}
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-[#d6f36b]/40 via-[#d6f36b]/20 to-[#d6f36b]/40 blur-2xl -z-10" />
                <span className="relative inline-block bg-gradient-to-r from-[#d6f36b] to-[#c8e83d] px-4 py-1.5 rounded-lg text-black font-semibold">
                  invisible
                </span>
              </span>
              .
            </h2>
            <p className="mt-10 text-pretty text-base leading-relaxed text-gray-400 max-w-2xl md:text-lg">
              Models process thousands of tokens but tend to treat them roughly equally, so critical instructions or facts buried deep in context can be ignored or underweighted.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-16">
            <div className="space-y-12">
              {/* Main problem explanation */}
              <div>
                <h3 className="text-base font-semibold text-white uppercase tracking-[0.15em]">The real problem</h3>
                <p className="mt-4 text-base leading-relaxed text-gray-400 max-w-3xl">
                  This is the{' '}
                  <span className="relative inline-block">
                    <span className="absolute -inset-x-2 -inset-y-1 bg-gradient-to-r from-accent-500/20 to-accent-500/10 blur-lg -z-10" />
                    <span className="relative text-white">lost-in-the-middle problem</span>
                  </span>
                  : the deeper an important detail sits in a long document, the easier it is for the model to miss. Critical instructions buried at position <span className="text-accent-300 font-semibold">3,000+</span> get underweighted.
                </p>
              </div>

              {/* Current workarounds */}
              <div>
                <h3 className="text-base font-semibold text-white uppercase tracking-[0.15em]">Current workarounds</h3>
                <p className="mt-4 text-base leading-relaxed text-gray-400 max-w-3xl">
                  <span className="text-white/80">Repeat</span> the same instruction multiple times. <span className="text-white/80">Restructure</span> prompts to force salience. <span className="text-white/80">Sacrifice</span> valuable context. None of these scale.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
