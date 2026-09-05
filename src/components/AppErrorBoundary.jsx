import React from 'react';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI Error captured by AppErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-fallback-container"
          style={{
            padding: '24px',
            textAlign: 'center',
            margin: '40px auto',
            maxWidth: '600px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ marginBottom: '12px', color: '#0F172A', fontSize: '1.25rem', fontWeight: 700 }}>
            화면을 불러오는 중 오류가 발생했습니다.
          </h3>
          <p style={{ marginBottom: '20px', color: '#64748B', fontSize: '0.95rem', wordBreak: 'break-word' }}>
            {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleResetError}
              style={{
                padding: '10px 20px',
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              다시 시도
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                background: '#0E0E0E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
