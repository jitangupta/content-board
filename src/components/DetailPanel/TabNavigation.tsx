import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TAB_OPTIONS = [
  { value: 'content', label: 'Content' },
  { value: 'production', label: 'Production' },
  { value: 'learn', label: 'Learn' },
  { value: 'feedback', label: 'Feedback' },
] as const;

interface TabNavigationProps {
  contentId: string;
  activeTab: string;
}

export function TabNavigation({ contentId, activeTab }: TabNavigationProps) {
  const navigate = useNavigate();

  function handleTabChange(tab: string): void {
    navigate(`/content/${contentId}/${tab}`);
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        {TAB_OPTIONS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
