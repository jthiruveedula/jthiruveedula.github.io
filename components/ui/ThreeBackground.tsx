"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 400);
    camera.position.set(0, 0, 70);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const neonCyan = new THREE.Color("#00f0ff");

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.SphereGeometry(8, 24, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: neonCyan,
      wireframe: true,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(core);

    const ring1Geo = new THREE.TorusGeometry(13, 0.08, 8, 200);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: neonCyan,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.z = 0.5;
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(17, 0.06, 8, 200);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: neonCyan,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = 0.35;
    ring2.rotation.z = -0.6;
    coreGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(11, 0.05, 8, 160);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: neonCyan,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = -0.5;
    ring3.rotation.y = 0.4;
    coreGroup.add(ring3);

    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!reducedMotion) {
        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;

        coreGroup.rotation.y += 0.0015;
        coreGroup.rotation.x += 0.0004;
        ring1.rotation.z += 0.0003;
        ring2.rotation.z -= 0.0002;
        ring3.rotation.x += 0.0003;

        camera.position.x += (mouseX * 8 - camera.position.x) * 0.03;
        camera.position.y += (mouseY * 5 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
