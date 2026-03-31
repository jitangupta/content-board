/**
 * Seed script — imports sample data into your Firestore instance.
 *
 * Prerequisites:
 *   1. Create a Firebase service account key:
 *      Firebase Console → Project Settings → Service accounts → Generate new private key
 *   2. Save it as seed/serviceAccountKey.json (gitignored)
 *
 * Usage:
 *   npx tsx seed/import.ts              # adds sample data (keeps existing)
 *   npx tsx seed/import.ts --override   # deletes all existing data first
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');

let serviceAccount: Record<string, string>;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
} catch {
  console.error(
    'Missing seed/serviceAccountKey.json.\n\n' +
      'Generate one from Firebase Console → Project Settings → Service accounts → Generate new private key.\n' +
      'Save it as seed/serviceAccountKey.json (it is gitignored).\n',
  );
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const COLLECTION = 'contents';

interface SampleItem {
  title: string;
  [key: string]: unknown;
}

const override = process.argv.includes('--override');

async function clearCollection(): Promise<number> {
  const snapshot = await db.collection(COLLECTION).get();
  if (snapshot.empty) return 0;

  const BATCH_LIMIT = 500;
  for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    const chunk = snapshot.docs.slice(i, i + BATCH_LIMIT);
    for (const doc of chunk) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }
  return snapshot.size;
}

async function seed(): Promise<void> {
  const dataPath = resolve(__dirname, 'sample-data.json');
  const items: SampleItem[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

  if (override) {
    const deleted = await clearCollection();
    console.log(`Cleared ${deleted} existing documents from "${COLLECTION}".`);
  }

  const batch = db.batch();

  for (const item of items) {
    const ref = db.collection(COLLECTION).doc();
    batch.set(ref, {
      ...item,
      id: ref.id,
    });
  }

  await batch.commit();
  console.log(`Seeded ${items.length} content items into "${COLLECTION}" collection.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
