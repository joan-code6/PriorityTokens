import { Reveal } from './Reveal'

export function Progress() {
  const phases = [
    {
      phase: 'Phase 1: Research & Setup',
      status: 'in-progress',
      items: [
        { name: 'Write concept & problem statement', done: true },
        { name: 'Design markup syntax', done: false },
        { name: 'Setup Qwen3-8B environment', done: false },
      ],
    },
    {
      phase: 'Phase 2: Tokenization & Data',
      status: 'not-started',
      items: [
        { name: 'Add 11 special tokens to tokenizer', done: false },
        { name: 'Generate synthetic training dataset', done: false },
        { name: 'Create contrastive examples', done: false },
      ],
    },
    {
      phase: 'Phase 3: Fine-tuning',
      status: 'not-started',
      items: [
        { name: 'Setup QLoRA on RunPod GPU', done: false },
        { name: 'Train on synthetic examples', done: false },
        { name: 'Optimize for ~150€ budget', done: false },
      ],
    },
    {
      phase: 'Phase 4: Evaluation & v1 Release',
      status: 'not-started',
      items: [
        { name: 'Run north star evaluation (6k token document)', done: false },
        { name: 'Compare base vs fine-tuned model accuracy', done: false },
        { name: 'Release v1 (Qwen3-8B binary case)', done: false },
      ],
    },
    {
      phase: 'Phase 5: Expansion (v1.x)',
      status: 'not-started',
      items: [
        { name: 'Expand to full 1–10 priority gradient', done: false },
        { name: 'Test on larger models', done: false },
        { name: 'Community feedback & iteration', done: false },
      ],
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'text-[#d6f36b]'
      case 'in-progress':
        return 'text-[#f7e38a]'
      case 'not-started':
        return 'text-white/40'
      default:
        return ''
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'in-progress':
        return 'border-[#f7e38a]/35 bg-[#f7e38a]/10'
      case 'not-started':
        return 'border-white/10 bg-black/25'
      default:
        return 'border-[#d6f36b]/30 bg-[#d6f36b]/10'
    }
  }

  return (
    <section id="progress" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="inline-flex rounded-full border border-accent-500/20 bg-accent-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-300 backdrop-blur-sm">
            roadmap
          </span>
          <h2 className="mt-8 text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            Current status and next delivery phases.
          </h2>
          <p className="mt-10 text-pretty text-base leading-relaxed text-gray-400 max-w-2xl md:text-lg">
            The project is early and intentionally constrained. The concept is defined, while tokenization, training data generation, and fine-tuning execution are still pending.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12 space-y-6">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={`rounded-[2.5rem] border p-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${getStatusBg(phase.status)}`}
            >
              <article className="rounded-[calc(2.5rem-0.375rem)] border border-white/10 bg-[#0a0b12] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <div className="mb-6 flex items-start gap-4">
                  <div className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ${getStatusColor(phase.status)}`} />
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">
                      {phase.phase}
                    </h3>
                    <p className={`mt-1 text-sm font-medium ${
                      phase.status === 'in-progress'
                        ? 'text-[#f7e38a]'
                        : phase.status === 'done'
                          ? 'text-[#d6f36b]'
                          : 'text-white/45'
                    }`}>
                      {phase.status === 'in-progress'
                        ? 'In progress'
                        : phase.status === 'done'
                          ? 'Complete'
                          : 'Not started'}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {phase.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.done ? 'bg-[#d6f36b]' : 'bg-white/25'}`} />
                      <span className={`text-sm md:text-base ${item.done ? 'text-white/45 line-through' : 'text-white/75'}`}>
                        {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          ))}

          <div className="mt-12 rounded-[2.5rem] border border-[#d6f36b]/40 bg-gradient-to-br from-[#d6f36b]/15 to-[#d6f36b]/5 p-1.5 backdrop-blur-sm">
            <div className="rounded-[calc(2.5rem-0.375rem)] border border-[#d6f36b]/30 bg-gradient-to-br from-[#0f1408] to-[#0a0d04] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d6f36b]">Current status</h4>
              <p className="mt-3 text-sm leading-relaxed text-[#e9f8b8] md:text-base">
                Concept and technical framing are complete. The active next step is finalizing markup specs and setting up the first reproducible QLoRA training run.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
