import { worldScenes } from '@/data/scenes'
import MeterStrip from '@/components/MeterStrip'

/**
 * The arc — the flight's argument, restated as a document.
 *
 * Everything the corridor says in pictures is also here in text: six chapters,
 * hairline-separated, statically complete. That redundancy is deliberate, and it is
 * what makes the film safe to ship. A deep link, a restored scroll position, a
 * crawler, a screen reader, or a visitor who clicks "skip the film" all reach the
 * whole case without the camera ever having moved.
 *
 * It is also why the flight is allowed to take its time. Cinema that gates the
 * evidence is an imposition; cinema with the evidence one click below it is an offer.
 */
export default function Sequence() {
  return (
    <>
      <MeterStrip />

      <section
        id="arc"
        className="relative scroll-mt-24 px-[clamp(20px,4vw,64px)] py-[clamp(64px,10vh,120px)]"
      >
        <div className="mx-auto max-w-[1320px]">
          <header className="max-w-[46ch]">
            <p className="eyebrow">
              <b>01</b> · The arc
            </p>
            <h2 className="text-[clamp(1.7rem,3.6vw,2.8rem)]">
              Legacy, cloud, <span className="proper">AI</span> — one system that kept&nbsp;
              <em className="verb">compounding</em>.
            </h2>
            <p className="mt-5 text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.62] text-ink-muted">
              Each chapter handed the next one its vocabulary. Reading COBOL in 2015 is
              what made translating it with an LLM in 2024 tractable.
            </p>
          </header>

          <ol className="mt-14 border-t border-rule">
            {worldScenes.map((scene, i) => (
              <li
                key={scene.id}
                data-station={scene.id}
                className="grid gap-x-10 gap-y-4 border-b border-rule py-9 md:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,1fr)]"
              >
                <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
                  <span className="font-mono text-[11px] tracking-[0.1em] text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="stat__label proper">{scene.eyebrow}</span>
                </div>

                <div className="min-w-0">
                  <h3 className="max-w-[26ch] text-[clamp(1.25rem,2.2vw,1.75rem)]">
                    {scene.title}
                  </h3>
                  <p className="mt-3 max-w-[68ch] text-[0.95rem] leading-[1.65] text-ink-muted">
                    {scene.body}
                  </p>

                  <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3">
                    {scene.metrics.map((metric) => (
                      <p key={metric.label} className="min-w-0">
                        <span data-stat className="stat__figure text-[1.35rem]">
                          {metric.value}
                        </span>
                        <span className="stat__label ml-2">{metric.label}</span>
                      </p>
                    ))}
                  </div>

                  <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
                    {scene.tags.map((tag) => (
                      <li
                        key={tag}
                        className="font-mono text-[10.5px] tracking-[0.08em] text-ink-faint proper"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
