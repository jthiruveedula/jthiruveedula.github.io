"use client";

import { useEffect, useState } from "react";

export default function ResumePage() {
  const [resumeContent, setResumeContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await fetch("/api/resume");
        if (response.ok) {
          const content = await response.text();
          setResumeContent(content);
        } else {
          setResumeContent("<div class=\"error\">Failed to load resume content</div>");
        }
      } catch (error) {
        setResumeContent("<div class=\"error\">Error loading resume: " + error + "</div>");
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading resume...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-text-primary)]">
            Jagadeesh Thiruveedula
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-4">
            Forward Deployed AI Engineer & Data Architect
          </p>
          <div className="flex justify-center gap-6 text-sm text-[var(--color-text-muted)]">
            <a href="tel:+19454002650" className="hover:text-[var(--color-accent)] transition-colors">+1 (945) 400-2650</a>
            <a href="mailto:jagadeeshthiruveedula77@gmail.com" className="hover:text-[var(--color-accent)] transition-colors">jagadeeshthiruveedula77@gmail.com</a>
            <a href="https://linkedin.com/in/jagadeesh-thiruveedula" className="hover:text-[var(--color-accent)] transition-colors">LinkedIn</a>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-[var(--color-accent)] text-[var(--color-bg)] rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors font-medium"
            >
              📄 Download PDF
            </button>
          </div>
        </div>

        <div
          className="resume-container bg-[var(--color-surface)] rounded-xl border border-[var(--color-glass-border)] p-8 md:p-12 shadow-lg"
          dangerouslySetInnerHTML={{ __html: resumeContent }}
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: '10.3pt',
            lineHeight: '1.4',
          }}
        />
      </div>
    </main>
  );
}