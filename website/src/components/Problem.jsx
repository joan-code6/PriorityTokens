import { AlertCircle } from 'lucide-react'

export function Problem() {
  return (
    <section id="problem" className="py-20 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <AlertCircle className="w-6 h-6 text-red-600" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">The Lost in the Middle Problem</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  When you feed an LLM thousands of tokens of context, it treats everything roughly equally. Important instructions and facts buried deep in long documents get ignored or underweighted.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Humans solve this naturally — we use emphasis, repetition, and clear statements like "this is the most important part." Models have no equivalent mechanism that users can control.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The Challenge</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Burying a critical fact 3,000 tokens deep in a 6,000 token document significantly reduces recall accuracy.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current Workarounds</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Repeat information, restructure prompts, or sacrifice context. All inefficient and ineffective.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The Result</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Missed instructions, forgotten context, and reduced model performance on long-context tasks.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
