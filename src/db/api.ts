import type { AppSettings, ProjectEntry, ProjectEntryInput } from '../types';
import { entryDuplicateKey, toProjectEntry } from '../utils/excel';
import { db, DEFAULT_SETTINGS } from './database';

export async function getSettings(): Promise<AppSettings> {
  return (await db.settings.get('app')) ?? DEFAULT_SETTINGS;
}

export async function updateSettings(patch: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch, id: 'app' as const };
  await db.settings.put(next);
  return next;
}

export async function listEntries(): Promise<ProjectEntry[]> {
  return db.entries.orderBy('updatedAt').reverse().toArray();
}

export async function getEntry(id: string): Promise<ProjectEntry | undefined> {
  return db.entries.get(id);
}

export async function createEntry(input: ProjectEntryInput): Promise<ProjectEntry> {
  const entry = toProjectEntry(input);
  await db.entries.add(entry);
  return entry;
}

export async function updateEntry(id: string, input: ProjectEntryInput): Promise<ProjectEntry> {
  const existing = await db.entries.get(id);
  if (!existing) throw new Error('Entry not found');
  const entry: ProjectEntry = {
    ...input,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await db.entries.put(entry);
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  await db.entries.delete(id);
}

export async function deleteEntries(ids: string[]): Promise<void> {
  await db.entries.bulkDelete(ids);
}

export async function bulkUpsertEntries(
  inputs: ProjectEntryInput[],
  mode: 'skip' | 'replace',
  existing: ProjectEntry[],
): Promise<{ added: number; updated: number; skipped: number }> {
  const byKey = new Map(existing.map((e) => [entryDuplicateKey(e), e]));
  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const input of inputs) {
    const key = entryDuplicateKey(input);
    const found = byKey.get(key);
    if (found) {
      if (mode === 'skip') {
        skipped += 1;
        continue;
      }
      await updateEntry(found.id, input);
      updated += 1;
    } else {
      const entry = toProjectEntry(input);
      await db.entries.add(entry);
      byKey.set(key, entry);
      added += 1;
    }
  }

  return { added, updated, skipped };
}

export async function replaceAllEntries(entries: ProjectEntry[]): Promise<void> {
  await db.transaction('rw', db.entries, async () => {
    await db.entries.clear();
    if (entries.length) await db.entries.bulkAdd(entries);
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.entries, db.settings, async () => {
    await db.entries.clear();
    await db.settings.put(DEFAULT_SETTINGS);
  });
}
