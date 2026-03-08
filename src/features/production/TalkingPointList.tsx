import { Plus, Trash2 } from 'lucide-react';
import type { TalkingPoint, TalkingPointCategory, TalkingPointPriority } from '@/types/content';
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

const CATEGORY_OPTIONS: { value: TalkingPointCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'cta', label: 'CTA' },
];

const CATEGORY_LABELS: Record<TalkingPointCategory, string> = {
  technical: 'Technical',
  engagement: 'Engagement',
  cta: 'CTA',
};

const PRIORITY_OPTIONS: { value: TalkingPointPriority; label: string }[] = [
  { value: 'must-say', label: 'Must Say' },
  { value: 'nice-to-have', label: 'Nice to Have' },
];

interface TalkingPointListProps {
  points: TalkingPoint[];
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  text: string;
  setText: (value: string) => void;
  category: TalkingPointCategory;
  setCategory: (value: TalkingPointCategory) => void;
  priority: TalkingPointPriority;
  setPriority: (value: TalkingPointPriority) => void;
  error: string;
  onAdd: () => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function TalkingPointList({
  points,
  showForm,
  setShowForm,
  text,
  setText,
  category,
  setCategory,
  priority,
  setPriority,
  error,
  onAdd,
  onRemove,
}: TalkingPointListProps) {
  const sorted = [...points].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Talking Points</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Talking Point
          </button>
        )}
      </div>

      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          No talking points yet. Add key points you want to cover in your video.
        </p>
      )}

      {sorted.map((point, index) => (
        <div
          key={point.id}
          className="flex items-start gap-2 rounded-md border px-3 py-2"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                {CATEGORY_LABELS[point.category]}
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  point.priority === 'must-say' ? 'bg-red-500' : 'bg-gray-400'
                }`}
                title={point.priority === 'must-say' ? 'Must say' : 'Nice to have'}
              />
            </div>
            <p className="mt-1 text-sm">{point.text}</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                aria-label={`Delete talking point "${point.text}"`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete talking point?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this talking point.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(point.id)}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}

      {showForm && (
        <div className="space-y-2 rounded-md border p-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to say?"
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-2">
            <Select
              value={category}
              // Select onValueChange returns string, but values are constrained to CATEGORY_OPTIONS which are all TalkingPointCategory
              onValueChange={(v) => setCategory(v as TalkingPointCategory)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              // Select onValueChange returns string, but values are constrained to PRIORITY_OPTIONS which are all TalkingPointPriority
              onValueChange={(v) => setPriority(v as TalkingPointPriority)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
