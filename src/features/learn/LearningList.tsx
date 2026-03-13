import { useState } from 'react';
import { Pencil, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useContent } from '@/features/content/useContent';
import { useLearnings } from '@/features/learn/useLearnings';
import type { ContentItem, Learning } from '@/types/content';

interface LearningListProps {
  content: ContentItem;
  onNavigateToContent: (contentId: string) => void;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(dateString: string): string {
  return dateFormatter.format(new Date(dateString));
}

function generateId(): string {
  return crypto.randomUUID();
}

export function LearningList({
  content,
  onNavigateToContent,
}: LearningListProps) {
  const { contents } = useContent();
  const { add, update, remove } = useLearnings();

  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  const otherContents = contents.filter((c) => c.id !== content.id);

  async function handleAdd(): Promise<void> {
    const trimmed = newText.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const learning: Learning = {
        id: generateId(),
        text: trimmed,
        dateAdded: new Date().toISOString(),
        appliedInContentId: null,
      };
      await add(content.id, learning);
      setNewText('');
      setIsAdding(false);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(learning: Learning): void {
    setEditingId(learning.id);
    setEditText(learning.text);
  }

  async function handleSaveEdit(learning: Learning): Promise<void> {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === learning.text) {
      setEditingId(null);
      return;
    }

    setSaving(true);
    try {
      await update(content.id, { ...learning, text: trimmed });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(learningId: string): Promise<void> {
    setSaving(true);
    try {
      await remove(content.id, learningId);
    } finally {
      setSaving(false);
    }
  }

  async function handleAppliedInChange(
    learning: Learning,
    value: string,
  ): Promise<void> {
    const appliedInContentId = value === 'none' ? null : value;
    await update(content.id, { ...learning, appliedInContentId });
  }

  function getAppliedInTitle(contentId: string): string | undefined {
    return contents.find((c) => c.id === contentId)?.title;
  }

  if (content.learnings.length === 0 && !isAdding) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="mb-1 text-sm">No learnings yet.</p>
          <p className="text-xs">
            Capture what you learned while creating this video.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Learning
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Learning items */}
      {content.learnings.map((learning) => (
        <div
          key={learning.id}
          className="rounded-lg border p-3 space-y-2"
        >
          {editingId === learning.id ? (
            /* Edit mode */
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSaveEdit(learning)}
                  disabled={saving}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View mode */
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm whitespace-pre-wrap">{learning.text}</p>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => startEdit(learning)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
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
                        <AlertDialogTitle>Delete learning?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This learning will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(learning.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(learning.dateAdded)}</span>

                {learning.appliedInContentId && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() =>
                      onNavigateToContent(learning.appliedInContentId!)
                    }
                  >
                    <ExternalLink className="h-3 w-3" />
                    {getAppliedInTitle(learning.appliedInContentId) ||
                      'Linked content'}
                  </button>
                )}
              </div>

              {/* Applied in selector */}
              <div className="pt-1">
                <Select
                  value={learning.appliedInContentId ?? 'none'}
                  onValueChange={(value) =>
                    handleAppliedInChange(learning, value)
                  }
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Applied in..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not applied</SelectItem>
                    {otherContents.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title || 'Untitled'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Inline add form */}
      {isAdding && (
        <div className="rounded-lg border border-dashed p-3 space-y-2">
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="What did you learn?"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={saving || !newText.trim()}>
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewText('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!isAdding && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Learning
        </Button>
      )}
    </div>
  );
}
