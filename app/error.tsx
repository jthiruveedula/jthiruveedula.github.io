"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <p className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: "var(--color-accent)" }}>
        Error
      </p>
      <h1 className="text-xl md:text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
        Something went wrong.
      </h1>
      <p className="max-w-md text-sm" style={{ color: "var(--color-text-secondary)" }}>
        An unexpected error occurred while rendering this page.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: "var(--gradient-accent)",
          color: "var(--color-bg)",
          boxShadow: "0 0 20px rgba(201,168,76,0.25)",
        }}
      >
        Try again
      </button>
    </div>
  );
}
