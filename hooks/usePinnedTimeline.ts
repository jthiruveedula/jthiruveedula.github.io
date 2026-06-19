"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

type BuildTimeline = (self: {
  timeline: gsap.core.Timeline;
  scope: HTMLElement;
}) => void | (() => void);

type PinnedTimelineOptions = {
  scope: RefObject<HTMLElement | null>;
  pin: RefObject<HTMLElement | null>;
  end?: string | number;
  scrub?: number | boolean;
  start?: string;
  pinSpacing?: boolean;
  anticipatePin?: number;
  build: BuildTimeline;
};

export function usePinnedTimeline({
  scope,
  pin,
  end = "+=600",
  scrub = 1,
  start = "top top",
  pinSpacing = true,
  anticipatePin = 1,
  build,
}: PinnedTimelineOptions) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const scopeEl = scope.current;
    const pinEl = pin.current;
    if (!scopeEl || !pinEl) return;
    if (prefersReducedMotion()) return;

    let st: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scopeEl,
          start,
          end,
          scrub,
          pin: pinEl,
          pinSpacing,
          anticipatePin,
          onLeaveBack: () => timeline.progress(0),
        },
      });
      const inner = build({ timeline, scope: scopeEl });
      st = timeline.scrollTrigger ?? null;
      if (typeof inner === "function") cleanupRef.current = inner;
    }, scopeEl);

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      ctx.revert();
      st?.kill();
    };
  }, [scope, pin, end, scrub, start, pinSpacing, anticipatePin, build]);
}
