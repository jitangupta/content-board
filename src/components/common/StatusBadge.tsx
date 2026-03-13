import { cn } from '@/lib/utils';
import { getStatusLabel } from '@/utils/statusHelpers';
import type { ContentStatus } from '@/types/content';

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const STATUS_COLOR_MAP: Record<ContentStatus, string> = {
  'draft': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'technically-ready': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'shooting-script-ready': 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'ready-to-record': 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'recorded': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'edited': 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'published': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  'extracted-shorts': 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
  'lifetime-value-ends': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_COLOR_MAP[status],
        className,
      )}
      data-testid="status-badge"
      data-status={status}
    >
      {getStatusLabel(status)}
    </span>
  );
}
