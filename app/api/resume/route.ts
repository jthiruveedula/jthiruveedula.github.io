// app/api/resume/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const fs = require("fs");
    const path = require("path");
    
    const resumePath = path.join(process.cwd(), "Downloads", "Employment", "resume.html");
    
    if (!fs.existsSync(resumePath)) {
      return NextResponse.json(
        { error: "Resume file not found" },
        { status: 404 }
      );
    }
    
    const resumeContent = fs.readFileSync(resumePath, "utf8");
    
    // Add CSS for print styling
    const enhancedContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jagadeesh Thiruveedula — Resume</title>
<style>
  :root {
    --ink: #0f172a;
    --slate: #334155;
    --muted: #64748b;
    --accent: #1e3a8a;
    --accent2: #0f766e;
    --rule: #cbd5e1;
    --bg: #ffffff;
    --chip: #eef2ff;
    --chip2: #ecfdf5;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: #e9edf3;
    color: var(--ink);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 10.3pt;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    background: var(--bg);
    max-width: 8.5in;
    min-height: 11in;
    margin: 24px auto;
    padding: 0.5in 0.6in;
    box-shadow: 0 10px 40px rgba(15, 23, 42, 0.12);
  }
  /* ---------- HEADER ---------- */
  header h1 {
    font-size: 23pt;
    letter-spacing: -0.02em;
    font-weight: 800;
    color: var(--accent);
  }
  header .headline {
    font-size: 11pt;
    color: var(--slate);
    font-weight: 600;
    margin-top: 4px;
    letter-spacing: 0.01em;
  }
  header .headline .pipe { color: var(--rule); margin: 0 6px; }
  header .contact {
    margin-top: 7px;
    font-size: 9.3pt;
    color: var(--muted);
    display: flex;
    flex-wrap: wrap;
    gap: 5px 12px;\n  }
  header .contact a { color: var(--muted); text-decoration: none; }
  header .contact span.sep { color: var(--rule); }
  /* ---------- SECTIONS ---------- */
  section { margin-top: 14px; }
  h2 {
    font-size: 10.8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
    border-bottom: 1.5px solid var(--accent);
    padding-bottom: 3px;
    margin-bottom: 7px;
  }
  p.summary { font-size: 10.1pt; color: var(--slate); }
  p.summary b { color: var(--ink); }
  /* ---------- COMPETENCY GRID ---------- */
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 22px;
    font-size: 9.6pt;
  }
  .grid .row { display: flex; gap: 6px; }
  .grid .row .k {
    color: var(--accent);
    font-weight: 700;
    flex: 0 0 132px;
  }
  .grid .row .v { color: var(--ink); }
  /* ---------- EXPERIENCE ---------- */
  .role { margin-top: 9px; break-inside: avoid; }
  .role:first-of-type { margin-top: 5px; }
  .role-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
  }
  .role-head .title {
    font-size: 10.8pt;
    font-weight: 700;
    color: var(--ink);
  }
  .role-head .title .org { color: var(--accent); }
  .role-head .dates {
    font-size: 9.1pt;
    color: var(--muted);
    font-weight: 600;
    white-space: nowrap;
  }
  .role-meta {
    font-size: 9.1pt;
    color: var(--accent2);
    margin-top: 1px;
    font-style: italic;
    font-weight: 600;
  }
  ul.bullets {
    margin-top: 4px;
    padding-left: 16px;
    list-style: none;
  }
  ul.bullets li {
    position: relative;
    margin-bottom: 3px;
    font-size: 9.9pt;
    color: var(--slate);
  }
  ul.bullets li::before {
    content: "▸";
    position: absolute;
    left: -14px;
    color: var(--accent);
    font-size: 9pt;
    top: 0;
  }
  ul.bullets li b { color: var(--ink); }
  ul.bullets li .proj {
    display: block;
    font-size: 9.5pt;
    font-weight: 700;
    color: var(--accent2);
    margin-top: 2px;
    letter-spacing: 0.01em;
  }
  .skills-line {
    font-size: 9.1pt;
    color: var(--muted);
    margin-top: 4px;
  }
  .skills-line b { color: var(--slate); font-weight: 700; }
  /* ---------- TWO-COLUMN LOWER ---------- */
  .two-col {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 22px;
  }
  /* ---------- EDUCATION / CERTS ---------- */
  .item { margin-top: 6px; break-inside: avoid; }
  .item .title { font-weight: 700; font-size: 10pt; color: var(--ink); }
  .item .org { color: var(--accent); font-weight: 600; }
  .item .meta { font-size: 9.1pt; color: var(--muted); }
  ul.cert { margin-top: 4px; padding-left: 16px; list-style: none; }
  ul.cert li {
    position: relative;
    font-size: 9.6pt;
    color: var(--slate);
    margin-bottom: 2px;
  }
  ul.cert li::before {
    content: "▸";
    position: absolute;
    left: -14px;
    color: var(--accent);
    font-size: 9pt;
  }
  /* ---------- ACHIEVEMENTS ---------- */
  .ach {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-top: 5px;
  }
  .ach .card {
    border-left: 3px solid var(--accent);
    padding: 3px 7px;
    background: var(--chip);
  }
  .ach .card.alt { border-left-color: var(--accent2); background: var(--chip2); }
  .ach .card .num {
    font-size: 13pt;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .ach .card.alt .num { color: var(--accent2); }
  .ach .card .lbl {
    font-size: 8.4pt;
    color: var(--slate);
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.15;
  }
  /* ---------- DEPLOYMENT POD ---------- */
  .pod {
    margin-top: 6px;
    background: var(--chip);
    border-left: 3px solid var(--accent);
    padding: 6px 10px;
    font-size: 9.4pt;
    color: var(--slate);
  }
  .pod b { color: var(--ink); }
  .pod .label {
    display: inline-block;
    font-size: 8.6pt;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-right: 6px;
  }
  /* ---------- PRINT ---------- */
  @media print {
    @page { size: letter; margin: 0.4in; }
    body { background: #fff; font-size: 10pt; }
    .page { box-shadow: none; margin: 0; max-width: none; min-height: 0; padding: 0; }
    .role, .item { break-inside: avoid; }
    a { color: var(--ink) !important; text-decoration: none; }
  }
</style>
</head>
<body>
<main class="page">
${resumeContent}
</main>
</body>
</html>`;
    
    return new NextResponse(enhancedContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load resume" },
      { status: 500 }
    );
  }
}