import {
  addDoc,
  arrayRemove,
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
  writeBatch,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { captureError } from '@/services/sentry';
import type {
  ContentItem,
  ContentStatus,
  ContentType,
  DemoItem,
  Feedback,
  Learning,
  LinkedContent,
  PlatformVersion,
  TalkingPoint,
} from '@/types/content';
import {
  getPhaseForStatus,
  getStatusOrderForType,
  getStatusTimestampMap,
  getValidTransitionsForType,
} from '@/utils/statusHelpers';

const CONTENTS_COLLECTION = 'contents';

function contentsRef() {
  return collection(db, CONTENTS_COLLECTION);
}

function contentDocRef(contentId: string) {
  return doc(db, CONTENTS_COLLECTION, contentId);
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

// Firestore DocumentData is untyped; this function fills defaults for fields added in P8
// and asserts the result as ContentItem — the single trust boundary for Firestore → app data
export function normalizeContentItem(raw: Record<string, unknown>): ContentItem {
  return {
    ...raw,
    contentType: raw.contentType ?? 'video',
    parentVideoId: raw.parentVideoId ?? null,
    script: raw.script ?? null,
    platformVersions: raw.platformVersions ?? [],
  } as ContentItem;
}

export function subscribeToContents(
  callback: (contents: ContentItem[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    contentsRef(),
    orderBy('phase'),
    orderBy('order'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const contents = snapshot.docs.map((d) =>
        normalizeContentItem({ id: d.id, ...d.data() }),
      );
      callback(contents);
    },
    onError,
  );
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

export async function createContent(
  data: Partial<ContentItem>,
): Promise<string> {
  try {
    const contentType: ContentType = data.contentType ?? 'video';
    const newContent = {
      title: data.title ?? '',
      description: data.description ?? '',
      tags: data.tags ?? [],
      status: 'draft',
      phase: 'pre-production',
      order: data.order ?? 0,
      contentType,
      parentVideoId: data.parentVideoId ?? null,
      script: data.script ?? null,
      platformVersions: [],
      youtubeUrl: null,
      demoItems: [],
      talkingPoints: [],
      shootingScript: null,
      thumbnailIdeas: null,
      linkedContent: [],
      notes: null,
      learnings: [],
      feedback: [],
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

    const docRef = await addDoc(contentsRef(), newContent);
    return docRef.id;
  } catch (error: unknown) {
    captureError(error, { operation: 'createContent' });
    throw error;
  }
}

export async function updateContent(
  contentId: string,
  updates: Partial<ContentItem>,
): Promise<void> {
  try {
    await updateDoc(contentDocRef(contentId), {
      ...updates,
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'updateContent', contentId });
    throw error;
  }
}

export async function deleteContent(contentId: string): Promise<void> {
  try {
    await deleteDoc(contentDocRef(contentId));
  } catch (error: unknown) {
    captureError(error, { operation: 'deleteContent', contentId });
    throw error;
  }
}

export async function reorderContents(orderedIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      batch.update(contentDocRef(id), { order: index });
    });
    await batch.commit();
  } catch (error: unknown) {
    captureError(error, { operation: 'reorderContents' });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Status transition
// ---------------------------------------------------------------------------

export async function updateContentStatus(
  contentId: string,
  newStatus: ContentStatus,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }

      // Firestore DocumentData is untyped; validated via transition check below
      const data = docSnap.data();
      const currentStatus = data.status as ContentStatus;
      const contentType = (data.contentType ?? 'video') as ContentType;
      const statusOrder = getStatusOrderForType(contentType);
      const timestampMap = getStatusTimestampMap(contentType);
      const validTransitions = getValidTransitionsForType(currentStatus, contentType);

      if (!validTransitions.includes(newStatus)) {
        throw new Error(
          `Invalid transition from "${currentStatus}" to "${newStatus}"`,
        );
      }

      const currentIndex = statusOrder.indexOf(currentStatus);
      const newIndex = statusOrder.indexOf(newStatus);
      const movingForward = newIndex > currentIndex;

      const updateData: Record<string, unknown> = {
        status: newStatus,
        phase: getPhaseForStatus(newStatus),
        'timestamps.updated': serverTimestamp(),
      };

      if (movingForward) {
        const timestampField = timestampMap[newStatus];
        if (timestampField) {
          updateData[`timestamps.${timestampField}`] = serverTimestamp();
        }
      } else {
        const timestampField = timestampMap[currentStatus];
        if (timestampField) {
          updateData[`timestamps.${timestampField}`] = null;
        }
      }

      transaction.update(contentDocRef(contentId), updateData);
    });
  } catch (error: unknown) {
    captureError(error, {
      operation: 'updateContentStatus',
      contentId,
      newStatus,
    });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Sub-document operations: DemoItems
// ---------------------------------------------------------------------------

export async function addDemoItem(
  contentId: string,
  demoItem: DemoItem,
): Promise<void> {
  try {
    await updateDoc(contentDocRef(contentId), {
      demoItems: arrayUnion(demoItem),
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'addDemoItem', contentId });
    throw error;
  }
}

export async function updateDemoItem(
  contentId: string,
  demoItem: DemoItem,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().demoItems ?? []) as DemoItem[];
      const updated = items.map((item) =>
        item.id === demoItem.id ? demoItem : item,
      );
      transaction.update(contentDocRef(contentId), {
        demoItems: updated,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'updateDemoItem', contentId });
    throw error;
  }
}

