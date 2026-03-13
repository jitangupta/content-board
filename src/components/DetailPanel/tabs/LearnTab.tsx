import { useNavigate } from 'react-router-dom';
import { LearningList } from '@/features/learn/LearningList';
import type { ContentItem } from '@/types/content';

interface LearnTabProps {
  content: ContentItem;
}

export function LearnTab({ content }: LearnTabProps) {
  const navigate = useNavigate();

  function handleNavigateToContent(contentId: string): void {
    navigate(`/content/${contentId}/learn`);
  }

  return (
    <div className="py-4">
      <LearningList
        content={content}
        onNavigateToContent={handleNavigateToContent}
      />
    </div>
  );
}
