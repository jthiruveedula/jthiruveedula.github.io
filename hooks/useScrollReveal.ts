"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR, STAGGER, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

type RevealOptions = {
  y?: number;
  x?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  start?: string;
  selector?: string;
  once?: boolean;
};

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  opts: RevealOptions = {}
) {
  const {
    y = 28,
    x = 0,
    scale = 1,
    opacity = 0,
    blur = 0,
    duration = DUR.base,
    ease = EASE.cinematic,
    stagger = STAGGER.cards,
    start = "top 82%",
    selector,
    once = true,
  } = opts;

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    if (prefersReducedMotion()) {
      gsap.set(selector ? scope.querySelectorAll(selector) : scope, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        filter: "blur(0px)",
      });
      return;
    }

    const targets = selector ? scope.querySelectorAll(selector) : scope;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity, y, x, scale, filter: blur ? `blur(${blur}px)` : "none" },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          filter: "blur(0px)",
          duration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: scope,
            start,
            toggleActions: once ? "play none none none" : "play none none reverse",
            invalidateOnRefresh: true,
          },
        }
      );
    }, scope);

    return () => ctx.revert();
  }, [ref, y, x, scale, opacity, blur, duration, ease, stagger, start, selector, once]);
}
