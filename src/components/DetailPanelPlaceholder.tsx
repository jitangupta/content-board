import { useParams } from 'react-router-dom';

export function DetailPanelPlaceholder() {
  const { contentId, tab = 'content' } = useParams<{
    contentId: string;
    tab?: string;
  }>();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <p className="text-sm font-medium">Detail Panel Placeholder</p>
      <p className="text-xs">Content ID: {contentId}</p>
      <p className="text-xs">Active tab: {tab}</p>
    </div>
  );
}
