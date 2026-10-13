import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { db, DEFAULT_SETTINGS } from '../db/database';
import { ensureSeeded } from '../db/seed';
import type { AppSettings, ProjectEntry } from '../types';

export function useTrackerReady() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureSeeded()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to init DB');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
}

export function useEntries(): ProjectEntry[] {
  return useLiveQuery(() => db.entries.toArray(), []) ?? [];
}

export function useSettings(): AppSettings {
  return (
    useLiveQuery(() => db.settings.get('app'), []) ?? DEFAULT_SETTINGS
  );
}

export function useEntry(id: string | undefined): ProjectEntry | undefined | null {
  return useLiveQuery(() => (id ? db.entries.get(id) : undefined), [id], null);
}
