import { useCallback } from 'react';
import {
  addLearning,
  updateLearning,
  removeLearning,
} from '@/services/firestore';
import { captureError } from '@/services/sentry';
import type { Learning } from '@/types/content';

interface UseLearningsReturn {
  add: (contentId: string, learning: Learning) => Promise<void>;
  update: (contentId: string, learning: Learning) => Promise<void>;
  remove: (contentId: string, learningId: string) => Promise<void>;
}

export function useLearnings(): UseLearningsReturn {
  const add = useCallback(
    async (contentId: string, learning: Learning): Promise<void> => {
      try {
        await addLearning(contentId, learning);
      } catch (error: unknown) {
        captureError(error, { operation: 'addLearning', contentId });
        throw error;
      }
    },
    [],
  );

  const update = useCallback(
    async (contentId: string, learning: Learning): Promise<void> => {
      try {
        await updateLearning(contentId, learning);
      } catch (error: unknown) {
        captureError(error, {
          operation: 'updateLearning',
          contentId,
          learningId: learning.id,
        });
        throw error;
      }
    },
    [],
  );

  const remove = useCallback(
    async (contentId: string, learningId: string): Promise<void> => {
      try {
        await removeLearning(contentId, learningId);
      } catch (error: unknown) {
        captureError(error, {
          operation: 'removeLearning',
          contentId,
          learningId,
        });
        throw error;
      }
    },
    [],
  );

  return { add, update, remove };
}
