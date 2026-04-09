import { Reveal } from './Reveal'

export function Implementation() {
  const pillars = [
    {
      label: 'Model',
      value: 'Qwen3-8B',
      description: 'Open-source, well-documented, and manageable for hobbyist hardware.',
    },
    {
      label: 'Method',
      value: 'QLoRA SFT',
      description: '4-bit quantized LoRA fine-tuning to make single rented GPU training feasible within budget.',
    },
    {
      label: 'Scope',
      value: 'v1 constraints',
      description: 'Binary Priority10 vs Priority1 first, then expand to full 1-10 only after validation.',
    },
  ]

  const details = [
    {
      title: 'Tokenization',
      text: 'Add 11 new special tokens: Priority1 through Priority10 and PrioEnd. Initialize embeddings by copying an existing special token instead of random initialization.',
    },
    {
      title: 'Training data',
      text: 'Use synthetic long-document examples with high-priority content buried at varying positions, including contrastive pairs where changing priority changes the expected output.',
    },
    {
      title: 'Evaluation',
      text: 'North star eval: a ~6k token document with a Priority10 fact near position ~3000, surrounded by Priority1 noise, compared against the base model on answer accuracy.',
    },
    {
      title: 'v1 constraints',
      text: 'Solo hobby scope, ~150 euro compute budget, RunPod RTX 4090 (~0.75 euro/hour), and QLoRA fine-tuning only with no full retraining.',
    },
  ]

  return (
    <section id="tech" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="mt-8 text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            Deliberately small, measurable, and{' '}
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-[#d6f36b]/40 via-[#d6f36b]/20 to-[#d6f36b]/40 blur-2xl -z-10" />
              <span className="relative inline-block bg-gradient-to-r from-[#d6f36b] to-[#c8e83d] px-4 py-1.5 rounded-lg text-black font-semibold">
                reproducible
              </span>
            </span>
            .
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-16">
          <div className="space-y-12">
            {/* Three pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((pillar) => (
                <div key={pillar.label}>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-3">{pillar.label}</p>
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-white mb-3">{pillar.value}</p>
                  <p className="text-sm leading-relaxed text-gray-400">{pillar.description}</p>
                </div>
              ))}
            </div>

            {/* Implementation details */}
            <div className="pt-12 border-t border-white/10">
              <h3 className="text-base font-semibold text-white uppercase tracking-[0.15em]">Implementation details</h3>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {details.map((detail) => (
                  <div key={detail.title}>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-[0.15em] mb-3">{detail.title}</h4>
                    <p className="text-sm leading-relaxed text-gray-400">{detail.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
