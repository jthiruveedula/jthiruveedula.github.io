// Fixed, decorative-only ambience layer — scanlines, grain, era-colored aurora glows.
// Purely CSS-driven (see .atmosphere* in globals.css); zero JS animation cost.
export default function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__aurora" />
      <div className="atmosphere__scanlines" />
      <div className="atmosphere__grain" />
    </div>
  )
}
