import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { ContentItem, ContentStatus, DemoItem, Feedback, Learning, LinkedContent, TalkingPoint } from '@/types/content.ts';
import { getPhaseForStatus, getValidTransitions, STATUS_ORDER, STATUS_TIMESTAMP_MAP } from '@/utils/statusHelpers.ts';
import { db } from './firebase.ts';
import { addBreadcrumb, captureError } from './sentry.ts';

const COLLECTION = 'contents';

// --- Helpers (internal) ---
// Firestore returns untyped DocumentData — casts are unavoidable when reading document fields

async function addArrayItem<T>(
  contentId: string,
  field: string,
  item: T,
  operation: string,
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, contentId), {
      [field]: arrayUnion(item),
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error) {
    captureError(error, { operation, contentId });
    throw error;
  }
}

async function updateArrayItem<T extends { id: string }>(
  contentId: string,
  field: string,
  item: T,
  operation: string,
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, contentId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = snap.data()[field] as T[];
      const updated = items.map((existing) =>
        existing.id === item.id ? item : existing,
      );
      transaction.update(ref, {
        [field]: updated,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error) {
    captureError(error, { operation, contentId });
    throw error;
  }
}

async function removeArrayItem(
  contentId: string,
  field: string,
  itemId: string,
  operation: string,
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, contentId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = snap.data()[field] as Array<{ id: string }>;
      const filtered = items.filter((item) => item.id !== itemId);
      transaction.update(ref, {
        [field]: filtered,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error) {
    captureError(error, { operation, contentId });
    throw error;
  }
}

// --- Read operations ---

export function subscribeToContents(
  callback: (contents: ContentItem[]) => void,
  onError: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, COLLECTION),
    orderBy('phase'),
    orderBy('status'),
    orderBy('order'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const contents = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ContentItem[];
      callback(contents);
    },
    onError,
  );
}

// --- Write operations ---

export async function createContent(
  data: Partial<ContentItem>,
): Promise<string> {
  try {
    const status = data.status ?? 'draft';
    const phase = getPhaseForStatus(status);

    const newContent = {
      title: data.title ?? '',
      description: data.description ?? '',
      tags: data.tags ?? [],
      status,
      phase,
      order: data.order ?? 0,
      youtubeUrl: data.youtubeUrl ?? null,
      demoItems: data.demoItems ?? [],
      talkingPoints: data.talkingPoints ?? [],
      shootingScript: data.shootingScript ?? '',
      thumbnailIdeas: data.thumbnailIdeas ?? [],
      linkedContent: data.linkedContent ?? [],
      notes: data.notes ?? '',
      learnings: data.learnings ?? [],
      feedback: data.feedback ?? [],
      timestamps: {
        created: serverTimestamp(),
        technicallyReady: null,
        shootingScriptReady: null,
        readyToRecord: null,
        recorded: null,
        edited: null,
        published: null,
        shortsExtracted: null,
        lifetimeValueEnds: null,
        updated: serverTimestamp(),
      },
    };

    const docRef = await addDoc(collection(db, COLLECTION), newContent);
    addBreadcrumb('content', `Created content: "${data.title ?? ''}"`, {
      contentId: docRef.id,
    });
    return docRef.id;
  } catch (error) {
    captureError(error, { operation: 'createContent' });
    throw error;
  }
}

export async function updateContent(
  contentId: string,
  updates: Partial<Omit<ContentItem, 'id' | 'timestamps' | 'phase' | 'status'>>,
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, contentId), {
      ...updates,
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error) {
    captureError(error, { operation: 'updateContent', contentId });
    throw error;
  }
}

export async function deleteContent(contentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, contentId));
    addBreadcrumb('content', 'Deleted content', { contentId });
  } catch (error) {
    captureError(error, { operation: 'deleteContent', contentId });
    throw error;
  }
}

// --- Status transition ---

