import { lazy, Suspense, ComponentType, useState, useRef, useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Loading fallback component
const LoadingFallback = ({ componentName }: { componentName: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">Loading {componentName}...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ 
  error, 
  resetErrorBoundary, 
  componentName 
}: { 
  error: Error; 
  resetErrorBoundary: () => void; 
  componentName: string;
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-4">
      <div className="text-red-600">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">
        Failed to load {componentName}
      </h3>
      <p className="text-sm text-gray-600">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Higher-order component for lazy loading with error boundaries
export const withLazyLoading = <T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  componentName: string
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: T) => (
    <ErrorBoundary
      FallbackComponent={(errorProps: any) => (
        <ErrorFallback {...errorProps} componentName={componentName} />
      )}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<LoadingFallback componentName={componentName} />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Lazy-loaded components for PropPilot
export const LazyPreviewPanel = withLazyLoading(
  () => import('./PreviewPanel'),
  'Preview Panel'
);

export const LazyProposalSectionDisplay = withLazyLoading(
  () => import('./ProposalSectionDisplay'),
  'Proposal Section Display'
);

export const LazyProposalValidator = withLazyLoading(
  () => import('./ProposalValidator'),
  'Proposal Validator'
);

export const LazyRFPAnalyzer = withLazyLoading(
  () => import('./RFPAnalyzer'),
  'RFP Analyzer'
);

// Advanced lazy loading with intersection observer for viewport-based loading
export const LazyViewportComponent = <T extends object>({
  importFn,
  componentName,
  rootMargin = '100px',
  threshold = 0.1,
  fallbackHeight = '200px',
  ...props
}: {
  importFn: () => Promise<{ default: ComponentType<T> }>;
  componentName: string;
  rootMargin?: string;
  threshold?: number;
  fallbackHeight?: string;
} & T) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [rootMargin, threshold, hasLoaded]);

  const LazyComponent = useMemo(
    () => (isVisible ? withLazyLoading(importFn, componentName) : null),
    [isVisible, importFn, componentName]
  );

  return (
    <div ref={containerRef} style={{ minHeight: fallbackHeight }}>
      {LazyComponent ? (
        <LazyComponent {...(props as T)} />
      ) : (
        <div 
          className="flex items-center justify-center"
          style={{ height: fallbackHeight }}
        >
          <div className="text-gray-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

// Preloader for critical components
export const ComponentPreloader = () => {
  useEffect(() => {
    // Preload critical components during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Preload core components
        import('./PreviewPanel').catch(() => {});
        import('./ChatInterface').catch(() => {});
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        import('./PreviewPanel').catch(() => {});
        import('./ChatInterface').catch(() => {});
      }, 100);
    }
  }, []);

  return null;
};