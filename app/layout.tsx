import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jagadeesh Thiruveedula — Data Architect | GCP & Generative AI",
  description:
    "Data Architect and Senior Data Engineer specializing in Google Cloud Platform, BigQuery optimization, and Generative AI in Corinth, Texas (DFW region).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
