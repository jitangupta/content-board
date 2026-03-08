import { Plus, Trash2 } from 'lucide-react';
import type { DemoItem, DemoItemType } from '@/types/content';
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

const DEMO_TYPE_OPTIONS: { value: DemoItemType; label: string }[] = [
  { value: 'repo', label: 'Repo' },
  { value: 'command', label: 'Command' },
  { value: 'live-coding', label: 'Live Coding' },
  { value: 'config-file', label: 'Config File' },
  { value: 'tool-setup', label: 'Tool Setup' },
];

const DEMO_TYPE_LABELS: Record<DemoItemType, string> = {
  'repo': 'Repo',
  'command': 'Command',
  'live-coding': 'Live Coding',
  'config-file': 'Config File',
  'tool-setup': 'Tool Setup',
};

interface DemoItemListProps {
  items: DemoItem[];
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  demoType: DemoItemType;
  setDemoType: (value: DemoItemType) => void;
  demoDescription: string;
  setDemoDescription: (value: string) => void;
  demoError: string;
  onAdd: () => Promise<void>;
  onToggleVerified: (item: DemoItem) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function DemoItemList({
  items,
  showForm,
  setShowForm,
  demoType,
  setDemoType,
  demoDescription,
  setDemoDescription,
  demoError,
  onAdd,
  onToggleVerified,
  onRemove,
}: DemoItemListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Demo Items</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Demo Item
          </button>
        )}
      </div>

      {items.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          No demo items yet. Add repos, commands, or live coding examples to prepare for your recording.
        </p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-2 rounded-md border px-3 py-2"
        >
          <input
            type="checkbox"
            checked={item.verified}
            onChange={() => onToggleVerified(item)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
            aria-label={`Mark "${item.description}" as verified`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                {DEMO_TYPE_LABELS[item.type]}
              </span>
              {item.verified && (
                <span className="text-xs text-green-600">Verified</span>
              )}
            </div>
            <p className="mt-1 text-sm">{item.description}</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                aria-label={`Delete "${item.description}"`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete demo item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{item.description}&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(item.id)}
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
          <Select
            value={demoType}
            // Select onValueChange returns string, but values are constrained to DEMO_TYPE_OPTIONS which are all DemoItemType
            onValueChange={(v) => setDemoType(v as DemoItemType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEMO_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="text"
            value={demoDescription}
            onChange={(e) => setDemoDescription(e.target.value)}
            placeholder="Describe the demo item..."
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
          {demoError && (
            <p className="text-xs text-destructive">{demoError}</p>
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
