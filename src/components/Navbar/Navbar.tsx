import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/useAuth';
import { useContent } from '@/features/content/useContent';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { createContent } = useContent();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const displayName = user?.displayName ?? user?.email ?? 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  async function handleNewContent(): Promise<void> {
    if (creating) return;
    setCreating(true);
    try {
      const newId = await createContent({});
      navigate(`/content/${newId}`);
    } catch {
      // Error is captured by the service layer via Sentry
    } finally {
      setCreating(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    try {
      await signOut();
    } catch {
      // Error is captured by the service layer via Sentry
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <h1 className="text-lg font-semibold">Content Board</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={handleNewContent}
          disabled={creating}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New Content
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium hover:bg-muted/80">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-muted-foreground" disabled>
              <User className="mr-2 h-4 w-4" />
              {displayName}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
