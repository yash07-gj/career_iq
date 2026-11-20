import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            background: 'var(--bg)',
          }}
        >
          <div className="card card-pad" style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: 32 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--bad-soft)',
                color: 'var(--bad)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={30} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Something went wrong</h2>

            <p className="muted text-sm" style={{ margin: '0 0 20px' }}>
              The application encountered a rendering issue. Reloading the page or returning home usually resolves it.
            </p>

            {this.state.error?.message && (
              <div
                className="text-xs muted"
                style={{
                  background: 'var(--surface-2)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  textAlign: 'left',
                  marginBottom: 20,
                  fontFamily: 'ui-monospace, Consolas, monospace',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div className="row-gap" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn" onClick={this.handleReload}>
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>
              <a href="/" className="btn outline">
                <Home size={14} />
                <span>Go to Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
