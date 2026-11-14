import Dexie, { type Table } from 'dexie';

export type ItemType = 'word' | 'command' | 'note' | 'link' | 'image';

export interface Collection {
  id?: number;
  name: string;
  createdAt: number;
}

export interface SavedItem {
  id?: number;
  collectionId: number;
  type: ItemType;
  title: string;
  content: string;                 // sanitized HTML or markdown
  sourceUrl: string;
  tags: string[];
  createdAt: number;
  extra?: Record<string, string>;  // e.g. definition, example
}

class ShelfDB extends Dexie {
  collections!: Table<Collection, number>;
  items!: Table<SavedItem, number>;

  constructor() {
    super('snippet-shelf');
    this.version(1).stores({
      collections: '++id, name',
      items: '++id, collectionId, type, *tags, createdAt',
    });
  }
}

export const db = new ShelfDB();