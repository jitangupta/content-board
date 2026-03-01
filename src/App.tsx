import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SentryErrorBoundary } from '@/services/sentry';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { AuthGuard } from '@/features/auth/AuthGuard';

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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AuthGuard />}>
              <Route
                path="/"
                element={
                  <div className="flex min-h-screen items-center justify-center">
                    <h1 className="text-2xl font-bold">Dashboard placeholder</h1>
                  </div>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SentryErrorBoundary>
  );
}

export default App;
