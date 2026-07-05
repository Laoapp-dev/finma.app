import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface it in the console too, for anyone debugging via devtools.
    console.error("Finma crashed:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper px-4">
          <div className="card max-w-lg w-full">
            <h1 className="font-display font-bold text-xl text-lotus mb-2">
              Something went wrong
            </h1>
            <p className="text-ink/70 text-sm mb-3">
              Finma hit an unexpected error instead of showing a blank screen. The details below
              should help track it down — check the browser console for the full stack trace.
            </p>
            <pre className="bg-lotus-50 text-lotus text-xs rounded-lg p-3 overflow-auto max-h-40">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button className="btn-secondary text-sm mt-4" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
