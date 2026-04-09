import { Reveal } from './Reveal'

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 md:px-8 min-h-[100dvh] flex items-center justify-center pt-24">
      {/* Ethereal background orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-64 -right-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-accent-500/8 to-accent-600/4 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-accent-500/6 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col">

          {/* Main headline */}
          <Reveal delay={40} className="flex flex-col">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-semibold leading-[1.1] tracking-[-0.03em] text-white">
              Make LLMs pay attention to{' '}
              <span className="relative inline-block mt-3">
                {/* Soft glow background */}
                <span className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-[#d6f36b]/40 via-[#d6f36b]/20 to-[#d6f36b]/40 blur-2xl -z-10 animate-pulse-subtle" />
                {/* Main highlight */}
                <span className="relative inline-block bg-gradient-to-r from-[#d6f36b] to-[#c8e83d] px-4 py-1.5 rounded-lg text-black font-semibold shadow-lg shadow-[#d6f36b]/30">
                  what matters
                </span>
              </span>
            </h1>
          </Reveal>

          {/* Subheading */}
          <Reveal delay={80} className="mt-10">
            <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-[65ch]">
              Use priority tokens to guide language models toward the information that actually shapes their decisions. Control what matters in long contexts.
            </p>
          </Reveal>

          {/* CTA buttons */}
          <Reveal delay={120} className="mt-12 flex flex-col sm:flex-row gap-4">
            <a
              href="#solution"
              className="group relative inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Explore solution
              <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 transition-all duration-300 group-hover:bg-black/15 group-hover:translate-x-1">
                <span className="text-sm">↗</span>
              </span>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5 backdrop-blur-sm"
            >
              How it works
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
