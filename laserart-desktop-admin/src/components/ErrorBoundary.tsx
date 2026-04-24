import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#0a0a0a', color: '#ef4444', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: '90%' }}>
            <h1 style={{ marginBottom: '10px', fontSize: '24px' }}>Technical Error</h1>
            <p style={{ color: '#ffffff', marginBottom: '20px', fontWeight: 'bold' }}>{this.state.error?.name}: {this.state.error?.message}</p>
            <pre style={{ color: '#71717a', fontSize: '10px', textAlign: 'left', background: '#000', padding: '10px', borderRadius: '8px', overflow: 'auto', maxHeight: '150px', marginBottom: '20px' }}>
              {this.state.error?.stack}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Restart Application
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
