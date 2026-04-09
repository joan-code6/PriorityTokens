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
            Deliberately small, measurable, and reproducible.
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {pillars.map((pillar, index) => (
              <article key={pillar.label} className="md:col-span-4">
                <div className="h-full rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 backdrop-blur-sm">
                  <div className="h-full rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-gradient-to-br from-[#0d1020] to-[#0a0c14] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">{pillar.label}</p>
                    <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">{pillar.value}</p>
                    <p className="mt-4 text-sm leading-relaxed text-gray-400">{pillar.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 backdrop-blur-sm">
            <div className="rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-gradient-to-br from-[#0d1020] to-[#0a0c14] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] md:p-10">
              <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-white">Implementation details</h3>
              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                {details.map((detail) => (
                  <article key={detail.title} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                    <h4 className="text-base font-semibold text-white">{detail.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{detail.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
