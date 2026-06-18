import { siteConfig } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/60 bg-slate-950 py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-10 md:gap-6 mb-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline">
              <span className="font-mono text-xl font-semibold text-indigo-400">JT</span>
            </div>
            <p className="text-sm text-slate-300 mt-1">{siteConfig.name}</p>
            <p className="font-mono text-xs text-slate-500 leading-relaxed">
              {siteConfig.role}
              <br />
              {siteConfig.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-slate-600 tracking-widest uppercase">Connect</p>
            <div className="flex flex-col gap-2">
              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener"
                className="font-mono text-sm text-slate-400 hover:text-indigo-300 transition-colors"
              >
                LinkedIn ↗
              </a>
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener"
                className="font-mono text-sm text-slate-400 hover:text-indigo-300 transition-colors"
              >
                GitHub ↗
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-mono text-sm text-slate-400 hover:text-indigo-300 transition-colors"
              >
                Email ↗
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-slate-600 tracking-widest uppercase">Stack</p>
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs text-slate-500">Next.js · Tailwind · GSAP + ScrollTrigger</span>
              <span className="font-mono text-xs text-slate-500">Lenis · Playwright</span>
              <span className="font-mono text-xs text-slate-600 mt-2">{siteConfig.location}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-mono text-xs text-slate-600">
            © {year} {siteConfig.name} · All rights reserved
          </p>
          <p className="font-mono text-xs text-slate-700">
            Built on Next.js · Deployed on GitHub Pages · Animations by GSAP
          </p>
        </div>
      </div>
    </footer>
  );
}
