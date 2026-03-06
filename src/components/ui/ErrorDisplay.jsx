// src/components/ui/ErrorDisplay.jsx
import { Component } from 'react';

// Inline API error banner
export function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div style={{
      background: 'var(--red-pale)', border: '1px solid var(--red)',
      borderRadius: 'var(--radius-md)', padding: '14px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--red)' }}>Something went wrong</div>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{error}</div>
        </div>
      </div>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>Retry</button>
      )}
    </div>
  );
}

// Full-page error boundary for unexpected crashes
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error: error?.message || 'Unexpected error' };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💥</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>
            Something crashed
          </h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: 24, fontSize: 14 }}>
            {this.state.error}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
