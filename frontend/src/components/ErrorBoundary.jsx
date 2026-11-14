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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px'
              }}
            >
              <AlertCircle size={30} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Something went wrong
            </h2>

            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              The application encountered a rendering issue. Reloading the page or returning home usually resolves it.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  background: '#f1f5f9',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#475569',
                  textAlign: 'left',
                  marginBottom: '20px',
                  fontFamily: 'monospace',
                  overflowX: 'auto'
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>

              <a
                href="/"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
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
