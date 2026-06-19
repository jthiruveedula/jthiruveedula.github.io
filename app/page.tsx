"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { soundManager } from "@/lib/soundManager";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";
import CustomCursor from "@/components/ui/CustomCursor";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import FilmGrainOverlay from "@/components/ui/FilmGrainOverlay";
import AmbientOrbs from "@/components/ui/AmbientOrbs";
import ThreeBackground from "@/components/ui/ThreeBackground";
import SoundControl from "@/components/ui/SoundControl";
import PageReveal from "@/components/ui/PageReveal";
import Hero from "@/components/sections/Hero";
import ProfessionalMetrics from "@/components/sections/ProfessionalMetrics";
import About from "@/components/sections/About";
import ExperienceTimeline from "@/components/sections/ExperienceTimeline";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import CaseStudies from "@/components/sections/CaseStudies";
import Services from "@/components/sections/Services";
import ArchPipeline from "@/components/sections/ArchPipeline";
import Contact from "@/components/sections/Contact";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function SmoothScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper: containerRef.current!,
      content: "[data-scroll-content]",
      smooth: 1.2,
      effects: true,
      smoothTouch: 0.1,
    });

    return () => {
      smoother.kill();
    };
  }, []);

  useEffect(() => {
    const init = () => {
      soundManager.init();
      window.removeEventListener("click", init);
      window.removeEventListener("touchstart", init);
    };
    window.addEventListener("click", init, { once: true });
    window.addEventListener("touchstart", init, { once: true });
    return () => {
      window.removeEventListener("click", init);
      window.removeEventListener("touchstart", init);
    };
  }, []);

  return (
    <div ref={containerRef} id="smooth-wrapper" style={{ overflow: "hidden", width: "100%", height: "100%" }}>
      <div data-scroll-content>
        <ThreeBackground />
        <ScrollProgress />
        <CustomCursor />
        <ThemeSwitcher />
        <FilmGrainOverlay />
        <AmbientOrbs />
        <SoundControl />
        <Navbar />
        <main id="main" tabIndex={-1} className="relative z-10 min-h-screen pt-14">
          {/* UPGRADE: PageReveal wrapper drives Hero entrance sequence */}
          <PageReveal>
            <Hero />
          </PageReveal>
          <ArchPipeline />
          <ProfessionalMetrics />
          <About />
          <Skills />
          <ExperienceTimeline />
          <Projects />
          <CaseStudies />
          <Services />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function Home() {
  return <SmoothScroll />;
}
