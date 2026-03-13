import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormActions } from '@/components/common/FormActions';
import { DemoItemList } from '@/features/production/DemoItemList';
import { TalkingPointList } from '@/features/production/TalkingPointList';
import { useFormDraft } from '@/hooks/useFormDraft';
import type { ContentItem } from '@/types/content';

interface ProductionTabProps {
  content: ContentItem;
}

const NULLABLE_FIELDS = ['shootingScript', 'thumbnailIdeas'];

export function ProductionTab({ content }: ProductionTabProps) {
  const isShort = content.contentType === 'short';

  const { values, setValue, isDirty, save, discard, saving, error } =
    useFormDraft({
      contentId: content.id,
      initialValues: isShort
        ? {}
        : {
            shootingScript: content.shootingScript ?? '',
            thumbnailIdeas: content.thumbnailIdeas ?? '',
          },
      nullableFields: isShort ? [] : NULLABLE_FIELDS,
    });

  return (
    <div className="space-y-6 py-4">
      {/* Demo Items */}
      <DemoItemList contentId={content.id} items={content.demoItems} />

      {/* Talking Points */}
      <TalkingPointList contentId={content.id} points={content.talkingPoints} />

      {/* Shooting Script — videos only */}
      {!isShort && (
        <div className="space-y-1.5">
          <Label htmlFor="shooting-script">Shooting Script</Label>
          <Textarea
            id="shooting-script"
            value={values.shootingScript ?? ''}
            onChange={(e) => setValue('shootingScript', e.target.value)}
            placeholder="Outline your scene-by-scene flow..."
            rows={6}
          />
        </div>
      )}

      {/* Thumbnail Ideas — videos only */}
      {!isShort && (
        <div className="space-y-1.5">
          <Label htmlFor="thumbnail-ideas">Thumbnail Ideas</Label>
          <Textarea
            id="thumbnail-ideas"
            value={values.thumbnailIdeas ?? ''}
            onChange={(e) => setValue('thumbnailIdeas', e.target.value)}
            placeholder="Describe visual concepts for your thumbnail..."
            rows={4}
          />
        </div>
      )}

      {/* Save / Discard */}
      <FormActions
        isDirty={isDirty}
        saving={saving}
        error={error}
        onSave={save}
        onDiscard={discard}
      />
    </div>
  );
}
