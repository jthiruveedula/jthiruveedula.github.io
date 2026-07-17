import { lazy, Suspense, useState } from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Atmosphere from '@/components/Atmosphere'
import EraWash from '@/components/EraWash'
import CustomCursor from '@/components/CustomCursor'
import ScrollProgress from '@/components/ScrollProgress'
import ProofMarquee from '@/components/ProofMarquee'
import SignalPath from '@/components/SignalPath'
import SectionSkeleton from '@/components/SectionSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import SmoothScroll from '@/components/SmoothScroll'
import LoadingIntro from '@/components/LoadingIntro'
import AudioToggle from '@/components/AudioToggle'

const Timeline = lazy(() => import('@/components/Timeline'))
const SkillsConstellation = lazy(() => import('@/components/SkillsConstellation'))
const OperatingModel = lazy(() => import('@/components/OperatingModel'))
const Projects = lazy(() => import('@/components/Projects'))
const Metrics = lazy(() => import('@/components/Metrics'))
const Contact = lazy(() => import('@/components/Contact'))

export default function App() {
  const [introDone, setIntroDone] = useState(false)

  return (
    <SmoothScroll>
      <LoadingIntro onComplete={() => setIntroDone(true)} />
      <Atmosphere />
      <EraWash />
      <CustomCursor />
      <ScrollProgress />
      <SignalPath />
      <AudioToggle />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
        <Navigation />
        <main id="main">
          <Hero introDone={introDone} />
          <ProofMarquee />
        <Suspense fallback={<SectionSkeleton variant="timeline" label="timeline" />}>
          <ErrorBoundary label="timeline">
            <Timeline />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="skills" label="skills" />}>
          <ErrorBoundary label="skills">
            <SkillsConstellation />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="approach" label="approach" />}>
          <ErrorBoundary label="approach">
            <OperatingModel />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="projects" label="projects" />}>
          <ErrorBoundary label="projects">
            <Projects />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="metrics" label="impact" />}>
          <ErrorBoundary label="impact">
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
