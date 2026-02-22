import { SentryErrorBoundary } from '@/services/sentry';

function AppErrorFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          The error has been reported automatically.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <SentryErrorBoundary fallback={<AppErrorFallback />}>
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-4xl font-bold text-red-500">Content Board</h1>
      </div>
    </SentryErrorBoundary>
  );
}

export default App;
