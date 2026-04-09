import { Lightbulb } from 'lucide-react'

export function Solution() {
  return (
    <section id="solution" className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 order-2 md:order-1">
            <div className="space-y-6 font-mono text-sm">
              <div>
                <p className="text-gray-400 dark:text-gray-500 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Low Priority</p>
                <p className="bg-gray-50 dark:bg-gray-900 rounded px-4 py-2 text-gray-600 dark:text-gray-400">&lt;&lt;Priority1&gt;&gt;This is less important&lt;&lt;PrioEnd&gt;&gt;</p>
              </div>
              <div>
                <p className="text-gray-400 dark:text-gray-500 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Moderate Priority</p>
                <p className="bg-gray-50 dark:bg-gray-900 rounded px-4 py-2 text-gray-600 dark:text-gray-400">&lt;&lt;Priority5&gt;&gt;This is moderately important&lt;&lt;PrioEnd&gt;&gt;</p>
              </div>
              <div>
                <p className="text-gray-400 dark:text-gray-500 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Highest Priority</p>
                <p className="bg-accent-50 dark:bg-accent-950 rounded px-4 py-2 text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-accent-900">&lt;&lt;Priority10&gt;&gt;This is critical&lt;&lt;PrioEnd&gt;&gt;</p>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Lightbulb className="w-6 h-6 text-accent-600" strokeWidth={2} />
              </div>
              <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Priority Tokens</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  A lightweight markup syntax that lets you explicitly signal how much weight the model should give to different parts of your text.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-accent-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Instruction Following</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">High-priority instructions are followed more reliably, even when buried in long documents.</p>
              </div>
              <div className="border-l-4 border-accent-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Recall Accuracy</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Important facts are retained and referenced with higher accuracy in model outputs.</p>
              </div>
              <div className="border-l-4 border-accent-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No Architecture Changes</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Learned behavior through fine-tuning, similar to how models learned `[INST]` tags.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
