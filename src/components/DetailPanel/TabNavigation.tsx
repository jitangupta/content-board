import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ContentType } from '@/types/content';

const BASE_TABS = [
  { value: 'content', label: 'Content' },
  { value: 'production', label: 'Production' },
  { value: 'learn', label: 'Learn' },
  { value: 'feedback', label: 'Feedback' },
] as const;

const SHORTS_TAB = { value: 'shorts', label: 'Shorts' } as const;

interface TabNavigationProps {
  contentId: string;
  activeTab: string;
  contentType: ContentType;
}

export function TabNavigation({ contentId, activeTab, contentType }: TabNavigationProps) {
  const navigate = useNavigate();

  const tabs = useMemo(() => {
    if (contentType === 'video') {
      return [...BASE_TABS, SHORTS_TAB];
    }
    return BASE_TABS;
  }, [contentType]);

  function handleTabChange(tab: string): void {
    navigate(`/content/${contentId}/${tab}`);
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="w-full md:w-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
