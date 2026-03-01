import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SentryErrorBoundary } from '@/services/sentry';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ContentProvider } from '@/features/content/ContentProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DetailPanelPlaceholder } from '@/components/DetailPanel/DetailPanelPlaceholder';

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
                element={
                  <ContentProvider>
                    <DashboardLayout />
                  </ContentProvider>
                }
              >
                <Route path="/" element={<Navigate to="/content" replace />} />
                <Route path="/content" element={<DetailPanelPlaceholder />} />
                <Route path="/content/:contentId" element={<DetailPanelPlaceholder />} />
                <Route path="/content/:contentId/:tab" element={<DetailPanelPlaceholder />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SentryErrorBoundary>
  );
}

export default App;
