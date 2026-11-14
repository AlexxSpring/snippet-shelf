import { db } from '@/lib/db';

const DEFAULTS = [
  { name: 'Word Meanings', type: 'word' },
  { name: 'Commands', type: 'command' },
  { name: 'Coding', type: 'note' },
] as const;

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    // Seed default collections once
    if ((await db.collections.count()) === 0) {
      const now = Date.now();
      await db.collections.bulkAdd(
        DEFAULTS.map((d) => ({ name: d.name, createdAt: now }))
      );
    }

    // Build the right-click menu
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({
      id: 'shelf-root',
      title: 'Save to Shelf',
      contexts: ['selection'],
    });
    for (const d of DEFAULTS) {
      browser.contextMenus.create({
        id: `shelf:${d.name}`,
        parentId: 'shelf-root',
        title: d.name,
        contexts: ['selection'],
      });
    }
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    const menuId = String(info.menuItemId);
    if (!menuId.startsWith('shelf:') || !info.selectionText) return;

    const name = menuId.slice('shelf:'.length);
    const collection = await db.collections.where('name').equals(name).first();
    const preset = DEFAULTS.find((d) => d.name === name);
    if (!collection?.id || !preset) return;

    await db.items.add({
      collectionId: collection.id,
      type: preset.type,
      title: info.selectionText.trim().slice(0, 80),
      content: info.selectionText.trim(),
      sourceUrl: tab?.url ?? info.pageUrl ?? '',
      tags: [],
      createdAt: Date.now(),
    });
  });
});