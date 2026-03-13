import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useContent } from '@/features/content/useContent';
import { captureError } from '@/services/sentry';

interface UseFormDraftOptions {
  contentId: string;
  initialValues: Record<string, string>;
  nullableFields?: string[];
}

interface UseFormDraftReturn {
  values: Record<string, string>;
  setValue: (field: string, value: string) => void;
  isDirty: boolean;
  save: () => Promise<void>;
  discard: () => void;
  saving: boolean;
  error: string | null;
}

export function useFormDraft({
  contentId,
  initialValues,
  nullableFields = [],
}: UseFormDraftOptions): UseFormDraftReturn {
  const { updateContent } = useContent();
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [baseline, setBaseline] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevContentIdRef = useRef(contentId);

  // Resync when contentId changes (navigating between items)
  useEffect(() => {
    if (prevContentIdRef.current !== contentId) {
      prevContentIdRef.current = contentId;
      setValues(initialValues);
      setBaseline(initialValues);
      setError(null);
    }
  }, [contentId, initialValues]);

  const nullableSet = useMemo(() => new Set(nullableFields), [nullableFields]);

  const isDirty = useMemo(() => {
    return Object.keys(baseline).some((key) => {
      const current = values[key] ?? '';
      const base = baseline[key] ?? '';
      if (nullableSet.has(key)) {
        const normalizedCurrent = current.trim() || null;
        const normalizedBase = base.trim() || null;
        return normalizedCurrent !== normalizedBase;
      }
      return current !== base;
    });
  }, [values, baseline, nullableSet]);

  const setValue = useCallback((field: string, value: string): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const save = useCallback(async (): Promise<void> => {
    if (!isDirty) return;

    const changes: Record<string, string | null> = {};
    for (const key of Object.keys(baseline)) {
      const current = values[key] ?? '';
      const base = baseline[key] ?? '';

      if (nullableSet.has(key)) {
        const normalizedCurrent = current.trim() || null;
        const normalizedBase = base.trim() || null;
        if (normalizedCurrent !== normalizedBase) {
          changes[key] = normalizedCurrent;
        }
      } else if (current !== base) {
        changes[key] = current;
      }
    }

    if (Object.keys(changes).length === 0) return;

    setSaving(true);
    setError(null);
    try {
      await updateContent(contentId, changes);
      // Update both values and baseline so isDirty resets immediately
      const newBaseline: Record<string, string> = {};
      for (const key of Object.keys(baseline)) {
        newBaseline[key] = key in changes ? (changes[key] ?? '') : (values[key] ?? '');
      }
      setValues(newBaseline);
      setBaseline(newBaseline);
    } catch (err: unknown) {
      captureError(err, { operation: 'updateContent', contentId });
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }, [isDirty, values, baseline, nullableSet, contentId, updateContent]);

  const discard = useCallback((): void => {
    setValues(baseline);
    setError(null);
  }, [baseline]);

  return { values, setValue, isDirty, save, discard, saving, error };
}
