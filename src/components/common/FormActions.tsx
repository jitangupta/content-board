import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isDirty: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onDiscard: () => void;
}

export function FormActions({
  isDirty,
  saving,
  error,
  onSave,
  onDiscard,
}: FormActionsProps) {
  if (!isDirty) return null;

  return (
    <div className="sticky bottom-0 border-t bg-background px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <Button onClick={onSave} disabled={saving} size="sm">
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button onClick={onDiscard} variant="outline" size="sm" disabled={saving}>
          Discard
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
