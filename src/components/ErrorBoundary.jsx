import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // e.g. Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-slate-800 rounded-2xl p-8 border border-red-700/40 shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">System Error Detected</h1>
          <p className="text-gray-400 mb-6 text-sm">
            A critical component encountered an unexpected state. The Butterfly Protocol has sealed the error zone.
          </p>

          {this.state.error && (
            <div className="bg-red-950/50 border border-red-800/50 rounded-lg p-4 mb-6 text-left">
              <div className="text-red-400 font-mono text-xs overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
            >
              <RefreshCw size={16} />
              Retry
            </button>
            <a
              href="/"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-semibold transition"
            >
              <Home size={16} />
              Home
            </a>
          </div>

          <p className="text-gray-600 text-xs mt-6">
            PIHYA Tribunal Error Seal — EV0LVERSE v1.0
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
