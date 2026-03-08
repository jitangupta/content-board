import { useState } from 'react';
import type { ContentItem, Learning } from '@/types/content';
import { addLearning, updateLearning, removeLearning } from '@/services/firestore';

interface UseLearningsReturn {
  showAddForm: boolean;
  setShowAddForm: (value: boolean) => void;
  newText: string;
  setNewText: (value: string) => void;
  editingId: string | null;
  editText: string;
  setEditText: (value: string) => void;
  handleAdd: () => Promise<void>;
  handleStartEdit: (learning: Learning) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (learning: Learning) => Promise<void>;
  handleDelete: (learningId: string) => Promise<void>;
  handleAppliedInChange: (learning: Learning, contentId: string | null) => Promise<void>;
}

export function useLearnings(item: ContentItem): UseLearningsReturn {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  async function handleAdd(): Promise<void> {
    const trimmed = newText.trim();
    if (!trimmed) return;

    const learning: Learning = {
      id: crypto.randomUUID(),
      text: trimmed,
      dateAdded: new Date().toISOString(),
      appliedInContentId: null,
    };

    try {
      await addLearning(item.id, learning);
      setNewText('');
      setShowAddForm(false);
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  function handleStartEdit(learning: Learning): void {
    setEditingId(learning.id);
    setEditText(learning.text);
  }

  function handleCancelEdit(): void {
    setEditingId(null);
    setEditText('');
  }

  async function handleSaveEdit(learning: Learning): Promise<void> {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === learning.text) {
      handleCancelEdit();
      return;
    }

    try {
      await updateLearning(item.id, { ...learning, text: trimmed });
      setEditingId(null);
      setEditText('');
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleDelete(learningId: string): Promise<void> {
    try {
      await removeLearning(item.id, learningId);
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleAppliedInChange(
    learning: Learning,
    contentId: string | null,
  ): Promise<void> {
    try {
      await updateLearning(item.id, {
        ...learning,
        appliedInContentId: contentId,
      });
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  return {
    showAddForm,
    setShowAddForm,
    newText,
    setNewText,
    editingId,
    editText,
    setEditText,
    handleAdd,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleAppliedInChange,
  };
}
