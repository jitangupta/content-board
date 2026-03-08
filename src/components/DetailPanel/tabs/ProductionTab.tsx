import type { ContentItem } from '@/types/content';
import { useProduction } from '@/features/production/useProduction';
import { DemoItemList } from '@/features/production/DemoItemList';
import { TalkingPointList } from '@/features/production/TalkingPointList';

interface ProductionTabProps {
  item: ContentItem;
}

export function ProductionTab({ item }: ProductionTabProps) {
  const {
    showDemoForm,
    setShowDemoForm,
    demoType,
    setDemoType,
    demoDescription,
    setDemoDescription,
    demoError,
    handleAddDemoItem,
    handleToggleDemoVerified,
    handleRemoveDemoItem,

    showTalkingPointForm,
    setShowTalkingPointForm,
    talkingPointText,
    setTalkingPointText,
    talkingPointCategory,
    setTalkingPointCategory,
    talkingPointPriority,
    setTalkingPointPriority,
    talkingPointError,
    handleAddTalkingPoint,
    handleRemoveTalkingPoint,

    shootingScript,
    setShootingScript,
    handleShootingScriptBlur,

    thumbnailIdeas,
    setThumbnailIdeas,
    handleThumbnailIdeasBlur,
  } = useProduction(item);

  return (
    <div className="space-y-6 p-6">
      {/* Demo Items */}
      <DemoItemList
        items={item.demoItems}
        showForm={showDemoForm}
        setShowForm={setShowDemoForm}
        demoType={demoType}
        setDemoType={setDemoType}
        demoDescription={demoDescription}
        setDemoDescription={setDemoDescription}
        demoError={demoError}
        onAdd={handleAddDemoItem}
        onToggleVerified={handleToggleDemoVerified}
        onRemove={handleRemoveDemoItem}
      />

      {/* Talking Points */}
      <TalkingPointList
        points={item.talkingPoints}
        showForm={showTalkingPointForm}
        setShowForm={setShowTalkingPointForm}
        text={talkingPointText}
        setText={setTalkingPointText}
        category={talkingPointCategory}
        setCategory={setTalkingPointCategory}
        priority={talkingPointPriority}
        setPriority={setTalkingPointPriority}
        error={talkingPointError}
        onAdd={handleAddTalkingPoint}
        onRemove={handleRemoveTalkingPoint}
      />

      {/* Shooting Script */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium">Shooting Script</h3>
        <textarea
          value={shootingScript}
          onChange={(e) => setShootingScript(e.target.value)}
          onBlur={handleShootingScriptBlur}
          placeholder="Outline your scene-by-scene flow..."
          rows={6}
          className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Thumbnail Ideas */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium">Thumbnail Ideas</h3>
        <textarea
          value={thumbnailIdeas}
          onChange={(e) => setThumbnailIdeas(e.target.value)}
          onBlur={handleThumbnailIdeasBlur}
          placeholder="Describe visual concepts for thumbnails (one per line)..."
          rows={4}
          className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
