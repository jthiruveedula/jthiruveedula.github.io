# Next.js Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild jthiruveedula.github.io from scratch as a cinematic Next.js single-page portfolio with GSAP animations, Spline 3D placeholders, and Playwright E2E tests.

**Architecture:** Next.js 15 App Router with static export, Tailwind CSS, GSAP + ScrollTrigger for animations. Single-page layout with 9 sections composed in `app/page.tsx`. All content in `lib/data.ts`. Dark theme with slate/cyan/indigo palette.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, GSAP 3 + ScrollTrigger (npm), Lenis (smooth scroll), Playwright

---

### Task 1: Initialize Next.js Project & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `postcss.config.mjs`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "jthiruveedula-portfolio",
  "version": "3.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --host 127.0.0.1 --port 3000",
    "build": "next build",
    "lint": "next lint",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "dependencies": {
    "next": "^15.2.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "gsap": "^3.12.7",
    "lenis": "^1.2.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@tailwindcss/postcss": "^4.1.4",
    "@types/node": "^22.14.1",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "tailwindcss": "^4.1.4",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts**

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "export", images: { unoptimized: true } };
export default nextConfig;
```

- [ ] **Step 4: Create postcss.config.mjs**

```mjs
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

- [ ] **Step 5: Create app/globals.css**

```css
@import "tailwindcss";
@theme {
  --color-bg: #020617;
  --color-surface: #0f172a;
  --color-accent: #06b6d4;
  --color-accent-2: #6366f1;
  --color-proof: #34d399;
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
@layer base {
  html { scroll-behavior: smooth; background-color: #020617; }
  body { background-color: #020617; color: #f8fafc; font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
  ::selection { background-color: rgba(6, 182, 212, 0.2); }
}
@layer components {
  .section-eyebrow { font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 1rem; }
  .container { max-width: 1200px; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
  @media (min-width: 768px) { .container { padding-left: 1.5rem; padding-right: 1.5rem; } }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 6: Create app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Jagadeesh Thiruveedula — Data Architect | GCP & Generative AI",
  description: "Data Architect and Senior Data Engineer specializing in GCP, BigQuery optimization, and Generative AI in Corinth, Texas.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create directory structure**

```bash
mkdir -p components/sections components/ui hooks lib tests/e2e public/images
```

- [ ] **Step 8: Install and verify**

```bash
rm -rf node_modules package-lock.json && npm install && npx tsc --noEmit
```

Expected: No errors. Dev server starts with `npm run dev`.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: initialize Next.js project with Tailwind v4, GSAP, Playwright"
```

---

### Task 2: Data Layer (lib/data.ts)

**Files:**
- Create: `lib/data.ts`

- [ ] **Step 1: Create lib/data.ts with all portfolio content**

Includes interfaces for: `Project`, `Skill`, `Service`, `Testimonial`, `CaseStudy`, `SiteConfig` and exported data arrays:
- `siteConfig`: name, role, location, email, github, linkedin, bio paragraphs (4), hobbies
- `skills`: 9+ skills across 5 categories (Cloud, Data Engineering, AI/ML, Development, Finance)
- `skillCategories`: grouped skills with icon IDs
- `projects`: 6 real projects (dual-agent-platform, rag-pipeline, intraday-ops, policy-sop, gdrive-rag, openclaw-gemma)
- `caseStudies`: 2 deep dives (BigQuery optimization, Data warehouse modernization)
- `services`: 5 service offerings
- `testimonials`: 3 client quotes with 5-star ratings
- `certifications`: 4 professional certs

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit lib/data.ts && git add lib/data.ts && git commit -m "feat: add data layer with all portfolio content"
```

---

### Task 3: GSAP Animation Utilities

**Files:**
- Create: `lib/gsap-animations.ts`
- Create: `hooks/useMousePosition.ts`
- Create: `hooks/useScrollSection.ts`

- [ ] **Step 1: Create lib/gsap-animations.ts** with utilities:
  - `useReducedMotion()` — hook that checks `prefers-reduced-motion`
  - `staggerFadeIn(elements, options)` — GSAP stagger fade from y offset
  - `createScrollReveal(trigger, targets, options)` — ScrollTrigger timeline
  - `animateCounter(element, start, end, duration)` — GSAP count-up
  - `createHover3DTilt(element, options)` — mouse-follow 3D rotation on cards

- [ ] **Step 2: Create hooks/useMousePosition.ts** — returns `{x, y, normalizedX, normalizedY}`

- [ ] **Step 3: Create hooks/useScrollSection.ts** — takes section IDs, returns active section via IntersectionObserver

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit && git add lib/gsap-animations.ts hooks/ && git commit -m "feat: add GSAP utilities and custom hooks"
```

---

### Task 4: Navbar + Footer + UI Primitives

**Files:**
- Create: `components/Navbar.tsx`
- Create: `components/Footer.tsx`
- Create: `components/ui/CustomCursor.tsx`
- Create: `components/ui/ScrollProgress.tsx`

