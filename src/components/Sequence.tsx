import { portfolio } from '@/data/portfolio'
import { worldScenes } from '@/data/scenes'
import Apparatus from '@/components/Apparatus'
import MeterStrip from '@/components/MeterStrip'

/**
 * Stat-Led hero + the compact career arc.
 *
 * This replaces the v5 pinned scroll-scrub, which spent 13,284px — roughly
 * sixteen viewports — animating seven stations into view. Everything below the
 * first station was invisible until the visitor had scrolled most of a novel,
 * and a deep-link or a restored scroll position landed on an empty screen
 * because the pinned timeline had not been driven. The arc now renders as a
 * static, scannable spec sheet: same six chapters, same copy, ~2k px instead of
 * ~13k, readable at any scroll position and with JavaScript doing nothing.
 *
 * The seven scene stills are no longer referenced. They sat at 4–8% opacity
 * behind the copy, which read as noise rather than imagery while costing
 * fourteen JPEGs of payload. The files remain in `public/scenes/` untouched.
 */

/** Three honest headline figures, in the order a hiring manager reads them. */
const PROOF = [
  { figure: '$2M+', label: 'cost saved', source: 'Schwab · HCA · NRG · Wiley' },
  { figure: '1B+', label: 'events / day', source: 'Charles Schwab' },
  { figure: '50M+', label: 'docs in production RAG', source: 'John Wiley & Sons' },
] as const

export default function Sequence() {
  const { profile } = portfolio

  return (
    <>
      <section id="top" className="blueprint relative overflow-clip">
        <div className="mx-auto grid max-w-[1320px] items-center gap-x-16 gap-y-12 px-[clamp(20px,4vw,64px)] pt-[clamp(80px,14vh,150px)] pb-[clamp(48px,8vh,88px)] lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="eyebrow">
              <b>00</b> · Data &amp; AI Architect · Dallas–Fort Worth, TX
            </p>

            {/* Stat-Led: the figure is the largest element on the fold, and the
                headline completes its sentence rather than repeating it. */}
            <p
              className="stat__figure text-[clamp(3.6rem,11vw,8.5rem)]"
              aria-hidden="true"
            >
              500+ TiB
            </p>
            <h1 className="mt-3 max-w-[18ch] text-[clamp(1.9rem,4.4vw,3.4rem)]">
              <span className="sr-only">500+ TiB </span>of enterprise data&nbsp;
              <em className="verb">moved</em>&nbsp;onto <span className="proper">BigQuery</span>.
            </h1>

            <p className="lede mt-7 max-w-[58ch] text-[clamp(0.98rem,1.15vw,1.1rem)] leading-[1.62] text-ink-muted">
              Eleven years taking <span className="proper">Fortune 500</span> estates
              from mainframe and <span className="proper">Teradata</span>, through cloud
              modernization, into production <span className="proper">GenAI</span> — with
              the evaluation, guardrails and governance that turn a demo into a system.
            </p>

            {/* Three cells side by side once there is room; stacked rows below
                480px, where three columns of a serif figure plus a two-line
                label is unreadable. */}
            <ul className="mt-10 grid max-w-[46rem] grid-cols-1 border-t border-rule min-[480px]:grid-cols-3">
              {PROOF.map((item, i) => (
                <li
                  key={item.figure}
                  className={`py-5 pr-4 ${
                    i > 0
                      ? 'border-t border-rule min-[480px]:border-t-0 min-[480px]:border-l min-[480px]:pl-4 sm:min-[480px]:pl-6'
                      : ''
                  }`}
                >
                  <p className="stat__figure text-[clamp(1.6rem,3.4vw,2.9rem)]">{item.figure}</p>
                  <p className="stat__label mt-2 leading-[1.5]">{item.label}</p>
                  <p className="mt-1 font-mono text-[10px] leading-[1.5] text-ink-faint proper">
                    {item.source}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <a className="chip chip--primary" href={`mailto:${profile.email}`}>
                Open a conversation
              </a>
              <a className="chip" href="#systems">
                See the work
              </a>
              <a className="chip" href="/resume.html">
                Résumé
              </a>
            </div>
          </div>

          <div className="hidden justify-self-center lg:block">
            <Apparatus />
          </div>
        </div>
      </section>

      <MeterStrip />

      {/* ── The arc ──────────────────────────────────────────────────────
          Six chapters as a spec sheet. Hairline-separated rows, mono ordinal
          and era on the left, the chapter on the right. No pinning, no scrub. */}
      <section id="arc" className="relative scroll-mt-24 px-[clamp(20px,4vw,64px)] py-[clamp(64px,10vh,120px)]">
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
              Each chapter handed the next one its vocabulary. Reading COBOL in
              2015 is what made translating it with an LLM in 2024 tractable.
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
