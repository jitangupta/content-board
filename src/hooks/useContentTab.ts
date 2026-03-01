import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ContentItem, LinkedContent, LinkedContentPlatform } from '@/types/content';
import { useContent } from '@/features/content/useContent';
import { addLinkedContent, removeLinkedContent } from '@/services/firestore';
import { STATUS_ORDER } from '@/utils/statusHelpers';
import { isValidUrl } from '@/utils/validation';

const PUBLISHED_INDEX = STATUS_ORDER.indexOf('published');

interface UseContentTabReturn {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;
  deleting: boolean;
  showYoutubeField: boolean;
  showLinkForm: boolean;
  setShowLinkForm: (value: boolean) => void;
  linkPlatform: LinkedContentPlatform;
  setLinkPlatform: (value: LinkedContentPlatform) => void;
  linkUrl: string;
  setLinkUrl: (value: string) => void;
  linkLabel: string;
  setLinkLabel: (value: string) => void;
  linkError: string;
  setLinkError: (value: string) => void;
  handleBlur: (field: string, value: string, original: string) => Promise<void>;
  handleYoutubeBlur: () => Promise<void>;
  handleTagsChange: (tags: string[]) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleAddLink: () => Promise<void>;
  handleRemoveLink: (linkId: string) => Promise<void>;
}

export function useContentTab(item: ContentItem): UseContentTabReturn {
  const { updateContent, deleteContent } = useContent();
  const navigate = useNavigate();

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [notes, setNotes] = useState(item.notes);
  const [youtubeUrl, setYoutubeUrl] = useState(item.youtubeUrl ?? '');
  const [deleting, setDeleting] = useState(false);

  // Linked content form state
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkPlatform, setLinkPlatform] = useState<LinkedContentPlatform>('blog');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkError, setLinkError] = useState('');

  const showYoutubeField = STATUS_ORDER.indexOf(item.status) >= PUBLISHED_INDEX;

  async function handleBlur(
    field: string,
    value: string,
    original: string,
  ): Promise<void> {
    if (value === original) return;
    try {
      await updateContent(item.id, { [field]: value });
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleYoutubeBlur(): Promise<void> {
    const newValue = youtubeUrl.trim() || null;
    if (newValue === item.youtubeUrl) return;
    if (newValue && !isValidUrl(newValue)) return;
    try {
      await updateContent(item.id, { youtubeUrl: newValue });
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleTagsChange(tags: string[]): Promise<void> {
    try {
      await updateContent(item.id, { tags });
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      await deleteContent(item.id);
      navigate('/content');
    } catch {
      setDeleting(false);
      // Error captured by service layer via Sentry
    }
  }

  async function handleAddLink(): Promise<void> {
    if (!linkUrl.trim() || !linkLabel.trim()) {
      setLinkError('URL and label are required');
      return;
    }
    if (!isValidUrl(linkUrl)) {
      setLinkError('Enter a valid URL (e.g., https://example.com)');
      return;
    }
    setLinkError('');
    const link: LinkedContent = {
      id: crypto.randomUUID(),
      platform: linkPlatform,
      url: linkUrl.trim(),
      label: linkLabel.trim(),
    };
    try {
      await addLinkedContent(item.id, link);
      setShowLinkForm(false);
      setLinkUrl('');
      setLinkLabel('');
      setLinkPlatform('blog');
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleRemoveLink(linkId: string): Promise<void> {
    try {
      await removeLinkedContent(item.id, linkId);
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    notes,
    setNotes,
    youtubeUrl,
    setYoutubeUrl,
    deleting,
    showYoutubeField,
    showLinkForm,
    setShowLinkForm,
    linkPlatform,
    setLinkPlatform,
    linkUrl,
    setLinkUrl,
    linkLabel,
    setLinkLabel,
    linkError,
    setLinkError,
    handleBlur,
    handleYoutubeBlur,
    handleTagsChange,
    handleDelete,
    handleAddLink,
    handleRemoveLink,
  };
}
