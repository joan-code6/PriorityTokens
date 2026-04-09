import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'

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
        return 'text-green-500'
      case 'in-progress':
        return 'text-accent-500'
      case 'not-started':
        return 'text-gray-400 dark:text-gray-600'
      default:
        return ''
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-accent-50 dark:bg-accent-950 border-accent-200 dark:border-accent-900'
      case 'not-started':
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <section id="progress" className="py-20 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-full">
            <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-300" strokeWidth={2} />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Early Stage</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Project Progress</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            This is a hobby project still in the concept phase. Currently, only the problem statement and technical vision are complete. Nothing has been built yet.
          </p>
        </div>

        <div className="space-y-6">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={`border rounded-lg p-8 transition-colors ${getStatusBg(phase.status)}`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`flex-shrink-0 mt-1.5 ${getStatusColor(phase.status)}`}>
                  {phase.status === 'in-progress' ? (
                    <Circle className="w-6 h-6 fill-current" strokeWidth={2} />
                  ) : phase.status === 'done' ? (
                    <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
                  ) : (
                    <Circle className="w-6 h-6" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                    {phase.phase}
                  </h3>
                  <p className={`text-sm font-medium ${
                    phase.status === 'in-progress' 
                      ? 'text-accent-600 dark:text-accent-400' 
                      : phase.status === 'done'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {phase.status === 'in-progress' 
                      ? '🚧 In Progress'
                      : phase.status === 'done' 
                      ? '✓ Complete' 
                      : '○ Not Started'}
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" strokeWidth={2} />
                    )}
                    <span className={`text-base ${
                      item.done
                        ? 'text-gray-600 dark:text-gray-400 line-through'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Current Status</h4>
          <p className="text-blue-800 dark:text-blue-300">
            The concept and technical approach are written. The project is in early planning stages with no code or training begun yet. Budget and timeline are provisional pending research and GPU availability.
          </p>
        </div>
      </div>
    </section>
  )
}
