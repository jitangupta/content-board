import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(): Promise<void> {
    try {
      setError(null);
      await signIn();
    } catch {
      setError('Sign-in failed. Please try again.');
    }
  }

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Content Board</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your content
          </p>
        </div>
        {error && (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <button
          onClick={handleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
