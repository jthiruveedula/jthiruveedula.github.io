import { lazy, Suspense, useState } from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Atmosphere from '@/components/Atmosphere'
import EraWash from '@/components/EraWash'
import CustomCursor from '@/components/CustomCursor'
import ScrollProgress from '@/components/ScrollProgress'
import SignalPath from '@/components/SignalPath'
import SectionSkeleton from '@/components/SectionSkeleton'
import SmoothScroll from '@/components/SmoothScroll'
import LoadingIntro from '@/components/LoadingIntro'
import AudioToggle from '@/components/AudioToggle'

const Timeline = lazy(() => import('@/components/Timeline'))
const SkillsConstellation = lazy(() => import('@/components/SkillsConstellation'))
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
        <Suspense fallback={<SectionSkeleton variant="timeline" label="timeline" />}>
          <Timeline />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="skills" label="skills" />}>
          <SkillsConstellation />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="projects" label="projects" />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="metrics" label="impact" />}>
          <Metrics />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="contact" label="contact" />}>
          <Contact />
        </Suspense>
      </main>
    </SmoothScroll>
  )
}
