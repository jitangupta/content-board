import type { ContentStatus } from '@/types/content';
import { getStatusLabel } from '@/utils/statusHelpers';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<ContentStatus, string> = {
  // Pre-Production: blue tones
  'draft': 'bg-blue-100 text-blue-700',
  'technically-ready': 'bg-blue-200 text-blue-800',
  'shooting-script-ready': 'bg-blue-300 text-blue-900',
  'ready-to-record': 'bg-blue-400 text-blue-950',
  // Production: amber tones
  'recorded': 'bg-amber-100 text-amber-700',
  'edited': 'bg-amber-200 text-amber-800',
  // Post-Production: green tones
  'published': 'bg-green-100 text-green-700',
  'extracted-shorts': 'bg-green-200 text-green-800',
  // Terminal: gray
  'lifetime-value-ends': 'bg-gray-100 text-gray-600',
};

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_COLORS[status],
        className,
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
