# Cinematic Glassmorphism & Film Grade Theme System

## Overview
Upgrade jthiruveedula.github.io from basic GSAP animations to a cinematic, glassmorphism-based experience with 4 switchable film grade themes, continuous motion flow, and polished UI/UX.

## Theme System

### Film Grade Moods
4 color themes driven by CSS custom properties, toggled via a floating button on the right side:

| Mood | Background | Accent | Vibe |
|------|-----------|--------|------|
| **Noir** | Slate-950/black | White/gray tones | High contrast monochrome |
| **Golden Age** | Warm brown base | Amber/gold (#c9a84c) | Vintage Hollywood warmth |
| **Teal & Orange** | Cool teal base | Cyan/orange (#4a9aaa / #d4873a) | Modern blockbuster |
| **Crimson** | Dark red base | Crimson (#c44a4a) | Tension/thriller |

- CSS custom properties for all themed values (`--color-accent`, `--color-surface`, `--color-text-primary`, etc.)
- `data-theme` attribute on `<html>` element
- Theme persisted in `localStorage`
- Floating button on right side of viewport, cycles through moods on click, shows current mood name

### CSS Variable Architecture
```css
:root, [data-theme="noir"] {
  --color-accent: #94a3b8;
  --color-accent-hover: #cbd5e1;
  --color-surface: rgba(15, 23, 42, 0.4);
  --color-surface-hover: rgba(30, 41, 59, 0.5);
  --color-glass-border: rgba(148, 163, 184, 0.15);
  --color-glow: rgba(148, 163, 184, 0.15);
  --gradient-accent: linear-gradient(135deg, #64748b, #94a3b8);
  /* ... etc per theme */
}
```

## Glassmorphism & Film Stock Effects

### Glassmorphism Cards
- `backdrop-blur-xl` on all card surfaces
- `bg-white/5` (adjusted per theme)
- Subtle `border border-white/10` (adjusted per theme)
- Hover: increased border opacity, subtle scale, light sweep animation

### Light Sweep Reflection
- CSS pseudo-element gradient sweeps across card on hover
- `@keyframes light-sweep` — moves a semi-transparent white gradient from -100% to 100% over 1.5s

### Film Grain Overlay
- Fixed-position SVG/Canvas grain texture (full viewport, pointer-events: none)
- CSS mix-blend-mode: overlay, opacity: 0.03–0.05
- Subtle animation via small translate shifts on a timer (or GSAP-driven)

### Vignette
- Section-level radial gradient overlay: transparent center → dark edges
- `background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)`

## Continuous Motion Flow

### Floating Ambient Orbs
- 3–5 large blurred gradient circles that slowly drift across the viewport
- GSAP-driven with random float paths
- Z-index below content, above background
- React to mouse position slightly (subtle attraction/repulsion)

### Mouse Parallax
- Glass cards get subtle 3D rotation based on mouse position (GSAP quickTo)
- Existing `createHover3DTilt` utility enhanced with smoother springs

### Scroll-Driven Motion
- Hero content fades to 0.3 opacity and rises -80px as user scrolls past
- Section backgrounds have subtle color shift / gradient animation on scroll
- Skill bars: GSAP ScrollTrigger animated from 0% → data-level (existing)
- All section reveals: stagger fade + slide with ScrollTrigger

### Particle / Ambient Layer
- Lightweight canvas particle system (or DOM-based with GSAP)
- 20–30 tiny dots slowly drifting
- React to mouse: gentle attraction within radius
- Respects reduced-motion

## Component Changes

### New Components
1. **ThemeSwitcher** — floating right-side button, cycles moods, shows mood name + color dot
2. **FilmGrainOverlay** — fixed SVG grain texture with subtle animation
3. **AmbientOrbs** — 3–5 floating gradient circles
4. **ParticleField** — lightweight drifting particles

### Enhanced Components
1. **Hero** — SplitType character reveal (existing), scroll parallax (existing)
2. **About** — scroll parallax on photo (existing)
3. **Skills** — bar-fill animations from data (existing)
4. **Projects/Services** — 3D tilt hover (existing)
5. **Contact** — scroll reveal (existing)
6. **Navbar** — glassmorphism background, theme-aware

### Theme Integration
- All components read `--color-*` CSS variables
- `section-eyebrow` class uses `var(--color-accent)`
- Card borders/surfaces use glassmorphism tokens
- Gradient accents use `var(--gradient-accent)`

## Implementation Order

1. CSS variable architecture in `globals.css` (all 4 themes)
2. `ThemeSwitcher` component (button + localStorage + data-theme)
3. `FilmGrainOverlay` component
4. `AmbientOrbs` component
5. `ParticleField` component
6. Update all section components to use theme CSS variables
7. Update Navbar to glassmorphism theme-aware
8. Polish animations with continuous motion feel
9. Verify build + E2E tests

## Files to Modify
- `app/globals.css` — CSS variables, theme data attributes, glassmorphism utilities, animations
- `app/layout.tsx` — wrap with theme provider logic
- `app/page.tsx` — add FilmGrainOverlay, AmbientOrbs, ParticleField
- `lib/gsap-animations.tsx` — add floating orb animation utility
- `components/ui/ThemeSwitcher.tsx` — NEW
- `components/ui/FilmGrainOverlay.tsx` — NEW
- `components/ui/AmbientOrbs.tsx` — NEW
- `components/ui/ParticleField.tsx` — NEW
- `components/sections/Hero.tsx` — theme variables
- `components/sections/About.tsx` — theme variables
- `components/sections/Skills.tsx` — theme variables
- `components/sections/Projects.tsx` — theme variables
- `components/sections/Services.tsx` — theme variables
- `components/sections/Contact.tsx` — theme variables
- `components/Navbar.tsx` — glassmorphism + theme awareness

## Testing
- All 6 existing Playwright E2E tests must continue to pass
- Theme switcher: verify `data-theme` changes on click, persists on reload
- Reduced-motion: verify all new animations respect `prefers-reduced-motion`
- No visual regressions on glassmorphism cards
