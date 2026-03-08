import { useState } from 'react';
import type { ContentItem, Feedback, FeedbackSource } from '@/types/content';
import { addFeedback, updateFeedback, removeFeedback } from '@/services/firestore';

interface UseFeedbackReturn {
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  newSource: FeedbackSource;
  setNewSource: (value: FeedbackSource) => void;
  newText: string;
  setNewText: (value: string) => void;
  editingId: string | null;
  editSource: FeedbackSource;
  setEditSource: (value: FeedbackSource) => void;
  editText: string;
  setEditText: (value: string) => void;
  deletingId: string | null;
  setDeletingId: (value: string | null) => void;
  handleAdd: () => Promise<void>;
  handleStartEdit: (feedback: Feedback) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (feedback: Feedback) => Promise<void>;
  handleDelete: (feedbackId: string) => Promise<void>;
}

export function useFeedback(item: ContentItem): UseFeedbackReturn {
  const [showForm, setShowForm] = useState(false);
  const [newSource, setNewSource] = useState<FeedbackSource>('self');
  const [newText, setNewText] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSource, setEditSource] = useState<FeedbackSource>('self');
  const [editText, setEditText] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(): Promise<void> {
    if (!newText.trim()) return;
    const feedback: Feedback = {
      id: crypto.randomUUID(),
      source: newSource,
      text: newText.trim(),
      dateAdded: new Date().toISOString(),
    };
    try {
      await addFeedback(item.id, feedback);
      setShowForm(false);
      setNewText('');
      setNewSource('self');
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  function handleStartEdit(feedback: Feedback): void {
    setEditingId(feedback.id);
    setEditSource(feedback.source);
    setEditText(feedback.text);
  }

  function handleCancelEdit(): void {
    setEditingId(null);
    setEditText('');
    setEditSource('self');
  }

  async function handleSaveEdit(feedback: Feedback): Promise<void> {
    if (!editText.trim()) return;
    const updated: Feedback = {
      ...feedback,
      source: editSource,
      text: editText.trim(),
    };
    try {
      await updateFeedback(item.id, updated);
      setEditingId(null);
      setEditText('');
      setEditSource('self');
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleDelete(feedbackId: string): Promise<void> {
    try {
      await removeFeedback(item.id, feedbackId);
      setDeletingId(null);
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  return {
    showForm,
    setShowForm,
    newSource,
    setNewSource,
    newText,
    setNewText,
    editingId,
    editSource,
    setEditSource,
    editText,
    setEditText,
    deletingId,
    setDeletingId,
    handleAdd,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
  };
}
