import { Reveal } from './Reveal'

export function Problem() {
  return (
    <section id="problem" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-6">
          <Reveal>
            <span className="inline-flex rounded-full border border-accent-500/20 bg-accent-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-300 backdrop-blur-sm">
              the bottleneck
            </span>
            <h2 className="mt-8 text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              Long context means nothing when importance is invisible.
            </h2>
            <p className="mt-10 text-pretty text-base leading-relaxed text-gray-400 max-w-2xl md:text-lg">
              Models process thousands of tokens but tend to treat them roughly equally, so critical instructions or facts buried deep in context can be ignored or underweighted.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
              <article className="md:col-span-8">
                <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 backdrop-blur-sm">
                  <div className="rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-gradient-to-br from-[#0d1020] to-[#0a0c14] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] md:p-10">
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-white">The practical failure mode</h3>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-400">
                      This is the lost-in-the-middle problem: the deeper an important detail sits in a long document, the easier it is for the model to miss.
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs uppercase tracking-[0.15em] text-white/45">prompt size</p>
                        <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">6,000</p>
                        <p className="mt-2 text-sm text-white/65">tokens in test scenario</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs uppercase tracking-[0.15em] text-white/45">critical span</p>
                        <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">3,000+</p>
                        <p className="mt-2 text-sm text-white/65">position depth</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs uppercase tracking-[0.15em] text-white/45">failure rate</p>
                        <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">high</p>
                        <p className="mt-2 text-sm text-white/65">without explicit weighting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="md:col-span-4">
                <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 backdrop-blur-sm">
                  <div className="rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-gradient-to-br from-[#0d1220] to-[#0a0b15] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">current workarounds</p>
                    <ul className="mt-5 space-y-4 text-sm text-white/75">
                      <li className="rounded-xl border border-white/10 bg-black/25 p-3">Repeat the same instruction multiple times.</li>
                      <li className="rounded-xl border border-white/10 bg-black/25 p-3">Restructure prompts to force salience.</li>
                      <li className="rounded-xl border border-white/10 bg-black/25 p-3">Sacrifice context to keep key parts near the front.</li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
