import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Draft } from '@/types/sticker';

interface StickerStudioDB extends DBSchema {
  drafts: {
    key: string;
    value: Draft;
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<StickerStudioDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<StickerStudioDB>('sticker-studio-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('drafts')) {
        const store = db.createObjectStore('drafts', { keyPath: 'id' });
        store.createIndex('by-date', 'createdAt');
      }
    },
  });
}

export async function saveDraft(draft: Draft): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('drafts', draft);
}

export async function getDrafts(): Promise<Draft[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  // Get all drafts sorted by date (oldest first) and reverse to show newest first
  const drafts = await db.getAllFromIndex('drafts', 'by-date');
  return drafts.reverse();
}

export async function getDraft(id: string): Promise<Draft | undefined> {
  if (!dbPromise) return undefined;
  const db = await dbPromise;
  return db.get('drafts', id);
}

export async function deleteDraft(id: string): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('drafts', id);
}
