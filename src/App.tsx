import { lazy, Suspense } from 'react'
import Rail from '@/components/Rail'
import Flight from '@/components/Flight'
import Sequence from '@/components/Sequence'
import ScrollProgress from '@/components/ScrollProgress'
import SectionSkeleton from '@/components/SectionSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import SmoothScroll from '@/components/SmoothScroll'
import Atmosphere from '@/components/Atmosphere'
import CommandPalette from '@/components/CommandPalette'

const Timeline = lazy(() => import('@/components/Timeline'))
const Projects = lazy(() => import('@/components/Projects'))
const Skills = lazy(() => import('@/components/Skills'))
const Metrics = lazy(() => import('@/components/Metrics'))
const Contact = lazy(() => import('@/components/Contact'))
const DustField = lazy(() => import('@/components/DustField'))

export default function App() {
  return (
    <SmoothScroll>
      <ScrollProgress />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Rail />
      <Atmosphere />
      <CommandPalette />
      {/* The nav is a floating pill that sits inside the flight's top letterbox
          bar, so the page runs full-bleed beneath it — no inset. */}
      {/* z-1 lifts the document off the wash; the wash is the only thing at z-0. */}
      <main id="main" tabIndex={-1} className="relative z-[1]">
        <Flight />
        <Suspense fallback={null}>
          <ErrorBoundary label="dust">
            <DustField />
          </ErrorBoundary>
        </Suspense>
        <Sequence />
        <Suspense fallback={<SectionSkeleton variant="timeline" label="timeline" />}>
          <ErrorBoundary label="timeline">
            <Timeline />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="projects" label="systems" />}>
          <ErrorBoundary label="systems">
            <Projects />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="skills" label="skills" />}>
          <ErrorBoundary label="skills">
            <Skills />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="metrics" label="index" />}>
          <ErrorBoundary label="index">
            <Metrics />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="contact" label="contact" />}>
          <ErrorBoundary label="contact">
            <Contact />
          </ErrorBoundary>
        </Suspense>
      </main>
    </SmoothScroll>
  )
}