export async function removeDemoItem(
  contentId: string,
  demoItemId: string,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().demoItems ?? []) as DemoItem[];
      const toRemove = items.find((item) => item.id === demoItemId);
      if (toRemove) {
        transaction.update(contentDocRef(contentId), {
          demoItems: arrayRemove(toRemove),
          'timestamps.updated': serverTimestamp(),
        });
      }
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'removeDemoItem', contentId });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Sub-document operations: TalkingPoints
// ---------------------------------------------------------------------------

export async function addTalkingPoint(
  contentId: string,
  talkingPoint: TalkingPoint,
): Promise<void> {
  try {
    await updateDoc(contentDocRef(contentId), {
      talkingPoints: arrayUnion(talkingPoint),
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'addTalkingPoint', contentId });
    throw error;
  }
}

export async function updateTalkingPoint(
  contentId: string,
  talkingPoint: TalkingPoint,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const points = (docSnap.data().talkingPoints ?? []) as TalkingPoint[];
      const updated = points.map((point) =>
        point.id === talkingPoint.id ? talkingPoint : point,
      );
      transaction.update(contentDocRef(contentId), {
        talkingPoints: updated,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'updateTalkingPoint', contentId });
    throw error;
  }
}

export async function removeTalkingPoint(
  contentId: string,
  talkingPointId: string,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const points = (docSnap.data().talkingPoints ?? []) as TalkingPoint[];
      const toRemove = points.find((point) => point.id === talkingPointId);
      if (toRemove) {
        transaction.update(contentDocRef(contentId), {
          talkingPoints: arrayRemove(toRemove),
          'timestamps.updated': serverTimestamp(),
        });
      }
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'removeTalkingPoint', contentId });
    throw error;
  }
}

export async function reorderTalkingPoints(
  contentId: string,
  orderedIds: string[],
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const points = (docSnap.data().talkingPoints ?? []) as TalkingPoint[];
      const reordered = orderedIds
        .map((id, index) => {
          const point = points.find((p) => p.id === id);
          return point ? { ...point, order: index } : null;
        })
        .filter((p): p is TalkingPoint => p !== null);
      transaction.update(contentDocRef(contentId), {
        talkingPoints: reordered,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'reorderTalkingPoints', contentId });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Sub-document operations: Learnings
// ---------------------------------------------------------------------------

export async function addLearning(
  contentId: string,
  learning: Learning,
): Promise<void> {
  try {
    await updateDoc(contentDocRef(contentId), {
      learnings: arrayUnion(learning),
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'addLearning', contentId });
    throw error;
  }
}

export async function updateLearning(
  contentId: string,
  learning: Learning,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().learnings ?? []) as Learning[];
      const updated = items.map((item) =>
        item.id === learning.id ? learning : item,
      );
      transaction.update(contentDocRef(contentId), {
        learnings: updated,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'updateLearning', contentId });
    throw error;
  }
}

