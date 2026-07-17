import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/globals.css'

/** Last-resort fallback: if any unhandled render error escapes the per-section
 *  boundaries, show a recoverable screen instead of a blank white page. */
function AppErrorFallback() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-void px-6 text-center">
      <p className="hud-label text-accent">system offline</p>
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        The portfolio hit an unexpected error. Reload to restore the experience.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-md bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-void transition-colors hover:bg-accent-soft"
      >
        Reload
      </button>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary label="app" fallback={<AppErrorFallback />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
