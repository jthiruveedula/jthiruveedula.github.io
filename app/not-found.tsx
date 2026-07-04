import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <p
        className="font-mono text-[11px] tracking-[0.28em] uppercase"
        style={{ color: "var(--color-accent)" }}
      >
        404
      </p>
      <h1
        className="text-2xl md:text-3xl font-bold tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        Page not found.
      </h1>
      <p
        className="max-w-md text-sm font-light leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: "var(--gradient-accent)",
          color: "var(--color-bg)",
          boxShadow: "0 0 20px rgba(201,168,76,0.25)",
        }}
      >
        Back to home
      </Link>
    </div>
  );
}
