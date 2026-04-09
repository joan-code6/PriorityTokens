export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Mark Your Content',
      description: 'Wrap important text with priority token pairs — from Priority1 (low) to Priority10 (highest).',
    },
    {
      number: '02',
      title: 'Fine-Tuned Attention',
      description: 'The model is trained to recognize these tokens and adjust its behavior accordingly during inference.',
    },
    {
      number: '03',
      title: 'Better Outcomes',
      description: 'Instructions are followed more reliably and context is recalled more accurately.',
    },
    {
      number: '04',
      title: 'Scale & Adapt',
      description: 'Use the full 1–10 priority gradient or the binary case that best suits your needs.',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Four simple steps to better LLM attention.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col">
              <div className="mb-6">
                <span className="text-5xl font-bold text-accent-200">{step.number}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 w-6 h-0.5 bg-gradient-to-r from-accent-300 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
