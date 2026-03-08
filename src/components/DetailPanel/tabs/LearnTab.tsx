import type { ContentItem } from '@/types/content';
import { LearningList } from '@/features/learn/LearningList';

interface LearnTabProps {
  item: ContentItem;
}

export function LearnTab({ item }: LearnTabProps) {
  return (
    <div className="p-6">
      <LearningList item={item} />
    </div>
  );
}
