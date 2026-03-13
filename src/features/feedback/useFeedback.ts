import {
  addFeedback as addFeedbackService,
  updateFeedback as updateFeedbackService,
  removeFeedback as removeFeedbackService,
} from '@/services/firestore';
import { captureError } from '@/services/sentry';
import type { Feedback, FeedbackSource } from '@/types/content';

interface UseFeedbackReturn {
  addFeedback: (
    contentId: string,
    source: FeedbackSource,
    text: string,
  ) => Promise<void>;
  updateFeedback: (contentId: string, feedback: Feedback) => Promise<void>;
  removeFeedback: (contentId: string, feedbackId: string) => Promise<void>;
}

export function useFeedback(): UseFeedbackReturn {
  async function addFeedback(
    contentId: string,
    source: FeedbackSource,
    text: string,
  ): Promise<void> {
    const feedback: Feedback = {
      id: crypto.randomUUID(),
      source,
      text: text.trim(),
      dateAdded: new Date().toISOString(),
    };

    try {
      await addFeedbackService(contentId, feedback);
    } catch (error: unknown) {
      captureError(error, { operation: 'addFeedback', contentId });
      throw error;
    }
  }

  async function updateFeedback(
    contentId: string,
    feedback: Feedback,
  ): Promise<void> {
    try {
      await updateFeedbackService(contentId, feedback);
    } catch (error: unknown) {
      captureError(error, { operation: 'updateFeedback', contentId });
      throw error;
    }
  }

  async function removeFeedback(
    contentId: string,
    feedbackId: string,
  ): Promise<void> {
    try {
      await removeFeedbackService(contentId, feedbackId);
    } catch (error: unknown) {
      captureError(error, { operation: 'removeFeedback', contentId });
      throw error;
    }
  }

  return { addFeedback, updateFeedback, removeFeedback };
}
