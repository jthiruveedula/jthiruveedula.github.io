import { lazy, Suspense } from 'react'
import Rail from '@/components/Rail'
import Flight from '@/components/Flight'
import Sequence from '@/components/Sequence'
import ScrollProgress from '@/components/ScrollProgress'
import SectionSkeleton from '@/components/SectionSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import SmoothScroll from '@/components/SmoothScroll'
import Atmosphere from '@/components/Atmosphere'
import ActBreak from '@/components/ActBreak'

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
      <Atmosphere />
      {/* The rail is a fixed 4.25rem gutter on desktop and a top bar below
          1024px, so the page content is inset rather than overlapped. */}
      {/* z-1 lifts the document off the wash; the wash is the only thing at z-0. */}
      <main id="main" className="relative z-[1] pt-16 lg:pt-0 lg:pl-[4.25rem]">
        <Flight />
        <Sequence />
        <ActBreak plate="02-legacy-substrate" index="02" label="the ledger" />
        <Suspense fallback={<SectionSkeleton variant="timeline" label="timeline" />}>
          <ErrorBoundary label="timeline">
            <Timeline />
          </ErrorBoundary>
        </Suspense>
        <ActBreak plate="04-governed-realtime" index="03" label="systems" />
        <Suspense fallback={<SectionSkeleton variant="projects" label="systems" />}>
          <ErrorBoundary label="systems">
            <Projects />
          </ErrorBoundary>
        </Suspense>
        <ActBreak plate="05-translation-engine" index="04" label="the toolkit" />
        <Suspense fallback={<SectionSkeleton variant="skills" label="skills" />}>
          <ErrorBoundary label="skills">
            <Skills />
          </ErrorBoundary>
        </Suspense>
        <ActBreak plate="06-grounded-mind" index="05" label="the index" />
        <Suspense fallback={<SectionSkeleton variant="metrics" label="index" />}>
          <ErrorBoundary label="index">
            <Metrics />
          </ErrorBoundary>
        </Suspense>
        <ActBreak plate="07-whole-system" index="06" label="contact" />
        <Suspense fallback={<SectionSkeleton variant="contact" label="contact" />}>
          <ErrorBoundary label="contact">
            <Contact />
          </ErrorBoundary>
        </Suspense>
      </main>
    </SmoothScroll>
  )
}
