import { Reveal } from './Reveal'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Mark Your Content',
      description: 'Wrap important text with priority token pairs — from Priority1 (low) to Priority10 (highest). Lightweight markup, zero architecture changes.',
      icon: '▶',
    },
    {
      number: '02',
      title: 'Model Learns Priority',
      description: 'Fine-tune with QLoRA on a GPU. The model learns to recognize these tokens and upweight their importance in the attention computation.',
      icon: '⚙',
    },
    {
      number: '03',
      title: 'Better Recall & Following',
      description: 'Priority10 facts buried deep now get retrieved. Instructions marked high-priority are followed more reliably, even in long contexts.',
      icon: '✓',
    },
    {
      number: '04',
      title: 'Evaluate & Scale',
      description: 'Validate on your north star eval. If successful, expand to full 1–10 gradient and test on larger models. Deploy with confidence.',
      icon: '→',
    },
  ]

  return (
    <section id="how-it-works" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">

        <Reveal delay={60}>
          <h2 className="mt-8 text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            Four steps from markup to{' '}
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-[#d6f36b]/40 via-[#d6f36b]/20 to-[#d6f36b]/40 blur-2xl -z-10" />
              <span className="relative inline-block bg-gradient-to-r from-[#d6f36b] to-[#c8e83d] px-4 py-1.5 rounded-lg text-black font-semibold">
                better responses
              </span>
            </span>
            .
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12">
          {steps.map((step, index) => (
            <Reveal
              key={step.number}
              delay={120 + index * 70}
              className={`md:col-span-6 ${index === 0 ? 'lg:col-span-7' : ''} ${index === 1 ? 'lg:col-span-5' : ''} ${index === 2 ? 'lg:col-span-5' : ''} ${index === 3 ? 'lg:col-span-7' : ''}`}
            >
              <article className="group rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:from-white/[0.12] hover:to-white/[0.04]">
                <div className="h-full rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-gradient-to-br from-[#0d1020] to-[#0a0c14] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-500 group-hover:from-[#0f1428] group-hover:to-[#0b0e18]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-5xl font-bold tracking-[-0.05em] text-accent-oklch(71.5% 0.143 215.221) group-hover:text-accent-500/60 transition-all duration-500">{step.number}</p>
                      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">{step.title}</h3>
                    </div>
                    <span className="text-2xl text-accent-300 group-hover:text-accent-400/60 transition-all duration-500">{step.icon}</span>
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-gray-400">{step.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
