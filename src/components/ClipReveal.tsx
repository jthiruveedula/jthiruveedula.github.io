import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/lib/hooks'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function ClipReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion || !ref.current) return

    gsap.fromTo(
      ref.current,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          once: true,
        },
      },
    )
  }, { dependencies: [reducedMotion], revertOnUpdate: true })

  if (reducedMotion) return <>{children}</>

  return (
    <div ref={ref} style={{ clipPath: 'inset(100% 0% 0% 0%)' }}>
      {children}
    </div>
  )
}
