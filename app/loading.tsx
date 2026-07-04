export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "var(--color-bg)" }}
      role="status"
      aria-label="Loading"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
      />
    </div>
  );
}
