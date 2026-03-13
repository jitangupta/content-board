import { FeedbackList } from '@/features/feedback/FeedbackList';
import type { ContentItem } from '@/types/content';

interface FeedbackTabProps {
  content: ContentItem;
}

export function FeedbackTab({ content }: FeedbackTabProps) {
  return (
    <div className="space-y-4 pt-4">
      <FeedbackList contentId={content.id} feedback={content.feedback} />
    </div>
  );
}
