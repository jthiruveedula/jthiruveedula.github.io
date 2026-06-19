"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  stagger?: number;
  triggerOnScroll?: boolean;
  onComplete?: () => void;
}

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export default function ScrambleText({
  text,
  className = "",
  style,
  duration = 1.5,
  stagger = 0.04,
  triggerOnScroll = false,
  onComplete,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }

    const chars = text.split("");
    const spans: HTMLSpanElement[] = [];

    el.innerHTML = "";
    chars.forEach(() => {
      const span = document.createElement("span");
      span.textContent = " ";
      span.style.display = "inline-block";
      span.style.minWidth = "1ch";
      span.style.textAlign = "center";
      el.appendChild(span);
      spans.push(span);
    });

    const ctx = gsap.context(() => {
      let completed = 0;
      const total = spans.filter((_, i) => text[i] !== " ").length;

      spans.forEach((span, i) => {
        if (text[i] === " ") {
          span.textContent = " ";
          completed++;
          if (completed >= total) onCompleteRef.current?.();
          return;
        }

        const obj = { progress: 0 };

        gsap.to(obj, {
          progress: 1,
          duration,
          ease: "power3.out",
          delay: i * stagger,
          onUpdate: () => {
            if (obj.progress < 0.8) {
              span.textContent = randomChar();
            } else {
              span.textContent = text[i];
            }
          },
          onComplete: () => {
            span.textContent = text[i];
            completed++;
            if (completed >= total) onCompleteRef.current?.();
          },
          scrollTrigger: triggerOnScroll
            ? {
                trigger: el,
                start: "top 85%",
              }
            : undefined,
        });
      });
    }, ref);

    return () => ctx.revert();
  }, [text, duration, stagger, triggerOnScroll]);

  return (
    <span ref={ref} className={className} style={style}>
      {text}
    </span>
  );
}
