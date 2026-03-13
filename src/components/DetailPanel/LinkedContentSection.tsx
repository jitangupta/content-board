import { useState } from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { addLinkedContent, removeLinkedContent } from '@/services/firestore';
import { captureError } from '@/services/sentry';
import type { LinkedContent, LinkedContentPlatform } from '@/types/content';

interface LinkedContentSectionProps {
  contentId: string;
  links: LinkedContent[];
}

const PLATFORM_LABELS: Record<LinkedContentPlatform, string> = {
  blog: 'Blog',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  canva: 'Canva',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  other: 'Other',
};

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function LinkedContentSection({
  contentId,
  links,
}: LinkedContentSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState<LinkedContentPlatform>('blog');
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  function resetForm(): void {
    setPlatform('blog');
    setUrl('');
    setLabel('');
    setUrlError(null);
    setShowForm(false);
  }

  async function handleAdd(): Promise<void> {
    if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    const newLink: LinkedContent = {
      id: crypto.randomUUID(),
      platform,
      url,
      label: label.trim() || url,
    };

    try {
      await addLinkedContent(contentId, newLink);
      resetForm();
    } catch (error: unknown) {
      captureError(error, { operation: 'addLinkedContent', contentId });
    }
  }

  async function handleRemove(linkId: string): Promise<void> {
    try {
      await removeLinkedContent(contentId, linkId);
    } catch (error: unknown) {
      captureError(error, { operation: 'removeLinkedContent', contentId });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Linked Content</Label>
        {!showForm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(true)}
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Link
          </Button>
        )}
      </div>

      {links.length > 0 && (
        <ul className="space-y-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <Badge variant="outline" className="shrink-0 text-xs">
                {PLATFORM_LABELS[link.platform]}
              </Badge>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span className="truncate">{link.label}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              <div className="ml-auto shrink-0">
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
                      <AlertDialogTitle>Remove link?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the link to &quot;{link.label}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(link.id)}>
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
            <Label htmlFor="link-platform" className="text-xs">
              Platform
            </Label>
            <Select
              value={platform}
              // shadcn Select returns string; value is constrained by SelectItem values
              onValueChange={(v) => setPlatform(v as LinkedContentPlatform)}
            >
              <SelectTrigger id="link-platform" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="canva">Canva</SelectItem>
                <SelectItem value="chatgpt">ChatGPT</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link-url" className="text-xs">
              URL
            </Label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError(null);
              }}
              placeholder="https://..."
              className="h-8"
            />
            {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link-label" className="text-xs">
              Label
            </Label>
            <Input
              id="link-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Display text (optional)"
              className="h-8"
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

      {links.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground">No linked content yet</p>
      )}
    </div>
  );
}
