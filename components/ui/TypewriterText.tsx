"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface TypewriterTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  stagger?: number;
  showCursor?: boolean;
  triggerOnScroll?: boolean;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  className = "",
  style,
  duration = 1.2,
  stagger = 0.04,
  showCursor = true,
  triggerOnScroll = false,
  onComplete,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
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

    let cursorEl: HTMLSpanElement | null = null;
    if (showCursor) {
      cursorEl = document.createElement("span");
      cursorEl.textContent = "|";
      cursorEl.style.display = "inline-block";
      cursorEl.style.marginLeft = "2px";
      cursorEl.style.opacity = "1";
      cursorEl.style.animation = "typewriter-blink 0.8s step-end infinite";
      el.appendChild(cursorEl);
    }

    const ctx = gsap.context(() => {
      let completed = 0;
      const total = spans.filter((_, i) => text[i] !== " ").length;

      spans.forEach((span, i) => {
        if (text[i] === " ") {
          span.textContent = "\u00A0";
          completed++;
          if (completed >= total) {
            if (cursorEl) {
              gsap.to(cursorEl, {
                opacity: 0,
                duration: 0.3,
                delay: 0.2,
                onComplete: () => onCompleteRef.current?.(),
              });
            } else {
              onCompleteRef.current?.();
            }
          }
          return;
        }

        gsap.fromTo(
          span,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.01,
            delay: i * stagger,
            onComplete: () => {
              span.textContent = text[i];
              completed++;
              if (completed >= total) {
                if (cursorEl) {
                  gsap.to(cursorEl, {
                    opacity: 0,
                    duration: 0.3,
                    delay: 0.2,
                    onComplete: () => onCompleteRef.current?.(),
                  });
                } else {
                  onCompleteRef.current?.();
                }
              }
            },
            scrollTrigger: triggerOnScroll
              ? {
                  trigger: el,
                  start: "top 85%",
                }
              : undefined,
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [text, duration, stagger, showCursor, triggerOnScroll]);

  return (
    <>
      <style>{`
        @keyframes typewriter-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      <span ref={ref} className={className} style={style}>
        {text}
      </span>
    </>
  );
}
