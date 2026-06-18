# Portfolio Redesign: Cinematic Next.js Portfolio

## Goal
Rebuild jthiruveedula.github.io from scratch as a cinematic, single-page Next.js portfolio showcasing Jagadeesh Thiruveedula's expertise as a Data Architect / Senior Data Engineer specializing in GCP and Generative AI.

## Creative Direction
- Dark-mode first, cinematic, visual storytelling
- Motion-led: GSAP ScrollTrigger-driven reveals, SplitType text animations, custom cursor, mouse-follow parallax
- 3D elements via Spline placeholders with CSS 3D transform fallbacks
- Color: slate-950 base, cyan-500 primary accent, indigo-500 secondary, emerald-400 for proof metrics
- Typography: Inter (UI) + JetBrains Mono (code/labels)
- Emotional tone: Cutting-edge, authoritative yet welcoming, sophisticated

## Tech Stack
- **Framework**: Next.js 15 (App Router, static export)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v3 with custom dark theme tokens
- **Animations**: GSAP 3 + ScrollTrigger + SplitType
- **Testing**: Playwright for E2E
- **3D**: Spline viewer placeholders with CSS canvas/transform fallbacks
- **Deployment**: GitHub Pages via `next export`

## Site Architecture

```
app/
  layout.tsx          — <html>, fonts, Navbar, Footer, GSAP/SplitType CDN, Lenis smooth scroll
  page.tsx            — imports all section components in order
  globals.css         — Tailwind directives, custom CSS variables, prefers-reduced-motion
components/
  sections/
    Hero.tsx          — Full-screen, role/value prop, 3D bg, CTAs, scroll indicator
    About.tsx         — Bio paragraphs, TX location, photo with mouse-follow parallax
    Skills.tsx        — 5 category cards with 3D tilt hover, GSAP stagger reveal
    Projects.tsx      — Masonry grid, filter tabs, hover zoom, GitHub links, case study details
    CaseStudies.tsx   — 2-3 deep dives: architecture diagrams, challenge/solution/results, metric bars
    Services.tsx      — Consulting service cards with icon animations
    SocialProof.tsx   — Testimonials (2-3), GitHub stats counters, certifications
    Contact.tsx       — Form, email, GitHub, LinkedIn, DFW location, animated success
    Footer.tsx        — Links, copyright, "Built with GSAP + Spline" badge
  ui/
    Navbar.tsx              — Fixed top, active section highlight, mobile hamburger
    SplineContainer.tsx     — 3D placeholder div with mouse tracking + CSS fallback
    AnimatedCounter.tsx     — GSAP count-up animation
    CustomCursor.tsx        — Mouse follower, changes on hoverable elements
    ScrollProgress.tsx      — Thin gradient bar at top
    ProjectFilter.tsx       — Category toggle buttons
    TestimonialCard.tsx     — Quote, name, title, star rating
    ServiceCard.tsx         — Icon, title, description, hover effect
    SkillCard.tsx           — 3D tilt on hover, category color coding
    MetricBar.tsx           — Animated bar with label
    CTASection.tsx          — Reusable CTA block
hooks/
  useMousePosition.ts
  useScrollSection.ts
  useReducedMotion.ts
lib/
  gsap-animations.ts   — Reusable timeline factories
  data.ts              — All content data (bio, projects, skills, services, etc.)
tests/
  e2e/
    portfolio.spec.ts  — Playwright tests for hero, sections, navigation, mobile
```

## Sections Detail

### 1. Hero
- Full-screen (100svh)
- Animated text reveal with SplitType character stagger
- Title: "Data Architect | GCP + Generative AI"
- Subtitle value proposition
- Two CTAs: "View My Work" (primary) → scrolls to projects, "Contact Me" (secondary) → scrolls to contact
- Spline 3D placeholder background with mouse-follow movement
- Scroll-down bounce indicator
- Custom cursor init

### 2. About
- 3-4 paragraph professional biography
- Core skills as animated cards that scale/flip on hover
- Photo with GSAP mouse-follow parallax effect
- Personal touch: hobbies (Telugu movies, Netflix, YouTube)

### 3. Skills & Expertise
- 5 categories: Cloud, Data Engineering, AI/ML, Development, Finance
- Each card has 3D tilt on hover (GSAP quickTo), scale, color shift
- Category icons with hover animation
- Spline 3D placeholders for each category

### 4. Projects
- Masonry grid layout
- Filter by: AI, Data Engineering, Web Dev, Trading
- Cards: title, description, tech badges, GitHub link
- Hover zoom (scale 1.05)
- GSAP ScrollTrigger stagger fade-in
- Spline bg elements that rotate on scroll

### 5. Case Studies
- 2-3 deep dives with:
  - Background and objectives
  - Role and contributions
  - Architecture diagrams (CSS/SVG animated)
  - Challenges and solutions
  - Results/metrics (BigQuery optimization %, cost savings)
- ScrollTrigger reveal for each section
- Expandable code snippets

### 6. Services
- GCP Data Architecture consulting
- BigQuery optimization
- Generative AI development
- Cloud cost optimization
- Trading bot implementation
- Icon card animations on hover

### 7. Social Proof
- 2-3 client testimonials with star ratings
- GitHub stats animated counters (stars, commits, repos)
- Certifications with badge animations

### 8. Contact
- Form: name, email, message
- Contact info: email, GitHub, LinkedIn
- Social icons with hover transitions
- Location: Texas, DFW
- Animated success state on submission

### 9. Footer
- Navigation links
- Copyright
- Social links
- "Built with GSAP + Spline" badge

## Animation Specifications

### GSAP Animations
- Text reveals: SplitType character splitting + stagger
- ScrollTrigger: section-based with start "top 80%", end "bottom 20%"
- Hover: scale(1.05), rotate(2deg), color transitions, power2.out
- Mouse-follow parallax on background elements
- Stagger animations for grid items (stagger: 0.05)
- Flip plugin for layout changes
- Fade-in with autoAlpha

### Mouse Interactions
- Custom cursor that changes on hoverable elements
- Hover zoom on images (scale 1.1/1.0 toggle)
- Mouse-follow parallax on backgrounds
- 3D tilt on skill cards via mouse position
- Scroll-based progress indicator

### Spline 3D Placeholder
- Container div with CSS 3D perspective
- Mouse tracking updates transform: rotateX/Y
- Fallback: animated CSS gradients or canvas particles
- Documented Spline embed instructions

## Responsive Breakpoints
- Mobile-first
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px
- Navbar collapses to hamburger at md breakpoint
- Grid columns adjust: 1 (mobile) → 2 (tablet) → 3 (desktop)

## Performance & Accessibility
- prefers-reduced-motion respected throughout
- Lazy-loading for below-fold content
- Semantic HTML with proper ARIA landmarks
- Keyboard navigation support
- Optimized image loading (next/image patterns)
- Meta tags for SEO

## Deployment
- Static export via next.config.ts `output: 'export'`
- Deploy to GitHub Pages
- All assets self-hosted, no external dependencies at runtime (except GSAP/SplitType CDN)

## Customization Points
- Edit `lib/data.ts` for all content: bio, projects, skills, services, testimonials
- Replace SplineContainer.tsx with actual Spline embed URLs
- Replace placeholder images in public/
- Update contact form endpoint
- Update social links in data.ts
