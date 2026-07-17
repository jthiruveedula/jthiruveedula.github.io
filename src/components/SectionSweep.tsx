import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/hooks';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function SectionSweep() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const bar = ref.current.querySelector<HTMLElement>('.section-sweep__bar');
      if (!bar) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
      });
      tl.fromTo(
        bar,
        { scaleX: 0, opacity: 1, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.55, ease: 'power3.out' },
      ).to(bar, { opacity: 0, duration: 0.45, ease: 'power1.in' }, '>0.05');
    },
    { scope: ref, dependencies: [reduced] },
  );

  if (reduced) return null;

  return (
    <div ref={ref} className="section-sweep" aria-hidden="true">
      <span className="section-sweep__bar" />
    </div>
  );
}
