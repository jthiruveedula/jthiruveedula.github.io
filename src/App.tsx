import { lazy, Suspense } from 'react'
import Rail from '@/components/Rail'
import Flight from '@/components/Flight'
import Sequence from '@/components/Sequence'
import ScrollProgress from '@/components/ScrollProgress'
import SectionSkeleton from '@/components/SectionSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import SmoothScroll from '@/components/SmoothScroll'

const Timeline = lazy(() => import('@/components/Timeline'))
const Projects = lazy(() => import('@/components/Projects'))
const Skills = lazy(() => import('@/components/Skills'))
const Metrics = lazy(() => import('@/components/Metrics'))
const Contact = lazy(() => import('@/components/Contact'))

export default function App() {
  return (
    <SmoothScroll>
      <ScrollProgress />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Rail />
      {/* The rail is a fixed 4.25rem gutter on desktop and a top bar below
          1024px, so the page content is inset rather than overlapped. */}
      <main id="main" className="pt-16 lg:pt-0 lg:pl-[4.25rem]">
        <Flight />
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
