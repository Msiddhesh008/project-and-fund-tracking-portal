export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface ProjectEntry {
  id: string;
  fiscalYear: string;
  quarter: Quarter;
  region: string;
  month: string;
  projectName: string;
  state: string;
  district: string;
  cluster: string;
  targetType: string;
  donorName: string;
  fundingDate: string | null;
  totalTarget: number | null;
  volunteers: number | null;
  projectBudget: number | null;
  expectedFunding: number | null;
  restricted: number | null;
  peiRoNo: number | null;
  adminOverheads: number | null;
  target5500: number | null;
  target4500: number | null;
  target400: number | null;
  target800: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectEntryInput = Omit<ProjectEntry, 'id' | 'createdAt' | 'updatedAt'>;

export interface AppSettings {
  id: string;
  fiscalYear: string;
  currencyDisplay: 'INR' | 'USD' | 'BOTH';
}

export interface EntryFilters {
  fiscalYear: string;
  quarter: string;
  region: string;
  search: string;
  donor: string;
}

export interface DashboardStats {
  entryCount: number;
  totalBudget: number;
  expectedFunding: number;
  fundingGap: number;
  totalVolunteers: number;
  totalTarget: number;
  percentFunded: number;
  byRegion: { name: string; budget: number; expected: number; volunteers: number }[];
  byQuarter: { name: string; budget: number; expected: number; volunteers: number }[];
}

export const EXCEL_COLUMNS = [
  'Quarter',
  'Region',
  'Month',
  'Project Name',
  'State',
  'District',
  'Cluster',
  'Target Type',
  'Donor Name',
  'Funding Date',
  'Total Target',
  'Volunteers',
  'Project Budget',
  'Expected Funding',
  'Restricted',
  'PEI (RO & NO)',
  'Admin & Overheads',
  '₹5,500 Target',
  '₹4,500 Target',
  '$400 Target',
  '$800 Target',
  'Notes',
] as const;

export const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
export const REGIONS = ['West', 'North', 'South', 'East'] as const;
export const TARGET_TYPES = ['Individuals', 'Families', 'Households', 'Communities'] as const;
