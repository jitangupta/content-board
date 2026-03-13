import { useState } from 'react';
import { Check, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { addPlatformVersion, removePlatformVersion, updatePlatformVersion } from '@/services/firestore';
import { captureError } from '@/services/sentry';
import type { PlatformVersion, ShortPlatform } from '@/types/content';

interface PlatformVersionSectionProps {
  contentId: string;
  versions: PlatformVersion[];
}

const PLATFORM_LABELS: Record<ShortPlatform, string> = {
  'youtube-shorts': 'YouTube Shorts',
  'instagram-reels': 'Instagram Reels',
  'linkedin': 'LinkedIn',
  'tiktok': 'TikTok',
  'other': 'Other',
};

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function PlatformVersionSection({
  contentId,
  versions,
}: PlatformVersionSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState<ShortPlatform>('youtube-shorts');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  function resetForm(): void {
    setPlatform('youtube-shorts');
    setUrl('');
    setNotes('');
    setUrlError(null);
    setShowForm(false);
  }

  async function handleAdd(): Promise<void> {
    if (url.trim() && !isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    const newVersion: PlatformVersion = {
      id: crypto.randomUUID(),
      platform,
      url: url.trim(),
      published: false,
      notes: notes.trim(),
    };

    try {
      await addPlatformVersion(contentId, newVersion);
      resetForm();
    } catch (error: unknown) {
      captureError(error, { operation: 'addPlatformVersion', contentId });
    }
  }

  async function handleTogglePublished(version: PlatformVersion): Promise<void> {
    try {
      await updatePlatformVersion(contentId, {
        ...version,
        published: !version.published,
      });
    } catch (error: unknown) {
      captureError(error, { operation: 'updatePlatformVersion', contentId });
    }
  }

  async function handleRemove(versionId: string): Promise<void> {
    try {
      await removePlatformVersion(contentId, versionId);
    } catch (error: unknown) {
      captureError(error, { operation: 'removePlatformVersion', contentId });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Platform Versions</Label>
        {!showForm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(true)}
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Platform
          </Button>
        )}
      </div>

      {versions.length > 0 && (
        <ul className="space-y-2">
          {versions.map((version) => (
            <li
              key={version.id}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <Badge variant="outline" className="shrink-0 text-xs">
                {PLATFORM_LABELS[version.platform]}
              </Badge>
              {version.url && (
                <a
                  href={version.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span className="truncate">{version.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              )}
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleTogglePublished(version)}
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                    version.published
                      ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                  aria-label={version.published ? 'Mark as unpublished' : 'Mark as published'}
                  title={version.published ? 'Published' : 'Not published'}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove platform version?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the {PLATFORM_LABELS[version.platform]} version.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(version.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="space-y-1.5">
            <Label htmlFor="platform-select" className="text-xs">
              Platform
            </Label>
            <Select
              value={platform}
              // Radix Select types value as string; constrained by SelectItem values
              onValueChange={(v) => setPlatform(v as ShortPlatform)}
            >
              <SelectTrigger id="platform-select" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube-shorts">YouTube Shorts</SelectItem>
                <SelectItem value="instagram-reels">Instagram Reels</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="platform-url" className="text-xs">
              URL
            </Label>
            <Input
              id="platform-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError(null);
              }}
              placeholder="https://... (optional)"
              className="h-8"
            />
            {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="platform-notes" className="text-xs">
              Notes
            </Label>
            <Textarea
              id="platform-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any platform-specific notes..."
              rows={2}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              className="h-7 text-xs"
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {versions.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground">No platform versions yet</p>
      )}
    </div>
  );
}
