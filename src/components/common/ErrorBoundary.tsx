import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/**
 * Catches render-time crashes anywhere in the tree so a single broken route
 * never blanks the whole app.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        role="alert"
        style={{
          maxWidth: '560px',
          margin: '4rem auto',
          padding: '2rem',
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem' }}>😵</div>
        <h2 style={{ margin: '0.5rem 0' }}>Something went wrong</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '1.2rem' }}>
          {this.state.error.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Go home
        </button>
      </div>
    )
  }
}