- [ ] **Step 1: Create `components/Navbar.tsx`**

Fixed top nav with: desktop links (Home, About, Skills, Projects, Contact), active section highlight via `useScrollSection`, LinkedIn button, mobile hamburger menu with fullscreen overlay, smooth scroll on click.

- [ ] **Step 2: Create `components/Footer.tsx`**

3-column grid: brand (JT_ logo, name, role, location), connect (LinkedIn, GitHub, Email), stack (Next.js, Tailwind, GSAP, Lenis). Copyright line with "Built with GSAP + Next.js" badge.

- [ ] **Step 3: Create `components/ui/CustomCursor.tsx`**

Custom cursor with two elements: small dot (cyan-400, mix-blend-difference) + larger ring follower (indigo border, 0.4s delayed tracking via GSAP). Scales up on hover over `a`, `button`, `[data-hoverable]` elements. Hidden on mobile/touch.

- [ ] **Step 4: Create `components/ui/ScrollProgress.tsx`**

Fixed 2px gradient bar at top of viewport, width tracks scroll percentage via `window.scrollY`, `transition: width 150ms linear`.

- [ ] **Step 5: Verify and commit**

```bash
npx tsc --noEmit --jsx react-jsx && git add components/ && git commit -m "feat: add Navbar, Footer, CustomCursor, ScrollProgress"
```

---

### Task 5: UI Primitives — SplineContainer + AnimatedCounter

**Files:**
- Create: `components/ui/SplineContainer.tsx`
- Create: `components/ui/AnimatedCounter.tsx`

- [ ] **Step 1: Create `components/ui/SplineContainer.tsx`**

3D placeholder container with mouse-follow perspective transform (rotateX/Y via `useMousePosition`). CSS fallback: concentric pulsing circles with indigo/cyan border rings layered with `animate-pulse` staggered delays. Props: `className`, `intensity` (default 20). `aria-hidden="true"`.

- [ ] **Step 2: Create `components/ui/AnimatedCounter.tsx`**

GSAP count-up animation triggered by ScrollTrigger (start: "top 85%"). Props: `end`, `suffix?`, `prefix?`, `duration?`, `className?`. Uses `gsap.fromTo` with `snap: { textContent: 1 }`.

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit --jsx react-jsx && git add components/ui/ && git commit -m "feat: add SplineContainer and AnimatedCounter UI components"
```

---

### Task 6: Hero Section

**Files:**
- Create: `components/sections/Hero.tsx`

- [ ] **Step 1: Create Hero section component**

Full-screen (min-h-svh) section with:
- SplineContainer background
- Eyebrow text: "DATA ARCHITECT · GCP & GENERATIVE AI"
- H1 with two split lines: "Architecting" / "Intelligent Data Systems" (second in cyan)
- Subtitle: value proposition paragraph
- Two CTAs: "View My Work" (cyan gradient, arrow icon) and "Contact Me" (outlined)
- Scroll indicator at bottom (mono "SCROLL" label + animated line)
- GSAP timeline on mount: lines stagger from `opacity:0, y:60, rotateX:-30`, subtitle fades, buttons stagger, scroll indicator fades. Respects `prefers-reduced-motion`.

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit --jsx react-jsx && git add components/sections/Hero.tsx && git commit -m "feat: add Hero section with GSAP animations"
```

---

### Task 7: About + Skills Sections

**Files:**
- Create: `components/sections/About.tsx`
- Create: `components/sections/Skills.tsx`

- [ ] **Step 1: Create `components/sections/About.tsx`**

Grid layout (3:2). Left: section eyebrow ("ABOUT"), title "GCP Data Architect based in Texas.", 4 bio paragraphs, hobby tags. Right: photo placeholder with mouse-follow 3D transform (perspective + rotateX/Y via useMousePosition). Location label at bottom. ScrollTrigger reveal on child elements.

- [ ] **Step 2: Create `components/sections/Skills.tsx`**

5 skill categories displayed as cards with:
- Category icon (SVG inline — cloud, database, brain, code, trending-up)
- Skill name badges with proficiency dots
- Hover 3D tilt via `createHover3DTilt` (scale 1.03, rotate 3deg)
- ScrollTrigger stagger fade reveal
- Responsive grid: 1 col mobile, 2 tablet, 3 desktop

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit --jsx react-jsx && git add components/sections/About.tsx components/sections/Skills.tsx && git commit -m "feat: add About and Skills sections"
```

---

### Task 8: Projects Section

**Files:**
- Create: `components/sections/Projects.tsx`

- [ ] **Step 1: Create Projects section**

Features:
- Filter buttons: All, AI, Data Engineering, Web Dev, Trading (active state with cyan underline)
- Masonry-style grid (2 cols desktop, 1 mobile)
- Each card: category badge, title, description, tech stack badges, metric with animated bar, GitHub link
- Hover: scale 1.02, border highlight
- ScrollTrigger stagger reveal on cards
- Filter animation: GSAP Flip-like approach — hide/show with opacity/scale transitions
- 6 projects from `lib/data.ts`

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit --jsx react-jsx && git add components/sections/Projects.tsx && git commit -m "feat: add Projects section with filters"
```

