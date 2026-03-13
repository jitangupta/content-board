import type { FeedbackSource } from '@/types/content';

export const SOURCE_LABELS: Record<FeedbackSource, string> = {
  self: 'Self',
  peer: 'Peer',
  family: 'Family',
  comment: 'Comment',
};

export const SOURCE_COLORS: Record<FeedbackSource, string> = {
  self: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  peer: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  family: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  comment: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
};
