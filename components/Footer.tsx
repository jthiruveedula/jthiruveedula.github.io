import { siteConfig } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-16" style={{ borderColor: "var(--color-glass-border)", backgroundColor: "var(--color-bg)" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-10 md:gap-6 mb-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline">
              <span className="font-mono text-xl font-semibold" style={{ color: "var(--color-accent)" }}>JT</span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{siteConfig.name}</p>
            <p className="font-mono text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {siteConfig.role}
              <br />
              {siteConfig.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--color-text-muted)" }}>Connect</p>
            <div className="flex flex-col gap-2">
              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener"
                className="font-mono text-sm transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
              >
                LinkedIn ↗
              </a>
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener"
                className="font-mono text-sm transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
              >
                GitHub ↗
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-mono text-sm transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
              >
                Email ↗
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--color-text-muted)" }}>Stack</p>
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>Next.js · Tailwind · GSAP + ScrollTrigger</span>
              <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>Lenis · Playwright</span>
              <span className="font-mono text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>{siteConfig.location}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3" style={{ borderColor: "var(--color-glass-border)" }}>
          <p className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            © {year} {siteConfig.name} · All rights reserved
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            Built on Next.js · Deployed on GitHub Pages · Animations by GSAP
          </p>
        </div>
      </div>
    </footer>
  );
}
