import gsap from "gsap";
import { EASE, DUR } from "@/lib/motion";

export function createHover3DTilt(
  element: HTMLElement,
  options?: { scale?: number; maxTilt?: number; duration?: number }
) {
  const { scale = 1.03, maxTilt = 5, duration = DUR.base } = options || {};

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(element, {
      rotationX: -y * maxTilt,
      rotationY: x * maxTilt,
      scale,
      transformPerspective: 800,
      duration,
      ease: EASE.soft,
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.3,
      ease: EASE.cinematic,
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

export function batchTransform(
  element: HTMLElement,
  properties: Partial<
    Pick<
      gsap.TweenVars,
      | "x"
      | "y"
      | "z"
      | "rotation"
      | "rotationX"
      | "rotationY"
      | "rotationZ"
      | "scale"
      | "scaleX"
      | "scaleY"
      | "skew"
      | "skewX"
      | "skewY"
      | "opacity"
    >
  >,
  duration?: number
) {
  return gsap.to(element, {
    overwrite: "auto",
    duration: duration || 0.3,
    ease: EASE.soft,
    ...properties,
  });
}

export function createSharedTimeline(
  trigger?: Element | string,
  defaults?: gsap.TimelineVars
) {
  return gsap.timeline(defaults);
}
