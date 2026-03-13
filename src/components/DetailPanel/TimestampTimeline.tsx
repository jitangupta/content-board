import { getStatusLabel, getStatusOrderForType, getStatusTimestampMap } from '@/utils/statusHelpers';
import type { ContentTimestamps, ContentType } from '@/types/content';

interface TimestampTimelineProps {
  timestamps: ContentTimestamps;
  contentType: ContentType;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

function toDate(value: string | FirestoreTimestamp): Date | null {
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    if (typeof value.toDate === 'function') return value.toDate();
    return new Date(value.seconds * 1000);
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function formatTimestamp(value: string | FirestoreTimestamp): string {
  const date = toDate(value);
  if (!date) return String(value);
  return dateFormatter.format(date);
}

export function TimestampTimeline({ timestamps, contentType }: TimestampTimelineProps) {
  const entries: { label: string; date: string }[] = [];
  const statusOrder = getStatusOrderForType(contentType);
  const timestampMap = getStatusTimestampMap(contentType);

  // Firestore returns Timestamp objects at runtime despite string type declarations; double cast required
  const created = timestamps.created as unknown as string | FirestoreTimestamp;
  if (created) {
    entries.push({ label: 'Created', date: formatTimestamp(created) });
  }

  for (const status of statusOrder) {
    const field = timestampMap[status];
    if (!field) continue;
    // Firestore Timestamp vs string mismatch — same as created above
    const value = timestamps[field] as unknown as string | FirestoreTimestamp | null;
    if (value) {
      entries.push({ label: getStatusLabel(status), date: formatTimestamp(value) });
    }
  }

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5" data-testid="timestamp-timeline">
      {entries.map((entry) => (
        <div key={entry.label} className="flex items-center justify-between gap-4 text-xs">
          <span className="font-medium text-muted-foreground">{entry.label}</span>
          <span className="text-foreground">{entry.date}</span>
        </div>
      ))}
    </div>
  );
}
