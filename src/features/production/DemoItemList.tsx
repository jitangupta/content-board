import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import type { DemoItem, DemoItemType } from '@/types/content';

interface DemoItemListProps {
  contentId: string;
  items: DemoItem[];
}

const DEMO_TYPE_LABELS: Record<DemoItemType, string> = {
  repo: 'Repo',
  command: 'Command',
  'live-coding': 'Live Coding',
  'config-file': 'Config File',
  'tool-setup': 'Tool Setup',
};

const DEMO_TYPE_OPTIONS: DemoItemType[] = [
  'repo',
  'command',
  'live-coding',
  'config-file',
  'tool-setup',
];

export function DemoItemList({ contentId, items }: DemoItemListProps) {
  const { addDemoItem, updateDemoItem, removeDemoItem, demoItemOp } =
    useProduction();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<DemoItemType>('repo');
  const [description, setDescription] = useState('');

  function resetForm(): void {
    setType('repo');
    setDescription('');
    setShowForm(false);
  }

  async function handleAdd(): Promise<void> {
    if (!description.trim()) return;

    const newItem: DemoItem = {
      id: crypto.randomUUID(),
      type,
      description: description.trim(),
      verified: false,
    };

    await addDemoItem(contentId, newItem);
    resetForm();
  }

  async function handleToggleVerified(item: DemoItem): Promise<void> {
    await updateDemoItem(contentId, { ...item, verified: !item.verified });
  }

  async function handleRemove(demoItemId: string): Promise<void> {
    await removeDemoItem(contentId, demoItemId);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Demo Items</Label>
        {!showForm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(true)}
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Demo Item
          </Button>
        )}
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <input
                type="checkbox"
                checked={item.verified}
                onChange={() => handleToggleVerified(item)}
                className="h-4 w-4 shrink-0 rounded border-border accent-primary"
                aria-label={`Mark "${item.description}" as verified`}
              />
              <Badge variant="outline" className="shrink-0 text-xs">
                {DEMO_TYPE_LABELS[item.type]}
              </Badge>
              <span
                className={`min-w-0 flex-1 text-sm ${
                  item.verified ? 'text-muted-foreground line-through' : ''
                }`}
              >
                {item.description}
              </span>
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
                      <AlertDialogTitle>Remove demo item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove &quot;{item.description}&quot; from
                        your demo items.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(item.id)}>
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
            <Label htmlFor="demo-type" className="text-xs">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as DemoItemType)}
            >
              <SelectTrigger id="demo-type" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMO_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {DEMO_TYPE_LABELS[opt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="demo-description" className="text-xs">
              Description
            </Label>
            <Input
              id="demo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What to demo..."
              className="h-8"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!description.trim() || demoItemOp.loading}
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

      {items.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground">
          No demo items yet. Add repos, commands, or other items to demo in your
          video.
        </p>
      )}

      {demoItemOp.error && (
        <p className="text-xs text-destructive">{demoItemOp.error}</p>
      )}
    </div>
  );
}
