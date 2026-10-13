import { useMemo, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<FiltersState>) => onChange({ ...value, ...patch });

  const activeCount = useMemo(() => {
    let n = 0;
    if (value.fiscalYear !== 'all') n += 1;
    if (value.quarter !== 'all') n += 1;
    if (value.region !== 'all') n += 1;
    if (value.donor !== 'all') n += 1;
    if (value.search.trim()) n += 1;
    return n;
  }, [value]);

  const clearFilters = () =>
    onChange({
      fiscalYear: 'all',
      quarter: 'all',
      region: 'all',
      search: '',
      donor: 'all',
    });

  return (
    <div className="filters-shell">
      <div className="filters-mobile-bar mobile-only">
        <div className="field grow">
          <label htmlFor="search-mobile" className="sr-only">
            Search
          </label>
          <input
            id="search-mobile"
            type="search"
            placeholder="Search projects…"
            value={value.search}
            onChange={(e) => set({ search: e.target.value })}
            enterKeyHint="search"
          />
        </div>
        <button
          type="button"
          className={`btn btn-secondary filter-toggle${open ? ' is-open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Filters{activeCount ? ` (${activeCount})` : ''}
        </button>
      </div>

      {activeCount > 0 && (
        <div className="filter-chips mobile-only">
          {value.fiscalYear !== 'all' && (
            <button type="button" className="chip" onClick={() => set({ fiscalYear: 'all' })}>
              FY {value.fiscalYear} ×
            </button>
          )}
          {value.quarter !== 'all' && (
            <button type="button" className="chip" onClick={() => set({ quarter: 'all' })}>
              {value.quarter} ×
            </button>
          )}
          {value.region !== 'all' && (
            <button type="button" className="chip" onClick={() => set({ region: 'all' })}>
              {value.region} ×
            </button>
          )}
          {value.donor !== 'all' && (
            <button type="button" className="chip" onClick={() => set({ donor: 'all' })}>
              {value.donor} ×
            </button>
          )}
          <button type="button" className="chip chip-clear" onClick={clearFilters}>
            Clear
          </button>
        </div>
      )}

      <div className={`filters${open ? ' is-expanded' : ''}`}>
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
        <div className="field grow desktop-only">
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
    </div>
  );
}
