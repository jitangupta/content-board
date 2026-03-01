import { useNavigate, useParams } from 'react-router-dom';
import type { ContentItem as ContentItemType } from '@/types/content';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

interface ContentItemProps {
  item: ContentItemType;
}

export function ContentItem({ item }: ContentItemProps) {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const isSelected = contentId === item.id;

  function handleClick(): void {
    navigate(`/content/${item.id}`);
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
        isSelected && 'bg-accent',
      )}
    >
      <span className="truncate font-medium">
        {item.title || 'Untitled'}
      </span>
      <StatusBadge status={item.status} />
    </button>
  );
}
