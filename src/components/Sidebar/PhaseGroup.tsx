import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ContentItem as ContentItemType, ContentPhase } from '@/types/content';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ContentItem } from '@/components/Sidebar/ContentItem';
import { cn } from '@/lib/utils';

const PHASE_LABELS: Record<ContentPhase, string> = {
  'pre-production': 'Pre-Production',
  'production': 'Production',
  'post-production': 'Post-Production',
};

interface PhaseGroupProps {
  phase: ContentPhase;
  items: ContentItemType[];
}

export function PhaseGroup({ phase, items }: PhaseGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold hover:bg-accent">
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              !open && '-rotate-90',
            )}
          />
          <span>{PHASE_LABELS[phase]}</span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {items.length}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-0.5 px-1 pb-2">
          {items.map((item) => (
            <ContentItem key={item.id} item={item} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
