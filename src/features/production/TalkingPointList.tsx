import { useCallback, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useProduction } from '@/features/production/useProduction';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import type {
  TalkingPoint,
  TalkingPointCategory,
  TalkingPointPriority,
} from '@/types/content';

interface TalkingPointListProps {
  contentId: string;
  points: TalkingPoint[];
}

const CATEGORY_LABELS: Record<TalkingPointCategory, string> = {
  technical: 'Technical',
  engagement: 'Engagement',
  cta: 'CTA',
};

const CATEGORY_STYLES: Record<TalkingPointCategory, string> = {
  technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  engagement:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cta: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const CATEGORY_OPTIONS: TalkingPointCategory[] = [
  'technical',
  'engagement',
  'cta',
];

const PRIORITY_OPTIONS: TalkingPointPriority[] = ['must-say', 'nice-to-have'];

interface SortableTalkingPointItemProps {
  point: TalkingPoint;
  index: number;
  onRemove: (pointId: string) => void;
}

function SortableTalkingPointItem({ point, index, onRemove }: SortableTalkingPointItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: point.id });

  // Inline style required — @dnd-kit computes dynamic transform values at runtime
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 rounded-md border border-border px-3 py-2 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        &#x283F;
      </button>
      <span className="mt-0.5 shrink-0 text-xs font-medium text-muted-foreground">
        {index + 1}.
      </span>
      <span
        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
          point.priority === 'must-say'
            ? 'bg-red-500 dark:bg-red-400'
            : 'bg-gray-400 dark:bg-gray-500'
        }`}
        title={
          point.priority === 'must-say' ? 'Must say' : 'Nice to have'
        }
      />
      <span className="min-w-0 flex-1 text-sm">{point.text}</span>
      <Badge
        variant="secondary"
        className={`shrink-0 text-xs ${CATEGORY_STYLES[point.category]}`}
      >
        {CATEGORY_LABELS[point.category]}
      </Badge>
      <div className="shrink-0">
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
                Remove talking point?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will remove this talking point from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onRemove(point.id)}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

export function TalkingPointList({
  contentId,
  points,
}: TalkingPointListProps) {
  const { addTalkingPoint, removeTalkingPoint, talkingPointOp, handleReorderTalkingPoints } =
    useProduction();

  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<TalkingPointCategory>('technical');
  const [priority, setPriority] = useState<TalkingPointPriority>('must-say');

  const sortedPoints = useMemo(
    () => [...points].sort((a, b) => a.order - b.order),
    [points],
  );

  const pointIds = useMemo(
    () => sortedPoints.map((p) => p.id),
    [sortedPoints],
  );

  const handleReorder = useCallback(
    async (orderedIds: string[]): Promise<void> => {
      await handleReorderTalkingPoints(contentId, orderedIds);
    },
    [contentId, handleReorderTalkingPoints],
  );

  const { sensors, handleDragEnd } = useDragAndDrop({
    items: pointIds,
    onReorder: handleReorder,
  });

  function resetForm(): void {
    setText('');
    setCategory('technical');
    setPriority('must-say');
    setShowForm(false);
  }

  async function handleAdd(): Promise<void> {
    if (!text.trim()) return;

    const newPoint: TalkingPoint = {
      id: crypto.randomUUID(),
      text: text.trim(),
      category,
      priority,
      order: points.length,
    };

    await addTalkingPoint(contentId, newPoint);
    resetForm();
  }

  async function handleRemove(pointId: string): Promise<void> {
    await removeTalkingPoint(contentId, pointId);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Talking Points</Label>
        {!showForm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(true)}
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Talking Point
          </Button>
        )}
      </div>

      {sortedPoints.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pointIds}
            strategy={verticalListSortingStrategy}
          >
            <ol className="space-y-2">
              {sortedPoints.map((point, index) => (
                <SortableTalkingPointItem
                  key={point.id}
                  point={point}
                  index={index}
                  onRemove={handleRemove}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      {showForm && (
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="space-y-1.5">
            <Label htmlFor="tp-text" className="text-xs">
              Talking Point
            </Label>
            <Input
              id="tp-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What to mention..."
              className="h-8"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tp-category" className="text-xs">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(v) =>
                  setCategory(v as TalkingPointCategory)
                }
              >
                <SelectTrigger id="tp-category" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {CATEGORY_LABELS[opt]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tp-priority" className="text-xs">
                Priority
              </Label>
              <Select
                value={priority}
                onValueChange={(v) =>
                  setPriority(v as TalkingPointPriority)
                }
              >
                <SelectTrigger id="tp-priority" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === 'must-say' ? 'Must Say' : 'Nice to Have'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!text.trim() || talkingPointOp.loading}
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

      {points.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground">
          No talking points yet. Add key things to mention in your video.
        </p>
      )}

      {talkingPointOp.error && (
        <p className="text-xs text-destructive">{talkingPointOp.error}</p>
      )}
    </div>
  );
}
