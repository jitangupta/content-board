import { Trash2, Plus, ExternalLink, X } from 'lucide-react';
import type { ContentItem, LinkedContentPlatform } from '@/types/content';
import { useContentTab } from '@/hooks/useContentTab';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChipInput } from '@/components/common/ChipInput';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PLATFORM_OPTIONS: { value: LinkedContentPlatform; label: string }[] = [
  { value: 'blog', label: 'Blog' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'other', label: 'Other' },
];

interface ContentTabProps {
  item: ContentItem;
}

export function ContentTab({ item }: ContentTabProps) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    notes,
    setNotes,
    youtubeUrl,
    setYoutubeUrl,
    deleting,
    showYoutubeField,
    showLinkForm,
    setShowLinkForm,
    linkPlatform,
    setLinkPlatform,
    linkUrl,
    setLinkUrl,
    linkLabel,
    setLinkLabel,
    linkError,
    setLinkError,
    handleBlur,
    handleYoutubeBlur,
    handleTagsChange,
    handleDelete,
    handleAddLink,
    handleRemoveLink,
  } = useContentTab(item);

  return (
    <div className="space-y-6 p-6">
      {/* Header with title + delete */}
      <div className="flex items-start gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur('title', title, item.title)}
          placeholder="Untitled"
          className="flex-1 bg-transparent text-xl font-semibold outline-none placeholder:text-muted-foreground"
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete content"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete &quot;{item.title || 'Untitled'}&quot;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this content and all its data.
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">Status</label>
        <div>
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => handleBlur('description', description, item.description)}
          placeholder="What is this content about?"
          rows={3}
          className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">Tags</label>
        <ChipInput
          value={item.tags}
          onChange={handleTagsChange}
          placeholder="Add tag and press Enter..."
        />
      </div>

      {/* YouTube URL — only shown when published or later */}
      {showYoutubeField && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">YouTube URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onBlur={handleYoutubeBlur}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      {/* Linked Content */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">Linked Content</label>
          {!showLinkForm && (
            <button
              onClick={() => setShowLinkForm(true)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Link
            </button>
          )}
        </div>

        {/* Existing links */}
        {item.linkedContent.length > 0 && (
          <div className="space-y-1.5">
            {item.linkedContent.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium capitalize">
                  {link.platform}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-primary hover:underline"
                >
                  {link.label}
                  <ExternalLink className="ml-1 inline h-3 w-3" />
                </a>
                <button
                  onClick={() => handleRemoveLink(link.id)}
                  className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${link.label}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add link form */}
        {showLinkForm && (
          <div className="space-y-2 rounded-md border p-3">
            <Select
              value={linkPlatform}
              // Select onValueChange returns string, but values are constrained to PLATFORM_OPTIONS which are all LinkedContentPlatform
              onValueChange={(v) => setLinkPlatform(v as LinkedContentPlatform)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Link label"
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
            {linkError && (
              <p className="text-xs text-destructive">{linkError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAddLink}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowLinkForm(false);
                  setLinkError('');
                }}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => handleBlur('notes', notes, item.notes)}
          placeholder="Any additional notes..."
          rows={4}
          className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
