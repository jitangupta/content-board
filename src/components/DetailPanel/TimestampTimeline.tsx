import type { ContentTimestamps, ContentStatus } from '@/types/content';
import { STATUS_ORDER, STATUS_TIMESTAMP_MAP, getStatusLabel } from '@/utils/statusHelpers';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

interface TimestampEntry {
  status: ContentStatus;
  label: string;
  date: Date;
}

function getCompletedTimestamps(timestamps: ContentTimestamps): TimestampEntry[] {
  const entries: TimestampEntry[] = [];

  for (const status of STATUS_ORDER) {
    const field = STATUS_TIMESTAMP_MAP[status];
    if (!field) continue;

    const value = timestamps[field];
    if (!value) continue;

    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      entries.push({
        status,
        label: getStatusLabel(status),
        date,
      });
    }
  }

  return entries;
}

interface TimestampTimelineProps {
  timestamps: ContentTimestamps;
}

export function TimestampTimeline({ timestamps }: TimestampTimelineProps) {
  const entries = getCompletedTimestamps(timestamps);

  if (entries.length === 0) return null;

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div
          key={entry.status}
          className="flex items-center justify-between text-xs text-muted-foreground"
        >
          <span>{entry.label}</span>
          <span>{dateFormatter.format(entry.date)}</span>
        </div>
      ))}
    </div>
  );
}
