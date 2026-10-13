import type { DashboardStats, ProjectEntry } from '../types';
import { percentFunded } from './formatters';

function sum(entries: ProjectEntry[], key: keyof ProjectEntry): number {
  return entries.reduce((acc, e) => {
    const v = e[key];
    return acc + (typeof v === 'number' ? v : 0);
  }, 0);
}

function groupBy(
  entries: ProjectEntry[],
  key: 'region' | 'quarter',
): { name: string; budget: number; expected: number; volunteers: number }[] {
  const map = new Map<string, ProjectEntry[]>();
  for (const e of entries) {
    const k = e[key] || 'Unknown';
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(e);
  }
  return [...map.entries()]
    .map(([name, rows]) => ({
      name,
      budget: sum(rows, 'projectBudget'),
      expected: sum(rows, 'expectedFunding'),
      volunteers: sum(rows, 'volunteers'),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function computeDashboardStats(entries: ProjectEntry[]): DashboardStats {
  const totalBudget = sum(entries, 'projectBudget');
  const expectedFunding = sum(entries, 'expectedFunding');
  return {
    entryCount: entries.length,
    totalBudget,
    expectedFunding,
    fundingGap: expectedFunding - totalBudget,
    totalVolunteers: sum(entries, 'volunteers'),
    totalTarget: sum(entries, 'totalTarget'),
    percentFunded: percentFunded(expectedFunding, totalBudget),
    byRegion: groupBy(entries, 'region'),
    byQuarter: groupBy(entries, 'quarter'),
  };
}

export function donorRollup(entries: ProjectEntry[]) {
  const map = new Map<
    string,
    { donor: string; count: number; expected: number; budget: number; latestFunding: string | null }
  >();
  for (const e of entries) {
    const donor = e.donorName?.trim() || 'Unassigned';
    const cur = map.get(donor) ?? {
      donor,
      count: 0,
      expected: 0,
      budget: 0,
      latestFunding: null as string | null,
    };
    cur.count += 1;
    cur.expected += e.expectedFunding ?? 0;
    cur.budget += e.projectBudget ?? 0;
    if (e.fundingDate && (!cur.latestFunding || e.fundingDate > cur.latestFunding)) {
      cur.latestFunding = e.fundingDate;
    }
    map.set(donor, cur);
  }
  return [...map.values()].sort((a, b) => b.expected - a.expected);
}

export function volunteersByRegionMonth(entries: ProjectEntry[]) {
  const map = new Map<string, { region: string; month: string; volunteers: number }>();
  for (const e of entries) {
    const key = `${e.region}||${e.month}`;
    const cur = map.get(key) ?? { region: e.region, month: e.month, volunteers: 0 };
    cur.volunteers += e.volunteers ?? 0;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => a.region.localeCompare(b.region) || a.month.localeCompare(b.month));
}

export function allocationTotals(entries: ProjectEntry[]) {
  return {
    restricted: sum(entries, 'restricted'),
    peiRoNo: sum(entries, 'peiRoNo'),
    adminOverheads: sum(entries, 'adminOverheads'),
    target5500: sum(entries, 'target5500'),
    target4500: sum(entries, 'target4500'),
    target400: sum(entries, 'target400'),
    target800: sum(entries, 'target800'),
    projectBudget: sum(entries, 'projectBudget'),
  };
}

export function filterEntries(
  entries: ProjectEntry[],
  filters: { fiscalYear?: string; quarter?: string; region?: string; search?: string; donor?: string },
): ProjectEntry[] {
  const q = filters.search?.trim().toLowerCase() ?? '';
  return entries.filter((e) => {
    if (filters.fiscalYear && filters.fiscalYear !== 'all' && e.fiscalYear !== filters.fiscalYear) {
      return false;
    }
    if (filters.quarter && filters.quarter !== 'all' && e.quarter !== filters.quarter) return false;
    if (filters.region && filters.region !== 'all' && e.region !== filters.region) return false;
    if (filters.donor && filters.donor !== 'all') {
      const d = e.donorName?.trim() || 'Unassigned';
      if (d !== filters.donor) return false;
    }
    if (q) {
      const hay = [e.projectName, e.donorName, e.cluster, e.district, e.state, e.notes]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
