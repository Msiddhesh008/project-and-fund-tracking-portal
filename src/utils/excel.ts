import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectEntry, ProjectEntryInput, Quarter } from '../types';
import { EXCEL_COLUMNS, QUARTERS } from '../types';
import { parseExcelDate, parseNumber } from './formatters';

const HEADER_ALIASES: Record<string, keyof ProjectEntryInput | 'fiscalYear'> = {
  quarter: 'quarter',
  region: 'region',
  month: 'month',
  'project name': 'projectName',
  projectname: 'projectName',
  state: 'state',
  district: 'district',
  cluster: 'cluster',
  'target type': 'targetType',
  targettype: 'targetType',
  'donor name': 'donorName',
  donorname: 'donorName',
  'funding date': 'fundingDate',
  fundingdate: 'fundingDate',
  'total target': 'totalTarget',
  totaltarget: 'totalTarget',
  volunteers: 'volunteers',
  'project budget': 'projectBudget',
  projectbudget: 'projectBudget',
  'expected funding': 'expectedFunding',
  expectedfunding: 'expectedFunding',
  restricted: 'restricted',
  'pei (ro & no)': 'peiRoNo',
  'pei (ro&no)': 'peiRoNo',
  pei: 'peiRoNo',
  'admin & overheads': 'adminOverheads',
  'admin and overheads': 'adminOverheads',
  '₹5,500 target': 'target5500',
  'rs 5500 target': 'target5500',
  '5500 target': 'target5500',
  '₹4,500 target': 'target4500',
  'rs 4500 target': 'target4500',
  '4500 target': 'target4500',
  '$400 target': 'target400',
  '400 target': 'target400',
  '$800 target': 'target800',
  '800 target': 'target800',
  notes: 'notes',
  'fiscal year': 'fiscalYear',
  fiscalyear: 'fiscalYear',
};

function normalizeHeader(h: unknown): string {
  return String(h ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function emptyInput(fiscalYear: string): ProjectEntryInput {
  return {
    fiscalYear,
    quarter: 'Q1',
    region: '',
    month: '',
    projectName: '',
    state: '',
    district: '',
    cluster: '',
    targetType: 'Individuals',
    donorName: '',
    fundingDate: null,
    totalTarget: null,
    volunteers: null,
    projectBudget: null,
    expectedFunding: null,
    restricted: null,
    peiRoNo: null,
    adminOverheads: null,
    target5500: null,
    target4500: null,
    target400: null,
    target800: null,
    notes: '',
  };
}

function coerceQuarter(raw: unknown): Quarter {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase();
  if (QUARTERS.includes(s as Quarter)) return s as Quarter;
  return 'Q1';
}

export function entryDuplicateKey(e: Pick<ProjectEntry, 'quarter' | 'month' | 'cluster' | 'projectName'>): string {
  return [e.quarter, e.month, e.cluster, e.projectName]
    .map((x) => String(x ?? '').trim().toLowerCase())
    .join('||');
}

export interface ImportPreviewRow {
  rowNumber: number;
  data: ProjectEntryInput;
  errors: string[];
  duplicate: boolean;
}

export function parseWorkbook(
  buffer: ArrayBuffer,
  defaultFiscalYear: string,
  existing: ProjectEntry[],
): ImportPreviewRow[] {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  }) as unknown[][];

  if (!rows.length) return [];

  // Find header row (first row that contains "Quarter")
  let headerIdx = rows.findIndex((r) =>
    (r as unknown[]).some((c) => normalizeHeader(c) === 'quarter'),
  );
  if (headerIdx < 0) headerIdx = 0;

  const headers = (rows[headerIdx] as unknown[]).map(normalizeHeader);
  const fieldMap = headers.map((h) => HEADER_ALIASES[h] ?? null);
  const existingKeys = new Set(existing.map(entryDuplicateKey));
  const seen = new Set<string>();

  const previews: ImportPreviewRow[] = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.every((c) => c == null || String(c).trim() === '')) continue;

    const data = emptyInput(defaultFiscalYear);
    fieldMap.forEach((field, col) => {
      if (!field) return;
      const val = row[col];
      switch (field) {
        case 'quarter':
          data.quarter = coerceQuarter(val);
          break;
        case 'fundingDate':
          data.fundingDate = parseExcelDate(val);
          break;
        case 'totalTarget':
        case 'volunteers':
        case 'projectBudget':
        case 'expectedFunding':
        case 'restricted':
        case 'peiRoNo':
        case 'adminOverheads':
        case 'target5500':
        case 'target4500':
        case 'target400':
        case 'target800':
          data[field] = parseNumber(val);
          break;
        case 'fiscalYear':
          data.fiscalYear = String(val || defaultFiscalYear).trim() || defaultFiscalYear;
          break;
        default:
          (data as Record<string, unknown>)[field] = String(val ?? '').trim();
      }
    });

    // Carry-forward empty quarter/region from previous rows (merged Excel cells)
    if (previews.length) {
      const prev = previews[previews.length - 1].data;
      if (!String(row[headers.indexOf('quarter')] ?? '').trim()) data.quarter = prev.quarter;
      if (!data.region) data.region = prev.region;
    }

    const errors: string[] = [];
    if (!data.region) errors.push('Region is required');
    if (!data.month) errors.push('Month is required');

    const key = entryDuplicateKey(data);
    const duplicate = existingKeys.has(key) || seen.has(key);
    seen.add(key);

    previews.push({ rowNumber: i + 1, data, errors, duplicate });
  }

  return previews;
}

export function entriesToSheetRows(entries: ProjectEntry[]): unknown[][] {
  const header = [...EXCEL_COLUMNS];
  const body = entries.map((e) => [
    e.quarter,
    e.region,
    e.month,
    e.projectName,
    e.state,
    e.district,
    e.cluster,
    e.targetType,
    e.donorName,
    e.fundingDate ?? '',
    e.totalTarget ?? '',
    e.volunteers ?? '',
    e.projectBudget ?? '',
    e.expectedFunding ?? '',
    e.restricted ?? '',
    e.peiRoNo ?? '',
    e.adminOverheads ?? '',
    e.target5500 ?? '',
    e.target4500 ?? '',
    e.target400 ?? '',
    e.target800 ?? '',
    e.notes,
  ]);
  return [header, ...body];
}

export function downloadExcel(entries: ProjectEntry[], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet(entriesToSheetRows(entries));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tracker');
  XLSX.writeFile(wb, filename);
}

export function downloadCsv(entries: ProjectEntry[], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet(entriesToSheetRows(entries));
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

export function downloadJsonBackup(entries: ProjectEntry[], settings: unknown, filename: string) {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    entries,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export function parseJsonBackup(text: string): { entries: ProjectEntry[]; settings?: unknown } {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.entries)) {
    throw new Error('Invalid backup file');
  }
  return parsed;
}

export function toProjectEntry(input: ProjectEntryInput, id?: string): ProjectEntry {
  const now = new Date().toISOString();
  return {
    ...input,
    id: id ?? uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
