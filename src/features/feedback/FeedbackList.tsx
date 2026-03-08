import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { ContentItem, Feedback, FeedbackSource } from '@/types/content';
import { useFeedback } from './useFeedback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SOURCE_OPTIONS: { value: FeedbackSource; label: string }[] = [
  { value: 'self', label: 'Self' },
  { value: 'peer', label: 'Peer' },
  { value: 'family', label: 'Family' },
  { value: 'comment', label: 'Comment' },
];

const SOURCE_COLORS: Record<FeedbackSource, string> = {
  self: 'bg-blue-100 text-blue-700',
  peer: 'bg-purple-100 text-purple-700',
  family: 'bg-green-100 text-green-700',
  comment: 'bg-orange-100 text-orange-700',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(dateString: string): string {
  return dateFormatter.format(new Date(dateString));
}

interface FeedbackListProps {
  item: ContentItem;
}

export function FeedbackList({ item }: FeedbackListProps) {
  const {
    showForm,
    setShowForm,
    newSource,
    setNewSource,
    newText,
    setNewText,
    editingId,
    editSource,
    setEditSource,
    editText,
    setEditText,
    deletingId,
    setDeletingId,
    handleAdd,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
  } = useFeedback(item);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Feedback</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Feedback
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="space-y-2 rounded-md border p-3">
          <Select
            value={newSource}
            onValueChange={(v) => setNewSource(v as FeedbackSource)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter feedback..."
            rows={3}
            className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNewText('');
                setNewSource('self');
              }}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback list */}
      {item.feedback.length === 0 && !showForm && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No feedback yet. Collect feedback from yourself, peers, or viewers.
        </p>
      )}

      {item.feedback.map((fb) => (
        <FeedbackItem
          key={fb.id}
          feedback={fb}
          isEditing={editingId === fb.id}
          editSource={editSource}
          setEditSource={setEditSource}
          editText={editText}
          setEditText={setEditText}
          isDeleting={deletingId === fb.id}
          setDeletingId={setDeletingId}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

interface FeedbackItemProps {
  feedback: Feedback;
  isEditing: boolean;
  editSource: FeedbackSource;
  setEditSource: (value: FeedbackSource) => void;
  editText: string;
  setEditText: (value: string) => void;
  isDeleting: boolean;
  setDeletingId: (value: string | null) => void;
  onStartEdit: (feedback: Feedback) => void;
  onCancelEdit: () => void;
  onSaveEdit: (feedback: Feedback) => Promise<void>;
  onDelete: (feedbackId: string) => Promise<void>;
}

function FeedbackItem({
  feedback,
  isEditing,
  editSource,
  setEditSource,
  editText,
  setEditText,
  isDeleting,
  setDeletingId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: FeedbackItemProps) {
  if (isEditing) {
    return (
      <div className="space-y-2 rounded-md border p-3">
        <Select
          value={editSource}
          onValueChange={(v) => setEditSource(v as FeedbackSource)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onSaveEdit(feedback)}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-md border px-3 py-2.5">
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 rounded px-1.5 py-0.5 text-xs font-medium capitalize ${SOURCE_COLORS[feedback.source]}`}
          data-testid={`source-badge-${feedback.source}`}
        >
          {feedback.source}
        </span>
        <p className="flex-1 text-sm">{feedback.text}</p>
        <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onStartEdit(feedback)}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Edit feedback"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <AlertDialog
            open={isDeleting}
            onOpenChange={(open) => setDeletingId(open ? feedback.id : null)}
          >
            <button
              onClick={() => setDeletingId(feedback.id)}
              className="rounded p-1 text-muted-foreground hover:text-destructive"
              aria-label="Delete feedback"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this feedback. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(feedback.id)}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatDate(feedback.dateAdded)}
      </p>
    </div>
  );
}
