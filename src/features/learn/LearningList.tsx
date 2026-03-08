import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { ContentItem, Learning } from '@/types/content';
import { useContent } from '@/features/content/useContent';
import { useLearnings } from '@/features/learn/useLearnings';
import { useNavigate } from 'react-router-dom';
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

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

interface LearningListProps {
  item: ContentItem;
}

export function LearningList({ item }: LearningListProps) {
  const { contents } = useContent();
  const navigate = useNavigate();
  const {
    showAddForm,
    setShowAddForm,
    newText,
    setNewText,
    editingId,
    editText,
    setEditText,
    handleAdd,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleAppliedInChange,
  } = useLearnings(item);

  const otherContents = contents.filter((c) => c.id !== item.id);

  function getContentTitle(contentId: string): string {
    const content = contents.find((c) => c.id === contentId);
    return content?.title || 'Untitled';
  }

  function handleNavigateToContent(contentId: string): void {
    navigate(`/content/${contentId}/learn`);
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Learnings</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Learning
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="space-y-2 rounded-md border p-3">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="What did you learn?"
            rows={3}
            className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewText('');
              }}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {item.learnings.length === 0 && !showAddForm && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No learnings yet. Capture what you learned while creating this video.
        </p>
      )}

      {/* Learnings list */}
      {item.learnings.length > 0 && (
        <div className="space-y-3">
          {item.learnings.map((learning) => (
            <LearningItem
              key={learning.id}
              learning={learning}
              isEditing={editingId === learning.id}
              editText={editText}
              setEditText={setEditText}
              otherContents={otherContents}
              getContentTitle={getContentTitle}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onDelete={handleDelete}
              onAppliedInChange={handleAppliedInChange}
              onNavigateToContent={handleNavigateToContent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LearningItemProps {
  learning: Learning;
  isEditing: boolean;
  editText: string;
  setEditText: (value: string) => void;
  otherContents: ContentItem[];
  getContentTitle: (contentId: string) => string;
  onStartEdit: (learning: Learning) => void;
  onCancelEdit: () => void;
  onSaveEdit: (learning: Learning) => Promise<void>;
  onDelete: (learningId: string) => Promise<void>;
  onAppliedInChange: (learning: Learning, contentId: string | null) => Promise<void>;
  onNavigateToContent: (contentId: string) => void;
}

function LearningItem({
  learning,
  isEditing,
  editText,
  setEditText,
  otherContents,
  getContentTitle,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onAppliedInChange,
  onNavigateToContent,
}: LearningItemProps) {
  if (isEditing) {
    return (
      <div className="space-y-2 rounded-md border p-3">
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={() => onSaveEdit(learning)}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 text-sm">{learning.text}</p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onStartEdit(learning)}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Edit learning"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="rounded p-1 text-muted-foreground hover:text-destructive"
                aria-label="Delete learning"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this learning?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this learning. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(learning.id)}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {formatDate(learning.dateAdded)}
        </span>

        <div className="flex items-center gap-1.5">
          {learning.appliedInContentId ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Applied in:</span>
              <button
                onClick={() => {
                  if (learning.appliedInContentId) {
                    onNavigateToContent(learning.appliedInContentId);
                  }
                }}
                className="text-xs text-primary hover:underline"
              >
                {getContentTitle(learning.appliedInContentId)}
              </button>
              <button
                onClick={() => onAppliedInChange(learning, null)}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Remove applied-in link"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <Select
              onValueChange={(value) => onAppliedInChange(learning, value)}
            >
              <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-xs text-muted-foreground">
                <SelectValue placeholder="Applied in..." />
              </SelectTrigger>
              <SelectContent>
                {otherContents.map((content) => (
                  <SelectItem key={content.id} value={content.id}>
                    {content.title || 'Untitled'}
                  </SelectItem>
                ))}
                {otherContents.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    No other content items
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
