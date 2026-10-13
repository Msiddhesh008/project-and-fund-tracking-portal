import Dexie, { type EntityTable } from 'dexie';
import type { AppSettings, ProjectEntry } from '../types';

export class TrackerDatabase extends Dexie {
  entries!: EntityTable<ProjectEntry, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('ProjectFundTracker');
    this.version(1).stores({
      entries:
        'id, fiscalYear, quarter, region, month, projectName, state, district, cluster, donorName, fundingDate, updatedAt',
      settings: 'id',
    });
  }
}

export const db = new TrackerDatabase();

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'app',
  fiscalYear: '2026-27',
  currencyDisplay: 'INR',
};
