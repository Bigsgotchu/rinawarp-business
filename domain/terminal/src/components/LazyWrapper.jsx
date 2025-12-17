import React, { Suspense } from 'react';

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
    <span className="ml-2 text-pink-500">Loading...</span>
  </div>
);

// Lazy wrapper component
export const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

// Error boundary for lazy components
export class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Component failed to load</h3>
          <p>Please refresh the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyWrapper;
