## 2025-05-20 - Automated Security Audits
**Vulnerability:** Dependency vulnerabilities were only discoverable via manual pnpm audit.
**Learning:** High severity XSS vulnerabilities in Astro and path traversal in Vite were present but unnoticed without regular auditing.
**Prevention:** Added a GitHub Action to run pnpm audit on every PR and weekly to ensure dependencies remain secure.
