import { useState, useCallback } from 'react';
import {
  addDemoItem as addDemoItemService,
  updateDemoItem as updateDemoItemService,
  removeDemoItem as removeDemoItemService,
  addTalkingPoint as addTalkingPointService,
  updateTalkingPoint as updateTalkingPointService,
  removeTalkingPoint as removeTalkingPointService,
  reorderTalkingPoints,
} from '@/services/firestore';
import { captureError } from '@/services/sentry';
import type { DemoItem, TalkingPoint } from '@/types/content';

interface OperationState {
  loading: boolean;
  error: string | null;
}

interface UseProductionReturn {
  demoItemOp: OperationState;
  talkingPointOp: OperationState;
  addDemoItem: (contentId: string, demoItem: DemoItem) => Promise<void>;
  updateDemoItem: (contentId: string, demoItem: DemoItem) => Promise<void>;
  removeDemoItem: (contentId: string, demoItemId: string) => Promise<void>;
  addTalkingPoint: (contentId: string, talkingPoint: TalkingPoint) => Promise<void>;
  updateTalkingPoint: (contentId: string, talkingPoint: TalkingPoint) => Promise<void>;
  removeTalkingPoint: (contentId: string, talkingPointId: string) => Promise<void>;
  handleReorderTalkingPoints: (contentId: string, orderedIds: string[]) => Promise<void>;
}

export function useProduction(): UseProductionReturn {
  const [demoItemOp, setDemoItemOp] = useState<OperationState>({
    loading: false,
    error: null,
  });
  const [talkingPointOp, setTalkingPointOp] = useState<OperationState>({
    loading: false,
    error: null,
  });

  const addDemoItem = useCallback(
    async (contentId: string, demoItem: DemoItem): Promise<void> => {
      setDemoItemOp({ loading: true, error: null });
      try {
        await addDemoItemService(contentId, demoItem);
        setDemoItemOp({ loading: false, error: null });
      } catch (error: unknown) {
        captureError(error, { operation: 'addDemoItem', contentId });
        setDemoItemOp({ loading: false, error: 'Failed to add demo item' });
      }
    },
    [],
  );

  const updateDemoItem = useCallback(
    async (contentId: string, demoItem: DemoItem): Promise<void> => {
      setDemoItemOp({ loading: true, error: null });
      try {
        await updateDemoItemService(contentId, demoItem);
        setDemoItemOp({ loading: false, error: null });
      } catch (error: unknown) {
        captureError(error, { operation: 'updateDemoItem', contentId });
        setDemoItemOp({ loading: false, error: 'Failed to update demo item' });
      }
    },
    [],
  );

  const removeDemoItem = useCallback(
    async (contentId: string, demoItemId: string): Promise<void> => {
      setDemoItemOp({ loading: true, error: null });
      try {
        await removeDemoItemService(contentId, demoItemId);
        setDemoItemOp({ loading: false, error: null });
      } catch (error: unknown) {
        captureError(error, { operation: 'removeDemoItem', contentId });
        setDemoItemOp({ loading: false, error: 'Failed to remove demo item' });
      }
    },
    [],
  );

  const addTalkingPoint = useCallback(
    async (contentId: string, talkingPoint: TalkingPoint): Promise<void> => {
      setTalkingPointOp({ loading: true, error: null });
      try {
        await addTalkingPointService(contentId, talkingPoint);
        setTalkingPointOp({ loading: false, error: null });
      } catch (error: unknown) {
        captureError(error, { operation: 'addTalkingPoint', contentId });
        setTalkingPointOp({ loading: false, error: 'Failed to add talking point' });
      }
    },
    [],
  );

  const updateTalkingPoint = useCallback(
    async (contentId: string, talkingPoint: TalkingPoint): Promise<void> => {
      setTalkingPointOp({ loading: true, error: null });
      try {
        await updateTalkingPointService(contentId, talkingPoint);
        setTalkingPointOp({ loading: false, error: null });
      } catch (error: unknown) {
        captureError(error, { operation: 'updateTalkingPoint', contentId });
        setTalkingPointOp({ loading: false, error: 'Failed to update talking point' });
      }
    },
    [],
  );

  const removeTalkingPoint = useCallback(
    async (contentId: string, talkingPointId: string): Promise<void> => {
      setTalkingPointOp({ loading: true, error: null });
      try {
        await removeTalkingPointService(contentId, talkingPointId);
        setTalkingPointOp({ loading: false, error: null });
      } catch (error: unknown) {
        captureError(error, { operation: 'removeTalkingPoint', contentId });
        setTalkingPointOp({ loading: false, error: 'Failed to remove talking point' });
      }
    },
    [],
  );

  const handleReorderTalkingPoints = useCallback(
    async (contentId: string, orderedIds: string[]): Promise<void> => {
      setTalkingPointOp({ loading: true, error: null });
      try {
        await reorderTalkingPoints(contentId, orderedIds);
        setTalkingPointOp({ loading: false, error: null });
      } catch (error: unknown) {
        captureError(error, { operation: 'reorderTalkingPoints', contentId });
        setTalkingPointOp({ loading: false, error: 'Failed to reorder talking points' });
      }
    },
    [],
  );

  return {
    demoItemOp,
    talkingPointOp,
    addDemoItem,
    updateDemoItem,
    removeDemoItem,
    addTalkingPoint,
    updateTalkingPoint,
    removeTalkingPoint,
    handleReorderTalkingPoints,
  };
}