export async function updateContentStatus(
  contentId: string,
  newStatus: ContentStatus,
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, contentId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }

      const currentStatus = snap.data().status as ContentStatus;
      const validTransitions = getValidTransitions(currentStatus);
      if (!validTransitions.includes(newStatus)) {
        throw new Error(
          `Invalid transition from ${currentStatus} to ${newStatus}`,
        );
      }

      const currentIndex = STATUS_ORDER.indexOf(currentStatus);
      const newIndex = STATUS_ORDER.indexOf(newStatus);
      const isForward = newIndex > currentIndex;

      const updateData: Record<string, unknown> = {
        status: newStatus,
        phase: getPhaseForStatus(newStatus),
        'timestamps.updated': serverTimestamp(),
      };

      if (isForward) {
        const timestampField = STATUS_TIMESTAMP_MAP[newStatus];
        if (timestampField) {
          updateData[`timestamps.${timestampField}`] = serverTimestamp();
        }
      } else {
        const timestampField = STATUS_TIMESTAMP_MAP[currentStatus];
        if (timestampField) {
          updateData[`timestamps.${timestampField}`] = null;
        }
      }

      transaction.update(ref, updateData);
    });

    addBreadcrumb('status', `Status changed to ${newStatus}`, { contentId });
  } catch (error) {
    captureError(error, { operation: 'updateContentStatus', contentId });
    throw error;
  }
}

// --- Sub-document operations: DemoItem ---

export function addDemoItem(
  contentId: string,
  demoItem: DemoItem,
): Promise<void> {
  return addArrayItem(contentId, 'demoItems', demoItem, 'addDemoItem');
}

export function updateDemoItem(
  contentId: string,
  demoItem: DemoItem,
): Promise<void> {
  return updateArrayItem(contentId, 'demoItems', demoItem, 'updateDemoItem');
}

export function removeDemoItem(
  contentId: string,
  demoItemId: string,
): Promise<void> {
  return removeArrayItem(contentId, 'demoItems', demoItemId, 'removeDemoItem');
}

// --- Sub-document operations: TalkingPoint ---

export function addTalkingPoint(
  contentId: string,
  talkingPoint: TalkingPoint,
): Promise<void> {
  return addArrayItem(
    contentId,
    'talkingPoints',
    talkingPoint,
    'addTalkingPoint',
  );
}

export function updateTalkingPoint(
  contentId: string,
  talkingPoint: TalkingPoint,
): Promise<void> {
  return updateArrayItem(
    contentId,
    'talkingPoints',
    talkingPoint,
    'updateTalkingPoint',
  );
}

export function removeTalkingPoint(
  contentId: string,
  talkingPointId: string,
): Promise<void> {
  return removeArrayItem(
    contentId,
    'talkingPoints',
    talkingPointId,
    'removeTalkingPoint',
  );
}

export async function reorderTalkingPoints(
  contentId: string,
  orderedIds: string[],
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, contentId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const talkingPoints = snap.data().talkingPoints as TalkingPoint[];
      const reordered = orderedIds.map((id, index) => {
        const tp = talkingPoints.find((t) => t.id === id);
        if (!tp) {
          throw new Error(`TalkingPoint ${id} not found`);
        }
        return { ...tp, order: index };
      });
      transaction.update(ref, {
        talkingPoints: reordered,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error) {
    captureError(error, { operation: 'reorderTalkingPoints', contentId });
    throw error;
  }
}

// --- Sub-document operations: Learning ---

export function addLearning(
  contentId: string,
  learning: Learning,
): Promise<void> {
  return addArrayItem(contentId, 'learnings', learning, 'addLearning');
}

export function updateLearning(
  contentId: string,
  learning: Learning,
): Promise<void> {
  return updateArrayItem(contentId, 'learnings', learning, 'updateLearning');
}

export function removeLearning(
  contentId: string,
  learningId: string,
): Promise<void> {
  return removeArrayItem(
    contentId,
    'learnings',
    learningId,
    'removeLearning',
  );
}

// --- Sub-document operations: Feedback ---

export function addFeedback(
  contentId: string,
  feedback: Feedback,
): Promise<void> {
  return addArrayItem(contentId, 'feedback', feedback, 'addFeedback');
}

export function removeFeedback(
  contentId: string,
  feedbackId: string,
): Promise<void> {
  return removeArrayItem(
    contentId,
    'feedback',
    feedbackId,
    'removeFeedback',
  );
}

// --- Sub-document operations: LinkedContent ---

export function addLinkedContent(
  contentId: string,
  link: LinkedContent,
): Promise<void> {
  return addArrayItem(contentId, 'linkedContent', link, 'addLinkedContent');
}

export function removeLinkedContent(
  contentId: string,
  linkId: string,
): Promise<void> {
  return removeArrayItem(
    contentId,
    'linkedContent',
    linkId,
    'removeLinkedContent',
  );
}
