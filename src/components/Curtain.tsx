import { portfolio } from '@/data/portfolio'

const { profile } = portfolio

/**
 * The curtain — the film's last frame.
 *
 * The page used to end on a 12px colophon and then roughly half a viewport of
 * nothing. A document can end like that. A film cannot: the last thing on screen
 * is the thing the visitor leaves with, and half a screen of empty paper says the
 * page ran out rather than finished.
 *
 * So it closes on the plate it opened on. Returning to the first image is the
 * oldest ending there is, and here it is also literally true — the offer beside
 * it runs the flight again from the top. The colophon moved onto this frame
 * rather than being repeated below it.
 *
 * Same grammar as the act breaks: static plate, dissolved edges, the 46% horizon
 * the flight holds. Nothing here animates, and nothing here is load-bearing —
 * with styles or scripts missing it degrades to an image, a name and a link.
 */
export default function Curtain() {
  return (
    <footer className="curtain">
      <picture>
        <source
          type="image/avif"
          srcSet="/scenes/01-ingress@sm.avif 1280w, /scenes/01-ingress.avif 2048w"
          sizes="100vw"
        />
        <img
          src="/scenes/01-ingress@sm.avif"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </picture>

      <span aria-hidden="true" className="curtain__scrim" />
      <span aria-hidden="true" className="curtain__horizon" />

      <div className="curtain__inner">
        <p className="curtain__name proper">{profile.name}</p>
        <p className="curtain__line">Legacy → Cloud → Enterprise AI</p>
        <a href="#top" className="curtain__again chip">
          Run it again
        </a>
      </div>
    </footer>
  )
}
