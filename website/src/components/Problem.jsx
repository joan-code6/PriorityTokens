import { Reveal } from './Reveal'

export function Problem() {
  return (
    <section id="problem" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-6">
          <Reveal>

            <h2 className="mt-8 text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              Long context means nothing when importance is invisible.
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
                  This is the lost-in-the-middle problem: the deeper an important detail sits in a long document, the easier it is for the model to miss. Models treat all tokens roughly equally, so critical instructions buried at position 3,000+ get underweighted.
                </p>
              </div>

              {/* Current workarounds */}
              <div>
                <h3 className="text-base font-semibold text-white uppercase tracking-[0.15em]">Current workarounds (all inefficient)</h3>
                <p className="mt-4 text-base leading-relaxed text-gray-400 max-w-3xl">
                  Repeat the same instruction multiple times. Restructure prompts to force salience. Sacrifice valuable context to keep key parts near the front. None of these scale well.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
