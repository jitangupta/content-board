import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChipInput } from '@/components/common/ChipInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FormActions } from '@/components/common/FormActions';
import { LinkedContentSection } from '@/components/DetailPanel/LinkedContentSection';
import { PlatformVersionSection } from '@/components/DetailPanel/PlatformVersionSection';
import { useContent } from '@/features/content/useContent';
import { useFormDraft } from '@/hooks/useFormDraft';
import { captureError } from '@/services/sentry';
import { STATUS_ORDER } from '@/utils/statusHelpers';
import type { ContentItem } from '@/types/content';

interface ContentTabProps {
  content: ContentItem;
}

const PUBLISHED_INDEX = STATUS_ORDER.indexOf('published');
const VIDEO_NULLABLE_FIELDS = ['notes', 'youtubeUrl'];
const SHORT_NULLABLE_FIELDS = ['notes', 'youtubeUrl', 'script'];

export function ContentTab({ content }: ContentTabProps) {
  const { updateContent } = useContent();
  const isShort = content.contentType === 'short';

  const { values, setValue, isDirty, save, discard, saving, error } =
    useFormDraft({
      contentId: content.id,
      initialValues: {
        title: content.title,
        description: content.description,
        notes: content.notes ?? '',
        youtubeUrl: content.youtubeUrl ?? '',
        ...(isShort ? { script: content.script ?? '' } : {}),
      },
      nullableFields: isShort ? SHORT_NULLABLE_FIELDS : VIDEO_NULLABLE_FIELDS,
    });

  const showYoutubeUrl =
    STATUS_ORDER.indexOf(content.status) >= PUBLISHED_INDEX;

  async function handleTagsChange(tags: string[]): Promise<void> {
    try {
      await updateContent(content.id, { tags });
    } catch (err: unknown) {
      captureError(err, {
        operation: 'updateContent',
        contentId: content.id,
        field: 'tags',
      });
    }
  }

  return (
    <div className="space-y-6 py-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="content-title">Title</Label>
        <Input
          id="content-title"
          value={values.title}
          onChange={(e) => setValue('title', e.target.value)}
          placeholder="Content title"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="content-description">Description</Label>
        <Textarea
          id="content-description"
          value={values.description}
          onChange={(e) => setValue('description', e.target.value)}
          placeholder="What is this content about?"
          rows={3}
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <ChipInput
          values={content.tags}
          onChange={handleTagsChange}
          placeholder="Add a tag and press Enter"
        />
      </div>

      {/* Script — only shown for shorts */}
      {isShort && (
        <div className="space-y-1.5">
          <Label htmlFor="content-script">Script</Label>
          <Textarea
            id="content-script"
            value={values.script ?? ''}
            onChange={(e) => setValue('script', e.target.value)}
            placeholder="Write your short-form script..."
            rows={6}
          />
        </div>
      )}

      {/* Status (read-only) */}
      <div className="space-y-1.5">
        <Label>Status</Label>
        <div>
          <StatusBadge status={content.status} />
        </div>
      </div>

      {/* YouTube URL — only shown when published or later */}
      {showYoutubeUrl && (
        <div className="space-y-1.5">
          <Label htmlFor="content-youtube-url">YouTube URL</Label>
          <Input
            id="content-youtube-url"
            type="url"
            value={values.youtubeUrl}
            onChange={(e) => setValue('youtubeUrl', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      )}

      {/* Linked Content */}
      <LinkedContentSection
        contentId={content.id}
        links={content.linkedContent}
      />

      {/* Platform Versions — only shown for shorts */}
      {isShort && (
        <PlatformVersionSection
          contentId={content.id}
          versions={content.platformVersions}
        />
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="content-notes">Notes</Label>
        <Textarea
          id="content-notes"
          value={values.notes}
          onChange={(e) => setValue('notes', e.target.value)}
          placeholder="Any additional notes..."
          rows={4}
        />
      </div>

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
