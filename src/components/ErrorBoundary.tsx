import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Themed fallback shown when a section fails to render. */
  fallback?: ReactNode
  /** Label used in the console error for faster triage. */
  label?: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Isolates a single section so a render-time failure (e.g. a WebGL canvas
 * throwing on an unsupported GPU) degrades to a styled fallback instead of
 * blanking the entire page. Non-rendering errors (event handlers, async) are
 * out of scope by React design.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(`[ErrorBoundary${this.props.label ? ` · ${this.props.label}` : ''}]`, error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="glass-panel mx-auto my-10 max-w-2xl rounded-2xl border border-panel-edge p-8 text-center"
          >
            <p className="hud-label">module offline</p>
            <h3 className="mt-3 font-display text-xl font-semibold text-ink">This section hit a snag</h3>
            <p className="mt-2 text-sm text-ink-muted">
              The rest of the experience is unaffected. Reload to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-md border border-panel-edge px-5 py-2 font-mono text-xs uppercase tracking-[0.18em] text-accent-soft transition-colors hover:border-accent hover:text-accent"
            >
              Reload
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