export async function removeLearning(
  contentId: string,
  learningId: string,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().learnings ?? []) as Learning[];
      const toRemove = items.find((item) => item.id === learningId);
      if (toRemove) {
        transaction.update(contentDocRef(contentId), {
          learnings: arrayRemove(toRemove),
          'timestamps.updated': serverTimestamp(),
        });
      }
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'removeLearning', contentId });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Sub-document operations: Feedback
// ---------------------------------------------------------------------------

export async function addFeedback(
  contentId: string,
  feedback: Feedback,
): Promise<void> {
  try {
    await updateDoc(contentDocRef(contentId), {
      feedback: arrayUnion(feedback),
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'addFeedback', contentId });
    throw error;
  }
}

export async function updateFeedback(
  contentId: string,
  feedback: Feedback,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().feedback ?? []) as Feedback[];
      const updated = items.map((item) =>
        item.id === feedback.id ? feedback : item,
      );
      transaction.update(contentDocRef(contentId), {
        feedback: updated,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'updateFeedback', contentId });
    throw error;
  }
}

export async function removeFeedback(
  contentId: string,
  feedbackId: string,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().feedback ?? []) as Feedback[];
      const toRemove = items.find((item) => item.id === feedbackId);
      if (toRemove) {
        transaction.update(contentDocRef(contentId), {
          feedback: arrayRemove(toRemove),
          'timestamps.updated': serverTimestamp(),
        });
      }
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'removeFeedback', contentId });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Sub-document operations: LinkedContent
// ---------------------------------------------------------------------------

export async function addLinkedContent(
  contentId: string,
  link: LinkedContent,
): Promise<void> {
  try {
    await updateDoc(contentDocRef(contentId), {
      linkedContent: arrayUnion(link),
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'addLinkedContent', contentId });
    throw error;
  }
}

export async function removeLinkedContent(
  contentId: string,
  linkId: string,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().linkedContent ?? []) as LinkedContent[];
      const toRemove = items.find((item) => item.id === linkId);
      if (toRemove) {
        transaction.update(contentDocRef(contentId), {
          linkedContent: arrayRemove(toRemove),
          'timestamps.updated': serverTimestamp(),
        });
      }
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'removeLinkedContent', contentId });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Sub-document operations: PlatformVersions
// ---------------------------------------------------------------------------

export async function addPlatformVersion(
  contentId: string,
  version: PlatformVersion,
): Promise<void> {
  try {
    await updateDoc(contentDocRef(contentId), {
      platformVersions: arrayUnion(version),
      'timestamps.updated': serverTimestamp(),
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'addPlatformVersion', contentId });
    throw error;
  }
}

export async function updatePlatformVersion(
  contentId: string,
  version: PlatformVersion,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().platformVersions ?? []) as PlatformVersion[];
      const updated = items.map((item) =>
        item.id === version.id ? version : item,
      );
      transaction.update(contentDocRef(contentId), {
        platformVersions: updated,
        'timestamps.updated': serverTimestamp(),
      });
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'updatePlatformVersion', contentId });
    throw error;
  }
}

export async function removePlatformVersion(
  contentId: string,
  versionId: string,
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(contentDocRef(contentId));
      if (!docSnap.exists()) {
        throw new Error(`Content ${contentId} not found`);
      }
      const items = (docSnap.data().platformVersions ?? []) as PlatformVersion[];
      const toRemove = items.find((item) => item.id === versionId);
      if (toRemove) {
        transaction.update(contentDocRef(contentId), {
          platformVersions: arrayRemove(toRemove),
          'timestamps.updated': serverTimestamp(),
        });
      }
    });
  } catch (error: unknown) {
    captureError(error, { operation: 'removePlatformVersion', contentId });
    throw error;
  }
}
