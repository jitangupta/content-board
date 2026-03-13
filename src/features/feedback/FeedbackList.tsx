import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useFeedback } from '@/features/feedback/useFeedback';
import { SOURCE_LABELS, SOURCE_COLORS } from '@/features/feedback/feedbackConstants';
import type { Feedback, FeedbackSource } from '@/types/content';

interface FeedbackListProps {
  contentId: string;
  feedback: Feedback[];
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function FeedbackList({ contentId, feedback }: FeedbackListProps) {
  const { addFeedback, updateFeedback, removeFeedback } = useFeedback();
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState<FeedbackSource>('self');
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSource, setEditSource] = useState<FeedbackSource>('self');
  const [editText, setEditText] = useState('');
  const [opError, setOpError] = useState<string | null>(null);

  function resetForm(): void {
    setSource('self');
    setText('');
    setShowForm(false);
  }

  function startEdit(item: Feedback): void {
    setEditingId(item.id);
    setEditSource(item.source);
    setEditText(item.text);
  }

  function cancelEdit(): void {
    setEditingId(null);
    setEditSource('self');
    setEditText('');
  }

  async function handleAdd(): Promise<void> {
    if (!text.trim()) return;
    try {
      setOpError(null);
      await addFeedback(contentId, source, text);
      resetForm();
    } catch {
      setOpError('Failed to add feedback');
    }
  }

  async function handleUpdate(item: Feedback): Promise<void> {
    if (!editText.trim()) return;
    try {
      setOpError(null);
      await updateFeedback(contentId, {
        ...item,
        source: editSource,
        text: editText.trim(),
      });
      cancelEdit();
    } catch {
      setOpError('Failed to update feedback');
    }
  }

  async function handleRemove(feedbackId: string): Promise<void> {
    try {
      setOpError(null);
      await removeFeedback(contentId, feedbackId);
    } catch {
      setOpError('Failed to delete feedback');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Feedback</Label>
        {!showForm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(true)}
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Feedback
          </Button>
        )}
      </div>

      {opError && (
        <p className="text-xs text-destructive">{opError}</p>
      )}

      {feedback.length > 0 && (
        <ul className="space-y-2">
          {feedback.map((item) => (
            <li
              key={item.id}
              className="rounded-md border border-border px-3 py-2"
            >
              {editingId === item.id ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-source" className="text-xs">
                      Source
                    </Label>
                    <Select
                      value={editSource}
                      onValueChange={(v) => setEditSource(v as FeedbackSource)}
                    >
                      <SelectTrigger id="edit-source" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="peer">Peer</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="comment">Comment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-text" className="text-xs">
                      Feedback
                    </Label>
                    <Textarea
                      id="edit-text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleUpdate(item)}
                      className="h-7 text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_COLORS[item.source]}`}
                      data-testid={`source-badge-${item.source}`}
                    >
                      {SOURCE_LABELS[item.source]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.dateAdded)}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(item)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
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
                            <AlertDialogTitle>
                              Delete feedback?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this feedback entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <p className="text-sm">{item.text}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="space-y-1.5">
            <Label htmlFor="feedback-source" className="text-xs">
              Source
            </Label>
            <Select
              value={source}
              onValueChange={(v) => setSource(v as FeedbackSource)}
            >
              <SelectTrigger id="feedback-source" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Self</SelectItem>
                <SelectItem value="peer">Peer</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="feedback-text" className="text-xs">
              Feedback
            </Label>
            <Textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What feedback did you receive?"
              rows={3}
              className="resize-none text-sm"
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

      {feedback.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground">
          No feedback yet. Collect feedback from yourself, peers, or viewers.
        </p>
      )}
    </div>
  );
}
