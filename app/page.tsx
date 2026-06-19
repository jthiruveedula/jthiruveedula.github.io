"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";
import PageReveal from "@/components/ui/PageReveal";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import ExperienceTimeline from "@/components/sections/ExperienceTimeline";
import Skills from "@/components/sections/Skills";
import ArchPipeline from "@/components/sections/ArchPipeline";
import Projects from "@/components/sections/Projects";
import CaseStudies from "@/components/sections/CaseStudies";
import Services from "@/components/sections/Services";
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

  return (
    <div ref={containerRef} id="smooth-wrapper" style={{ overflow: "hidden", width: "100%", height: "100%" }}>
      <div data-scroll-content>
        <ScrollProgress />
        <Navbar />
        <main id="main" tabIndex={-1} className="relative z-10 min-h-screen pt-24 md:pt-24">
          <PageReveal>
            <Hero />
          </PageReveal>
          <About />
          <ExperienceTimeline />
          <Skills />
          <ArchPipeline />
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
