import { QUARTERS, REGIONS } from '../types';
import { Select } from './Select';

export interface FiltersState {
  fiscalYear: string;
  quarter: string;
  region: string;
  search: string;
  donor: string;
}

interface Props {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  fiscalYears: string[];
  donors: string[];
}

export function FiltersBar({ value, onChange, fiscalYears, donors }: Props) {
  const set = (patch: Partial<FiltersState>) => onChange({ ...value, ...patch });

  return (
    <div className="filters">
      <div className="field">
        <label htmlFor="fy">Fiscal year</label>
        <Select
          id="fy"
          value={value.fiscalYear}
          onChange={(v) => set({ fiscalYear: v })}
          options={[
            { value: 'all', label: 'All years' },
            ...fiscalYears.map((fy) => ({ value: fy, label: fy })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="quarter">Quarter</label>
        <Select
          id="quarter"
          value={value.quarter}
          onChange={(v) => set({ quarter: v })}
          options={[
            { value: 'all', label: 'All' },
            ...QUARTERS.map((q) => ({ value: q, label: q })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="region">Region</label>
        <Select
          id="region"
          value={value.region}
          onChange={(v) => set({ region: v })}
          options={[
            { value: 'all', label: 'All' },
            ...REGIONS.map((r) => ({ value: r, label: r })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="donor">Donor</label>
        <Select
          id="donor"
          value={value.donor}
          onChange={(v) => set({ donor: v })}
          options={[
            { value: 'all', label: 'All' },
            ...donors.map((d) => ({ value: d, label: d })),
          ]}
        />
      </div>
      <div className="field grow">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Project, donor, cluster…"
          value={value.search}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>
    </div>
  );
}
