import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // 可以扩展：上报日志
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <h3 style={{ color: '#B42318' }}>界面出现错误</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: 12, borderRadius: 4, maxWidth: 600, margin: '12px auto', textAlign: 'left' }}>{String(this.state.error)}</pre>
          <button onClick={this.handleRetry} style={{ background: '#0F6CBD', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>重试</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
