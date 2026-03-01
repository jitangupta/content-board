import { useParams } from 'react-router-dom';
import { useContent } from '@/features/content/useContent';
import { TabNavigation } from '@/components/DetailPanel/TabNavigation';
import { ContentTab } from '@/components/DetailPanel/tabs/ContentTab';
import { ProductionTab } from '@/components/DetailPanel/tabs/ProductionTab';
import { LearnTab } from '@/components/DetailPanel/tabs/LearnTab';
import { FeedbackTab } from '@/components/DetailPanel/tabs/FeedbackTab';

const VALID_TABS = ['content', 'production', 'learn', 'feedback'] as const;
type TabName = (typeof VALID_TABS)[number];

function isValidTab(tab: string): tab is TabName {
  return (VALID_TABS as readonly string[]).includes(tab);
}

export function DetailPanel() {
  const { contentId, tab } = useParams<{ contentId: string; tab: string }>();
  const { contents, loading } = useContent();

  if (!contentId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Select a content item or create a new one
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-32 w-full rounded bg-muted" />
      </div>
    );
  }

  const item = contents.find((c) => c.id === contentId);

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Content not found</p>
          <p className="text-sm text-muted-foreground">
            This content may have been deleted
          </p>
        </div>
      </div>
    );
  }

  const activeTab = tab && isValidTab(tab) ? tab : 'content';

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 pt-4 pb-0">
        <TabNavigation contentId={contentId} activeTab={activeTab} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' && <ContentTab item={item} />}
        {activeTab === 'production' && <ProductionTab />}
        {activeTab === 'learn' && <LearnTab />}
        {activeTab === 'feedback' && <FeedbackTab />}
      </div>
    </div>
  );
}
