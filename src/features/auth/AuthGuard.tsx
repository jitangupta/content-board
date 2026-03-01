import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

const ALLOWED_EMAIL = 'gtangupta@gmail.com';

export function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.email !== ALLOWED_EMAIL) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="text-muted-foreground">
            This app is restricted. Your account ({user.email}) is not
            authorized.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
