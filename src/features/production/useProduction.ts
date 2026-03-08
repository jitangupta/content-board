import { useState } from 'react';
import type {
  ContentItem,
  DemoItem,
  DemoItemType,
  TalkingPoint,
  TalkingPointCategory,
  TalkingPointPriority,
} from '@/types/content';
import { useContent } from '@/features/content/useContent';
import {
  addDemoItem,
  removeDemoItem,
  updateDemoItem,
  addTalkingPoint,
  removeTalkingPoint,
} from '@/services/firestore';

interface UseProductionReturn {
  // Demo items
  showDemoForm: boolean;
  setShowDemoForm: (value: boolean) => void;
  demoType: DemoItemType;
  setDemoType: (value: DemoItemType) => void;
  demoDescription: string;
  setDemoDescription: (value: string) => void;
  demoError: string;
  handleAddDemoItem: () => Promise<void>;
  handleToggleDemoVerified: (demoItem: DemoItem) => Promise<void>;
  handleRemoveDemoItem: (demoItemId: string) => Promise<void>;

  // Talking points
  showTalkingPointForm: boolean;
  setShowTalkingPointForm: (value: boolean) => void;
  talkingPointText: string;
  setTalkingPointText: (value: string) => void;
  talkingPointCategory: TalkingPointCategory;
  setTalkingPointCategory: (value: TalkingPointCategory) => void;
  talkingPointPriority: TalkingPointPriority;
  setTalkingPointPriority: (value: TalkingPointPriority) => void;
  talkingPointError: string;
  handleAddTalkingPoint: () => Promise<void>;
  handleRemoveTalkingPoint: (talkingPointId: string) => Promise<void>;

  // Shooting script
  shootingScript: string;
  setShootingScript: (value: string) => void;
  handleShootingScriptBlur: () => Promise<void>;

  // Thumbnail ideas
  thumbnailIdeas: string;
  setThumbnailIdeas: (value: string) => void;
  handleThumbnailIdeasBlur: () => Promise<void>;
}

export function useProduction(item: ContentItem): UseProductionReturn {
  const { updateContent } = useContent();

  // Demo item form state
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [demoType, setDemoType] = useState<DemoItemType>('repo');
  const [demoDescription, setDemoDescription] = useState('');
  const [demoError, setDemoError] = useState('');

  // Talking point form state
  const [showTalkingPointForm, setShowTalkingPointForm] = useState(false);
  const [talkingPointText, setTalkingPointText] = useState('');
  const [talkingPointCategory, setTalkingPointCategory] = useState<TalkingPointCategory>('technical');
  const [talkingPointPriority, setTalkingPointPriority] = useState<TalkingPointPriority>('must-say');
  const [talkingPointError, setTalkingPointError] = useState('');

  // Shooting script state
  const [shootingScript, setShootingScript] = useState(item.shootingScript);

  // Thumbnail ideas state (stored as string[], displayed as joined text)
  const [thumbnailIdeas, setThumbnailIdeas] = useState(item.thumbnailIdeas.join('\n'));

  // --- Demo item handlers ---

  async function handleAddDemoItem(): Promise<void> {
    if (!demoDescription.trim()) {
      setDemoError('Description is required');
      return;
    }
    setDemoError('');
    const newItem: DemoItem = {
      id: crypto.randomUUID(),
      type: demoType,
      description: demoDescription.trim(),
      verified: false,
    };
    try {
      await addDemoItem(item.id, newItem);
      setShowDemoForm(false);
      setDemoDescription('');
      setDemoType('repo');
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleToggleDemoVerified(demoItem: DemoItem): Promise<void> {
    try {
      await updateDemoItem(item.id, { ...demoItem, verified: !demoItem.verified });
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleRemoveDemoItem(demoItemId: string): Promise<void> {
    try {
      await removeDemoItem(item.id, demoItemId);
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  // --- Talking point handlers ---

  async function handleAddTalkingPoint(): Promise<void> {
    if (!talkingPointText.trim()) {
      setTalkingPointError('Text is required');
      return;
    }
    setTalkingPointError('');
    const newPoint: TalkingPoint = {
      id: crypto.randomUUID(),
      text: talkingPointText.trim(),
      category: talkingPointCategory,
      priority: talkingPointPriority,
      order: item.talkingPoints.length,
    };
    try {
      await addTalkingPoint(item.id, newPoint);
      setShowTalkingPointForm(false);
      setTalkingPointText('');
      setTalkingPointCategory('technical');
      setTalkingPointPriority('must-say');
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  async function handleRemoveTalkingPoint(talkingPointId: string): Promise<void> {
    try {
      await removeTalkingPoint(item.id, talkingPointId);
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  // --- Shooting script handlers ---

  async function handleShootingScriptBlur(): Promise<void> {
    if (shootingScript === item.shootingScript) return;
    try {
      await updateContent(item.id, { shootingScript });
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  // --- Thumbnail ideas handlers ---

  async function handleThumbnailIdeasBlur(): Promise<void> {
    const parsed = thumbnailIdeas
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const current = item.thumbnailIdeas;
    if (JSON.stringify(parsed) === JSON.stringify(current)) return;
    try {
      await updateContent(item.id, { thumbnailIdeas: parsed });
    } catch {
      // Error captured by service layer via Sentry
    }
  }

  return {
    showDemoForm,
    setShowDemoForm,
    demoType,
    setDemoType,
    demoDescription,
    setDemoDescription,
    demoError,
    handleAddDemoItem,
    handleToggleDemoVerified,
    handleRemoveDemoItem,

    showTalkingPointForm,
    setShowTalkingPointForm,
    talkingPointText,
    setTalkingPointText,
    talkingPointCategory,
    setTalkingPointCategory,
    talkingPointPriority,
    setTalkingPointPriority,
    talkingPointError,
    handleAddTalkingPoint,
    handleRemoveTalkingPoint,

    shootingScript,
    setShootingScript,
    handleShootingScriptBlur,

    thumbnailIdeas,
    setThumbnailIdeas,
    handleThumbnailIdeasBlur,
  };
}
