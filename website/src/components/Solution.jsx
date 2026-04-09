import { Reveal } from './Reveal'

export function Solution() {
  return (
    <section id="solution" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-20 max-w-4xl">
            <h2 className="mt-8 text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              Priority Tokens make instruction weight{' '}
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-[#d6f36b]/40 via-[#d6f36b]/20 to-[#d6f36b]/40 blur-2xl -z-10" />
                <span className="relative inline-block bg-gradient-to-r from-[#d6f36b] to-[#c8e83d] px-4 py-1.5 rounded-lg text-black font-semibold">
                  explicit
                </span>
              </span>
              .
            </h2>
          </div>
        </Reveal>

        <Reveal delay={130}>
          <div className="space-y-16">
            {/* Syntax showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-6">Markup syntax</p>
                <div className="space-y-4 font-mono text-sm">
                  <div className="py-3 border-b border-white/10 text-white/60">
                    &lt;&lt;Priority1&gt;&gt;Optional context&lt;&lt;PrioEnd&gt;&gt;
                  </div>
                  <div className="py-3 border-b border-white/10 text-white/75">
                    &lt;&lt;Priority5&gt;&gt;Important detail&lt;&lt;PrioEnd&gt;&gt;
                  </div>
                  <div className="py-3 text-[#d6f36b]">
                    &lt;&lt;Priority10&gt;&gt;Non-negotiable instruction&lt;&lt;PrioEnd&gt;&gt;
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-6">How it works</p>
                <p className="text-base leading-relaxed text-gray-400 mb-8">
                  You declare priority directly in the prompt. Fine-tuning teaches the model to recognize these tokens and adjust attention weights accordingly—without changing the model architecture.
                </p>
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70 mb-2">No retraining needed</h4>
                    <p className="text-sm text-gray-400">QLoRA fine-tuning only. Lightweight, fast, and cheap to deploy.</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70 mb-2">Works in long context</h4>
                    <p className="text-sm text-gray-400">Priority10 facts buried at position 3,000+ still get retrieved accurately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
