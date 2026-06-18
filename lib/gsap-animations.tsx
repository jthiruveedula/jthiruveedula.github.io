"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useReducedMotion(): boolean {
  const mql = useRef<MediaQueryList | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    mql.current = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mql.current.matches;
    const handler = (e: MediaQueryListEvent) => { reduced.current = e.matches; };
    mql.current.addEventListener("change", handler);
    return () => mql.current?.removeEventListener("change", handler);
  }, []);

  return reduced.current;
}

export function staggerFadeIn(
  elements: gsap.TweenTarget,
  options?: { y?: number; delay?: number; stagger?: number; duration?: number; ease?: string }
) {
  const { y = 30, delay = 0, stagger = 0.08, duration = 0.7, ease = "power3.out" } = options || {};
  gsap.from(elements, {
    opacity: 0,
    y,
    duration,
    delay,
    stagger,
    ease,
    overwrite: "auto",
  });
}

export function createScrollReveal(
  trigger: string | Element,
  targets: gsap.TweenTarget,
  options?: {
    start?: string;
    end?: string;
    y?: number;
    stagger?: number;
    duration?: number;
    ease?: string;
    scrub?: boolean | number;
  }
) {
  const { start = "top 80%", end = "bottom 20%", y = 40, stagger = 0.08, duration = 0.7, ease = "power3.out", scrub = false } = options || {};

  return gsap.from(targets, {
    opacity: 0,
    y,
    duration,
    stagger,
    ease,
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub: scrub as any,
      invalidateOnRefresh: true,
    },
  });
}

export function animateCounter(
  element: HTMLElement | null,
  start: number,
  end: number,
  duration: number = 2
) {
  if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (element) element.textContent = String(end);
    return;
  }

  gsap.fromTo(
    element,
    { textContent: start },
    {
      textContent: end,
      duration,
      ease: "power2.out",
      snap: { textContent: 1 },
      overwrite: "auto",
    }
  );
}

export function createHover3DTilt(
  element: HTMLElement,
  options?: { scale?: number; maxTilt?: number; duration?: number }
) {
  const { scale = 1.03, maxTilt = 5, duration = 0.4 } = options || {};

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(element, {
      rotationX: -y * maxTilt * 2,
      rotationY: x * maxTilt * 2,
      scale,
      transformPerspective: 800,
      duration: duration,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  element.addEventListener("mousemove", handleMouseMove, { passive: true });
  element.addEventListener("mouseleave", handleMouseLeave, { passive: true });

  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseleave", handleMouseLeave);
  };
}

export function useScrollAnimation(options?: {
  trigger?: string;
  targets?: string;
  y?: number;
  stagger?: number;
  duration?: number;
  scrub?: boolean | number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const triggerEl = options?.trigger ? ref.current?.querySelector(options.trigger) : ref.current;
      const targets = options?.targets ? ref.current?.querySelectorAll(options.targets) : ref.current?.children;

      if (triggerEl && targets?.length) {
        createScrollReveal(triggerEl, targets as any, options);
      }
    }, ref);

    return () => ctx.revert();
  }, [options]);

  return ref;
}
