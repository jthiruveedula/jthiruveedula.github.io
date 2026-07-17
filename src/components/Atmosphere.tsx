import Particles from '@/components/Particles'
import ReadingLight from '@/components/ReadingLight'

// Fixed, decorative-only ambience layer — vignette, scanlines, grain, a
// drifting particle field (canvas), and a scroll-linked reading-light glow.
// Purely decorative; reduced-motion + touch render the still layers only.
export default function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__aurora" />
      <ReadingLight />
      <Particles />
      <div className="atmosphere__scanlines" />
      <div className="atmosphere__grain" />
      <div className="atmosphere__vignette" />
    </div>
  )
}
