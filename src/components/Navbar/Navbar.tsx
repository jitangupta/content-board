import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Film, LogOut, Menu, MessageSquare, Plus, User, Video } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useContent } from '@/features/content/useContent';
import { captureError } from '@/services/sentry';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import type { ContentType } from '@/types/content';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { createContent } = useContent();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const [createError, setCreateError] = useState<string | null>(null);

  async function handleNewContent(contentType: ContentType = 'video'): Promise<void> {
    if (creating) return;
    setCreating(true);
    try {
      setCreateError(null);
      const newId = await createContent({ contentType });
      navigate(`/content/${newId}`);
    } catch (error: unknown) {
      captureError(error, { operation: 'createContent' });
      setCreateError('Failed to create content');
    } finally {
      setCreating(false);
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold"><span className="md:hidden">CB</span><span className="hidden md:inline">Content Board</span></h1>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <button
            onClick={() => navigate('/learnings')}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            Learnings
          </button>
          <button
            onClick={() => navigate('/feedback')}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/learnings')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Learnings"
        >
          <BookOpen className="h-5 w-5" />
        </button>
        <button
          onClick={() => navigate('/feedback')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Feedback"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        {createError && (
          <span className="text-xs text-destructive">{createError}</span>
        )}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">New</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleNewContent('video')}>
              <Video className="mr-2 h-4 w-4" />
              Video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNewContent('short')}>
              <Film className="mr-2 h-4 w-4" />
              Short
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? 'User avatar'}
                  className="h-8 w-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
