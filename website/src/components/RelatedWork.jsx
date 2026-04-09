import { Reveal } from './Reveal'

export function RelatedWork() {
  return (
    <section id="related-work" className="px-4 pb-10 md:px-8 md:pb-16" aria-label="Related work">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="rounded-[2rem] border border-white/12 bg-black/25 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Related work</p>
            <p className="mt-4 text-sm leading-relaxed text-gray-300 md:text-base">
              GUIDE (Silva et al., 2024) addresses the same problem by biasing attention logits at inference time. Priority Tokens differ by learning the behavior through SFT, requiring no inference-time model access and working through any standard API or interface.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}