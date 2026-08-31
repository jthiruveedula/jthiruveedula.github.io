import { lazy, Suspense } from 'react'
import Header from '@/components/Header'
import Sequence from '@/components/Sequence'
import ScrollProgress from '@/components/ScrollProgress'
import SectionSkeleton from '@/components/SectionSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import SmoothScroll from '@/components/SmoothScroll'

const Timeline = lazy(() => import('@/components/Timeline'))
const Projects = lazy(() => import('@/components/Projects'))
const Metrics = lazy(() => import('@/components/Metrics'))
const Contact = lazy(() => import('@/components/Contact'))

export default function App() {
  return (
    <SmoothScroll>
      <ScrollProgress />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main">
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