---

### Task 9: Case Studies Section

**Files:**
- Create: `components/sections/CaseStudies.tsx`

- [ ] **Step 1: Create Case Studies section**

2 deep dives displayed as stacked cards:
- Background & objectives, role, challenge, solution, results list
- Metric highlights with `AnimatedCounter` components (e.g., "60%" cost reduction, "3.2x" speed)
- Tech stack badges
- ScrollTrigger reveal per case study
- Architecture diagram placeholder (CSS grid/dots visualization)

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit --jsx react-jsx && git add components/sections/CaseStudies.tsx && git commit -m "feat: add Case Studies section"
```

---

### Task 10: Services + Social Proof + Contact Sections

**Files:**
- Create: `components/sections/Services.tsx`
- Create: `components/sections/SocialProof.tsx`
- Create: `components/sections/Contact.tsx`

- [ ] **Step 1: Create `components/sections/Services.tsx`**

5 service cards with icon SVGs, title, description. Hover: border color shift, translateY(-2px). ScrollTrigger stagger reveal. Grid: 1 col mobile, 2 tablet.

- [ ] **Step 2: Create `components/sections/SocialProof.tsx`**

Top: 3 testimonials with quote, name, title, star rating (5 stars each). Middle: certification badges in a row. Bottom: GitHub stats section with animated counters (placeholder values: "50+ repos", "1000+ commits").

- [ ] **Step 3: Create `components/sections/Contact.tsx`**

Two-column layout. Left: contact form (name, email, message fields — styled with slate-800 borders, focus:cyan ring). Submit button with hover glow. After submit: animated success message (scale-in checkmark). Right: direct links (email, GitHub, LinkedIn) with icons, location text (Corinth, Texas, DFW).

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit --jsx react-jsx && git add components/sections/ && git commit -m "feat: add Services, SocialProof, Contact sections"
```

---

### Task 11: Compose Page + Lenis Smooth Scroll

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Create `app/page.tsx`**

Import and compose all sections in order: Navbar, ScrollProgress, CustomCursor, Hero, About, Skills, Projects, CaseStudies, Services, SocialProof, Contact, Footer. Wrap in a Lenis-smooth-scrolled container.

Include client component for Lenis initialization:

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); };
  }, []);
  return null;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Static export succeeds, output in `out/` directory.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx && git commit -m "feat: compose all sections in page with Lenis smooth scroll"
```

---

### Task 12: Playwright E2E Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/portfolio.spec.ts`

- [ ] **Step 1: Create playwright.config.ts**

```ts
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:3000", headless: true },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "npm run dev", url: "http://127.0.0.1:3000", reuseExistingServer: true, timeout: 120_000 },
});
```

- [ ] **Step 2: Create tests/e2e/portfolio.spec.ts**

```ts
import { test, expect } from "@playwright/test";

test("hero section renders with key content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("DATA ARCHITECT")).toBeVisible();
  await expect(page.getByRole("heading", { name: /architecting/i })).toBeVisible();
  await expect(page.getByText("Enterprise data architecture")).toBeVisible();
  await expect(page.getByRole("link", { name: /view my work/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /contact me/i })).toBeVisible();
});

test("about section has bio and location", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About" }).click();
  await expect(page.getByText(/based in/i)).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Corinth, Texas")).toBeVisible();
});

test("skills section has category cards", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Skills" }).click();
  await expect(page.getByText("Cloud")).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Data Engineering")).toBeVisible();
  await expect(page.getByText("AI/ML")).toBeVisible();
});

test("projects section has filter and cards", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Projects" }).click();
  await expect(page.getByText("Dual-Agent Platform")).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("RAG Pipeline")).toBeVisible();
});

test("contact section has form and links", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Contact" }).click();
  await expect(page.getByText("Corinth, Texas")).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("GitHub")).toBeVisible();
  await expect(page.getByText("LinkedIn")).toBeVisible();
});

test("footer displays copyright and stack info", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await expect(footer.getByText("GSAP")).toBeVisible();
  await expect(footer.getByText("Next.js")).toBeVisible();
});
```

- [ ] **Step 3: Run tests**

```bash
npx playwright install chromium && npm run test:e2e
```

Expected: All 6 tests pass.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/ && git commit -m "test: add Playwright E2E tests for all sections"
```

---

### Task 13: Static Export & Build Verification

- [ ] **Step 1: Run full build**

```bash
rm -rf out && npm run build
```

Expected: `out/` directory contains static HTML, CSS, JS files. No client-side errors.

- [ ] **Step 2: Preview build**

```bash
npx serve out &
curl -s http://localhost:3000 | head -5
```

Expected: HTML page loads with all content.

- [ ] **Step 3: Commit final**

```bash
git add -A && git commit -m "chore: finalize build configuration for GitHub Pages deployment"
```
