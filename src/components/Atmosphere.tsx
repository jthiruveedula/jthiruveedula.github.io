import Particles from '@/components/Particles'

// Fixed, decorative-only ambience layer — vignette, scanlines, grain, and
// era-colored aurora glows (CSS) plus a drifting particle field (canvas).
// Purely decorative; reduced-motion + touch render nothing but the still layers.
export default function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__aurora" />
      <Particles />
      <div className="atmosphere__scanlines" />
      <div className="atmosphere__grain" />
      <div className="atmosphere__vignette" />
    </div>
  )
}
