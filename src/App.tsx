import { lazy, Suspense } from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Atmosphere from '@/components/Atmosphere'
import CustomCursor from '@/components/CustomCursor'

const Timeline = lazy(() => import('@/components/Timeline'))
const SkillsConstellation = lazy(() => import('@/components/SkillsConstellation'))
const Projects = lazy(() => import('@/components/Projects'))
const Metrics = lazy(() => import('@/components/Metrics'))
const Contact = lazy(() => import('@/components/Contact'))

function SectionFallback({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label={`Loading ${label}`}>
      <span className="hud-label animate-pulse">loading {label}…</span>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Atmosphere />
      <CustomCursor />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      <main id="main">
        <Hero />
        <Suspense fallback={<SectionFallback label="timeline" />}>
          <Timeline />
        </Suspense>
        <Suspense fallback={<SectionFallback label="skills" />}>
          <SkillsConstellation />
        </Suspense>
        <Suspense fallback={<SectionFallback label="projects" />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<SectionFallback label="impact" />}>
          <Metrics />
        </Suspense>
        <Suspense fallback={<SectionFallback label="contact" />}>
          <Contact />
        </Suspense>
      </main>
    </>
  )
}
