import { v4 as uuidv4 } from 'uuid';
import type { ProjectEntry } from '../types';
import { db, DEFAULT_SETTINGS } from './database';

function now() {
  return new Date().toISOString();
}

export function sampleEntries(fiscalYear = '2026-27'): ProjectEntry[] {
  const ts = now();
  const base = [
    {
      quarter: 'Q1' as const,
      region: 'West',
      month: 'July 2026',
      projectName: 'Karjat Housing Outreach',
      state: 'Maharashtra',
      district: 'Raigad',
      cluster: 'Karjat',
      volunteers: 50,
      totalTarget: 120,
      projectBudget: 550000,
      expectedFunding: 480000,
    },
    {
      quarter: 'Q1' as const,
      region: 'West',
      month: 'Aug 2026',
      projectName: 'Palghar Community Build',
      state: 'Maharashtra',
      district: 'Palghar',
      cluster: 'Palghar',
      volunteers: 30,
      totalTarget: 80,
      projectBudget: 420000,
      expectedFunding: 420000,
    },
    {
      quarter: 'Q1' as const,
      region: 'West',
      month: 'Sept 2026',
      projectName: 'Khed Village Support',
      state: 'Maharashtra',
      district: 'Ratnagiri',
      cluster: 'Khed',
      volunteers: 30,
      totalTarget: 60,
      projectBudget: 310000,
      expectedFunding: 250000,
    },
    {
      quarter: 'Q1' as const,
      region: 'North',
      month: 'July 2026',
      projectName: 'Delhi-NCR Urban Homes',
      state: 'Delhi-NCR',
      district: 'Delhi-NCR',
      cluster: 'Delhi-NCR',
      volunteers: 50,
      totalTarget: 100,
      projectBudget: 900000,
      expectedFunding: 750000,
      donorName: 'Corporate Partner A',
    },
    {
      quarter: 'Q2' as const,
      region: 'South',
      month: 'Oct 2026',
      projectName: 'Gummidipoondi Build Week',
      state: 'Tamilnadu',
      district: 'Chennai',
      cluster: 'Gummidipoondi',
      volunteers: 40,
      totalTarget: 70,
      projectBudget: 380000,
      expectedFunding: 380000,
    },
    {
      quarter: 'Q2' as const,
      region: 'South',
      month: 'Oct 2026',
      projectName: 'Anekal Family Homes',
      state: 'Karnataka',
      district: 'Bangalore',
      cluster: 'Anekal',
      volunteers: 35,
      totalTarget: 55,
      projectBudget: 450000,
      expectedFunding: 400000,
      donorName: 'Foundation B',
    },
  ];

  return base.map((row) => ({
    id: uuidv4(),
    fiscalYear,
    projectName: row.projectName,
    quarter: row.quarter,
    region: row.region,
    month: row.month,
    state: row.state,
    district: row.district,
    cluster: row.cluster,
    targetType: 'Individuals',
    donorName: row.donorName ?? '',
    fundingDate: null,
    totalTarget: row.totalTarget,
    volunteers: row.volunteers,
    projectBudget: row.projectBudget,
    expectedFunding: row.expectedFunding,
    restricted: Math.round(row.projectBudget * 0.4),
    peiRoNo: Math.round(row.projectBudget * 0.35),
    adminOverheads: Math.round(row.projectBudget * 0.1),
    target5500: 10,
    target4500: 8,
    target400: 5,
    target800: 2,
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  }));
}

export async function ensureSeeded(): Promise<void> {
  const settings = await db.settings.get('app');
  if (!settings) {
    await db.settings.put(DEFAULT_SETTINGS);
  }

  const count = await db.entries.count();
  if (count === 0) {
    const fy = settings?.fiscalYear ?? DEFAULT_SETTINGS.fiscalYear;
    await db.entries.bulkAdd(sampleEntries(fy));
  }
}

export async function reseedSampleData(): Promise<void> {
  const settings = (await db.settings.get('app')) ?? DEFAULT_SETTINGS;
  await db.entries.clear();
  await db.entries.bulkAdd(sampleEntries(settings.fiscalYear));
}
