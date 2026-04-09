import { Code2, Cpu, Target } from 'lucide-react'

export function Implementation() {
  return (
    <section id="tech" className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Technical Scope</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Open-source, hobby-scale, fine-tuning approach.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
              <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Model</h3>
            <p className="text-gray-600 dark:text-gray-400">Qwen3-8B (open-source, well-documented, suitable for hobby hardware).</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Method</h3>
            <p className="text-gray-600 dark:text-gray-400">QLoRA supervised fine-tuning (4-bit quantized LoRA for efficient single-GPU training).</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Goal</h3>
            <p className="text-gray-600 dark:text-gray-400">Measurable accuracy improvement on buried-fact recall with ~150€ compute budget.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Implementation Details</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tokenization</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">11 new special tokens (Priority1–10 + PrioEnd) added to tokenizer with embeddings initialized from existing special tokens for faster convergence.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Training Data</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Synthetic examples with high-priority content at varying depths in long documents (~6k tokens), paired with outputs that act on or recall that content.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Evaluation</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">North star: document with Priority10 fact at position ~3000, surrounded by Priority1 noise. Measure recall accuracy vs base model.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">v1 Constraints</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Qwen3-8B only. Binary case (Priority10 vs Priority1) before full 1–10 gradient. QLoRA fine-tuning, no full retraining.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
