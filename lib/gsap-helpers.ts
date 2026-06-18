import gsap from "gsap";

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
