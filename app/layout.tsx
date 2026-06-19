import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://jthiruveedula.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jagadeesh Thiruveedula — Data Architect | GCP & Generative AI",
    template: "%s | Jagadeesh Thiruveedula",
  },
  description:
    "Data Architect and Senior Data Engineer in the DFW region building private LLM applications, enterprise-grade RAG pipelines, and governed agentic workflows on Google Cloud Platform — Vertex AI, BigQuery, and production AI systems engineered for performance, security, and operational clarity.",
  keywords: [
    "Data Architect",
    "GCP",
    "Google Cloud Platform",
    "Vertex AI",
    "Generative AI",
    "RAG",
    "BigQuery",
    "LLM",
    "Agentic Workflows",
    "Senior Data Engineer",
    "DFW",
    "Corinth Texas",
    "LangChain",
    "Vector Search",
  ],
  authors: [{ name: "Jagadeesh Thiruveedula", url: SITE_URL }],
  creator: "Jagadeesh Thiruveedula",
  publisher: "Jagadeesh Thiruveedula",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Jagadeesh Thiruveedula",
    title: "Jagadeesh Thiruveedula — Data Architect | GCP & Generative AI",
    description:
      "Data Architect and Senior Data Engineer building private LLM applications, enterprise RAG pipelines, and governed agentic workflows on Google Cloud.",
    images: [
      {
        url: "/favicon.svg",
        width: 512,
        height: 512,
        alt: "Jagadeesh Thiruveedula — Data Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jagadeesh Thiruveedula — Data Architect | GCP & Generative AI",
    description:
      "Data Architect and Senior Data Engineer building private LLM applications, enterprise RAG pipelines, and governed agentic workflows on Google Cloud.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth" data-theme="cyberpunk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#020617" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <script src="https://unpkg.com/split-type"></script>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/GSDevTools.min.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
