import { Reveal } from './Reveal'

export function Solution() {
  return (
    <section id="solution" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="inline-flex rounded-full border border-accent-500/20 bg-accent-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-300 backdrop-blur-sm">
            solution model
          </span>
          <h2 className="mt-8 text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            Priority Tokens make instruction weight explicit.
          </h2>
        </Reveal>

        <Reveal delay={130} className="mt-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
            <article className="md:col-span-5">
              <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 backdrop-blur-sm">
                <div className="rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-gradient-to-br from-[#0d1020] to-[#0a0c14] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">signal gradient</p>
                  <div className="mt-5 space-y-4 font-mono text-sm">
                    <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white/60">&lt;&lt;Priority1&gt;&gt;Optional context&lt;&lt;PrioEnd&gt;&gt;</div>
                    <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white/75">&lt;&lt;Priority5&gt;&gt;Important detail&lt;&lt;PrioEnd&gt;&gt;</div>
                    <div className="rounded-2xl border border-[#d6f36b]/45 bg-[#d6f36b]/10 px-4 py-3 text-[#d6f36b]">&lt;&lt;Priority10&gt;&gt;Non-negotiable instruction&lt;&lt;PrioEnd&gt;&gt;</div>
                  </div>
                </div>
              </div>
            </article>

            <article className="md:col-span-7">
              <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 backdrop-blur-sm">
                <div className="rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-gradient-to-br from-[#0d1020] to-[#0a0c14] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] md:p-10">
                  <p className="text-pretty text-base leading-relaxed text-gray-400 md:text-lg">
                    Users declare priority directly in the prompt, and fine-tuning teaches the model to respond differently to those tokens without changing model architecture.
                  </p>

                  <div className="mt-8 grid gap-5 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/90">Instruction following</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/65">A Priority10 instruction should be followed more reliably than a Priority1 one, even deep in long context.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/90">Recall accuracy</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/65">Facts wrapped in high-priority tokens should be retained and referenced more accurately in outputs.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/90">Adoption speed</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/65">Lightweight prompt markup with QLoRA fine-tuning, not full retraining from scratch.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
