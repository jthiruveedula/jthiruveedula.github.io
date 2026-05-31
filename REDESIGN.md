# Portfolio Redesign: GenAI-Driven Data Architect

Branch: redesign/genai-architect-v1
Status: in progress
Deployment risk: master auto-deploys to GitHub Pages, so this work is staged on a branch and merged only after review.

## Goal
Move the site from a standard developer portfolio to a flagship, motion-led, premium portfolio for a GenAI-Driven Data Architect focused on private LLM apps, enterprise RAG, agentic workflows, and token-efficient AI on GCP.

## Creative Direction
- Dark-mode first, editorial spacing, architect-level restraint (no neon AI cliches)
- Type pairing: Inter (UI) + JetBrains Mono (system labels) - already loaded in Layout.astro
- Color tokens: slate-950 base, indigo-400 accent, emerald-400 for proof metrics, amber-300 for highlights
- Motion: GSAP + ScrollTrigger, 2-3 high-impact moments, prefers-reduced-motion respected
- Visual identity: SVG node-graph backgrounds, animated system diagrams instead of decoration

## New Site Architecture
1. Hero - headline, sub, proof bar, CTA, animated node-graph background
2. Capabilities - private LLM, enterprise RAG, agentic orchestration, cost-aware inference, governed AI, GCP-native
3. Flagship Projects (case-study layout)
   - dual-agent-platform
   - rag-pipeline-gcp-vertexai
   - policy-sop-assistant
   - gdrive-rag-assistant
   - intraday-ops-intelligence
   - openclaw-gemma-pro
4. Architecture - animated SVG system diagram (ingest -> embed -> retrieve -> orchestrate -> govern -> serve)
5. Proof metrics - animated counters (token savings, latency, governed workflows)
6. About / credibility
7. Contact CTA

## Hero Copy
Headline: I architect private LLM systems that ship to production.
Subheadline: Enterprise RAG, agentic workflows, and token-efficient AI on GCP - governed end to end.
Proof bar: 6 production GenAI systems / GCP-native / Vertex AI + Gemini / token-cost aware
CTA primary: See the systems
CTA secondary: Read the architecture notes

## Implementation Plan (this branch)
1. REDESIGN.md (this file) - planning artifact and PR anchor
2. src/layouts/Layout.astro - add GSAP via CDN, prefers-reduced-motion guard, refresh tokens
3. src/pages/index.astro - full hero, capabilities, projects, architecture, metrics, CTA
4. src/components/SystemDiagram.astro - animated SVG node graph
5. src/components/ProjectCard.astro - flagship case-study card
6. Follow-up PRs for about, experience, skills, contact pages
