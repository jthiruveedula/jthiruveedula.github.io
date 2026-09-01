import type { ReactElement, ReactNode } from 'react'

/**
 * Themed skeleton placeholders for lazy-loaded sections.
 *
 * Instead of a generic "loading…" pulse, each variant mirrors the final
 * section's layout so the page keeps its structure while chunks stream in.
 * Shimmer bands move across the HUD surfaces to signal activity.
 */

type SkeletonVariant = 'timeline' | 'skills' | 'projects' | 'metrics' | 'contact'

function Shimmer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton-shimmer block rounded ${className ?? ''}`}
    />
  )
}

function HeaderBlock() {
  return (
    <div className="max-w-3xl space-y-4">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-10 w-4/5 md:h-14" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-5/6" />
    </div>
  )
}

function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-panel-edge/60 bg-panel/40 p-5 md:p-6 ${className ?? ''}`}>
      {children}
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
      <HeaderBlock />
      <div className="relative mt-16 md:mt-20">
        <div className="pointer-events-none absolute inset-y-0 left-5 w-0.5 -translate-x-1/2 bg-panel-edge/70 md:left-1/2" />
        <div className="space-y-10 md:space-y-14">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`relative pl-14 md:w-[calc(50%-3rem)] ${
                i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
              }`}
            >
              <span className="absolute top-6 left-5 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-void bg-panel-edge md:left-1/2" />
              <GlassCard className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Shimmer className="h-5 w-20" />
                  <Shimmer className="h-4 w-32" />
                </div>
                <Shimmer className="h-6 w-3/4" />
                <Shimmer className="h-4 w-1/2" />
                <div className="flex flex-wrap gap-2 pt-2">
                  <Shimmer className="h-8 w-24" />
                  <Shimmer className="h-8 w-28" />
                  <Shimmer className="h-8 w-20" />
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SkillsSkeleton() {
  return (
    <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <HeaderBlock />
      <div className="mt-10 h-[420px] overflow-hidden rounded-2xl border border-panel-edge/60 bg-panel/30 md:h-[540px]">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Shimmer className="mx-auto h-12 w-48" />
            <Shimmer className="mx-auto mt-4 h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap gap-2">
        {Array.from({ length: 18 }).map((_, i) => (
          <Shimmer key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
    </div>
  )
}

function ProjectsSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
      <HeaderBlock />
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-4 w-28" />
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="space-y-4">
            <div className="flex items-center justify-between">
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="h-4 w-24" />
            </div>
            <Shimmer className="h-7 w-3/4" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-5/6" />
            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-panel-edge/40 bg-panel/50">
              <Shimmer className="h-full w-full rounded-none" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Shimmer className="h-6 w-16" />
              <Shimmer className="h-6 w-20" />
              <Shimmer className="h-6 w-14" />
              <Shimmer className="h-6 w-18" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
      <HeaderBlock />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="rounded-xl border border-panel-edge/60 bg-panel/40 p-5 md:p-6">
            <Shimmer className="ml-auto h-9 w-9 rounded-full" />
            <Shimmer className="mt-3 h-10 w-2/3" />
            <Shimmer className="mt-3 h-3 w-1/2" />
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <Shimmer className="h-3 w-32" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-7 w-28 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactSkeleton() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center px-6 pt-28 pb-20 md:pt-36">
      <Shimmer className="h-4 w-48" />
      <Shimmer className="mt-5 h-14 w-4/5 md:h-20" />
      <Shimmer className="mt-6 h-4 w-full" />
      <Shimmer className="mt-2 h-4 w-3/4" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="space-y-3">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-5 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

const VARIANTS: Record<SkeletonVariant, () => ReactElement> = {
  timeline: TimelineSkeleton,
  skills: SkillsSkeleton,
  projects: ProjectsSkeleton,
  metrics: MetricsSkeleton,
  contact: ContactSkeleton,
}

interface SectionSkeletonProps {
  variant: SkeletonVariant
  label: string
}

export default function SectionSkeleton({ variant, label }: SectionSkeletonProps) {
  const Skeleton = VARIANTS[variant]
  return (
    <section
      className="relative overflow-hidden"
      role="status"
      aria-label={`Loading ${label}`}
      aria-busy="true"
    >
      <Skeleton />
    </section>
  )
}
