import type { ContentItem } from '@/types/content';
import { FeedbackList } from '@/features/feedback/FeedbackList';

interface FeedbackTabProps {
  item: ContentItem;
}

export function FeedbackTab({ item }: FeedbackTabProps) {
  return (
    <div className="p-6">
      <FeedbackList item={item} />
    </div>
  );
}
