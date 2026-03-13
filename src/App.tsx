import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SentryErrorBoundary } from '@/services/sentry';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { ContentProvider } from '@/features/content/ContentProvider';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EmptyStateDashboard } from '@/components/DetailPanel/EmptyStateDashboard';
import { DetailPanel } from '@/components/DetailPanel/DetailPanel';
import { GlobalLearningsPage } from '@/features/learn/GlobalLearningsPage';
import { GlobalFeedbackPage } from '@/features/feedback/GlobalFeedbackPage';

function AppErrorFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          The error has been reported automatically.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
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
            <Route
              element={
                <ContentProvider>
                  <AuthGuard />
                </ContentProvider>
              }
            >
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/content" replace />} />
                <Route path="/content" element={<EmptyStateDashboard />} />
                <Route path="/content/:contentId" element={<DetailPanel />} />
                <Route
                  path="/content/:contentId/:tab"
                  element={<DetailPanel />}
                />
                <Route path="/learnings" element={<GlobalLearningsPage />} />
                <Route path="/feedback" element={<GlobalFeedbackPage />} />
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
