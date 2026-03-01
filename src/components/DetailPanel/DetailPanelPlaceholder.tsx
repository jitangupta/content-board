import { useParams } from 'react-router-dom';

export function DetailPanelPlaceholder() {
  const { contentId, tab } = useParams<{ contentId: string; tab: string }>();

  if (!contentId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Select a content item or create a new one
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">Content: {contentId}</p>
        {tab && (
          <p className="text-sm text-muted-foreground">Tab: {tab}</p>
        )}
      </div>
    </div>
  );
}
