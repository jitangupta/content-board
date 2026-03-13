import { useNavigate, useParams } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { ContentStatus, ContentType } from '@/types/content';

interface ContentItemProps {
  id: string;
  title: string;
  status: ContentStatus;
  contentType: ContentType;
  sortable?: boolean;
  onItemSelect?: () => void;
}

export function ContentItem({ id, title, status, contentType, sortable = false, onItemSelect }: ContentItemProps) {
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId: string }>();
  const isSelected = contentId === id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !sortable,
  });

  // Inline style required — @dnd-kit computes dynamic transform values at runtime
  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined;

  function handleClick(): void {
    navigate(`/content/${id}`);
    onItemSelect?.();
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
        'hover:bg-accent',
        isSelected && 'bg-accent font-medium',
        isDragging && 'opacity-50',
      )}
      data-testid={`content-item-${id}`}
      {...(sortable ? { ...attributes, ...listeners } : {})}
    >
      <span className="flex items-center gap-1.5 min-w-0">
        {contentType === 'short' && (
          <Film className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{title}</span>
      </span>
      <StatusBadge status={status} className="shrink-0" />
    </button>
  );
}
