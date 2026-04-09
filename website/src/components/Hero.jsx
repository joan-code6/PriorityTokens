export function Hero() {
  return (
    <section className="min-h-[100dvh] flex items-center justify-center px-6 py-20 bg-gradient-to-b from-white via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-6 px-3 py-1.5 bg-accent-50 dark:bg-accent-950 border border-accent-200 dark:border-accent-900 rounded-full">
          <span className="text-xs font-semibold text-accent-700 dark:text-accent-300">Improving LLM Attention</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          Make LLMs <span className="text-accent-600">Pay Attention</span> to What Matters
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Priority Tokens introduce a simple markup syntax that lets you explicitly signal importance to language models — solving the "lost in the middle" problem with a single lightweight addition.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 active:scale-[0.98]">
            Learn More
          </button>
          <button className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 active:scale-[0.98]">
            View Docs
          </button>
        </div>

        {/* Visual demonstration */}
        <div className="mt-16 bg-gray-900 dark:bg-gray-800 rounded-lg p-6 text-left overflow-hidden border border-gray-800 dark:border-gray-700">
          <div className="space-y-3 font-mono text-sm">
            <div className="text-gray-400">&lt;&lt;Priority1&gt;&gt; ... &lt;&lt;PrioEnd&gt;&gt;</div>
            <div className="text-gray-400">&lt;&lt;Priority5&gt;&gt; ... &lt;&lt;PrioEnd&gt;&gt;</div>
            <div className="text-accent-400 animate-pulse-subtle">&lt;&lt;Priority10&gt;&gt; ... &lt;&lt;PrioEnd&gt;&gt;</div>
          </div>
        </div>
      </div>
    </section>
  )
}
