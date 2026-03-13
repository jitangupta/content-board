import { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ContentItem } from '@/components/Sidebar/ContentItem';
import { useContent } from '@/features/content/useContent';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import type { ContentItem as ContentItemData, ContentPhase } from '@/types/content';

interface PhaseGroupProps {
  phase: ContentPhase;
  items: ContentItemData[];
  onItemSelect?: () => void;
}

const PHASE_LABELS: Record<ContentPhase, string> = {
  'pre-production': 'Pre-Production',
  'production': 'Production',
  'post-production': 'Post-Production',
};

export function PhaseGroup({ phase, items, onItemSelect }: PhaseGroupProps) {
  const [open, setOpen] = useState(true);
  const isSortable = phase === 'pre-production';
  const { reorderContents } = useContent();

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const handleReorder = useCallback(
    async (orderedIds: string[]): Promise<void> => {
      await reorderContents(orderedIds);
    },
    [reorderContents],
  );

  const { sensors, handleDragEnd } = useDragAndDrop({
    items: itemIds,
    onReorder: handleReorder,
  });

  const itemList = items.map((item) => (
    <ContentItem
      key={item.id}
      id={item.id}
      title={item.title}
      status={item.status}
      contentType={item.contentType}
      sortable={isSortable}
      onItemSelect={onItemSelect}
    />
  ));

  return (
    <Collapsible open={open} onOpenChange={setOpen} data-testid={`phase-group-${phase}`}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <span>{PHASE_LABELS[phase] ?? phase}</span>
        <span className="flex items-center gap-1">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {items.length}
          </span>
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              open && 'rotate-180',
            )}
          />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 pb-2">
          {isSortable ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                {itemList}
              </SortableContext>
            </DndContext>
          ) : (
            itemList
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
