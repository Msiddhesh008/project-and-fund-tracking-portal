import { useMemo, useState } from 'react';
import type { ProjectEntryInput, Quarter } from '../types';
import { QUARTERS, REGIONS, TARGET_TYPES } from '../types';
import {
  clustersFor,
  districtsFor,
  monthsForFiscalYear,
  statesForRegion,
  type LocationNode,
} from '../utils/locations';
import { Select } from './Select';

interface Props {
  initial: ProjectEntryInput;
  extraLocations?: LocationNode[];
  submitLabel?: string;
  onSubmit: (data: ProjectEntryInput) => Promise<void> | void;
  onCancel: () => void;
}

export function EntryForm({
  initial,
  extraLocations = [],
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<ProjectEntryInput>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const states = useMemo(
    () => statesForRegion(form.region, extraLocations),
    [form.region, extraLocations],
  );
  const districts = useMemo(
    () => districtsFor(form.region, form.state, extraLocations),
    [form.region, form.state, extraLocations],
  );
  const clusters = useMemo(
    () => clustersFor(form.region, form.state, form.district, extraLocations),
    [form.region, form.state, form.district, extraLocations],
  );
  const months = monthsForFiscalYear(form.fiscalYear);

  const set = <K extends keyof ProjectEntryInput>(key: K, value: ProjectEntryInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setNum = (key: keyof ProjectEntryInput, raw: string) => {
    if (raw === '') {
      set(key, null as never);
      return;
    }
    const n = Number(raw);
    set(key, (Number.isFinite(n) ? n : null) as never);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.region || !form.month) {
      setError('Region and Month are required.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel panel-pad" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-section">
        <h2>Timeline &amp; location</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="fiscalYear">Fiscal year</label>
            <input
              id="fiscalYear"
              value={form.fiscalYear}
              onChange={(e) => set('fiscalYear', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="quarter">Quarter</label>
            <Select
              id="quarter"
              value={form.quarter}
              onChange={(v) => set('quarter', v as Quarter)}
              options={QUARTERS.map((q) => ({ value: q, label: q }))}
            />
          </div>
          <div className="field">
            <label htmlFor="month">Month</label>
            <input
              id="month"
              list="month-options"
              value={form.month}
              onChange={(e) => set('month', e.target.value)}
              required
            />
            <datalist id="month-options">
              {months.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="region">Region</label>
            <Select
              id="region"
              value={form.region}
              placeholder="Select region"
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  region: v,
                  state: '',
                  district: '',
                  cluster: '',
                }))
              }
              options={[
                { value: '', label: 'Select region' },
                ...REGIONS.map((r) => ({ value: r, label: r })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="state">State</label>
            <input
              id="state"
              list="state-options"
              value={form.state}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  state: e.target.value,
                  district: '',
                  cluster: '',
                }))
              }
            />
            <datalist id="state-options">
              {states.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="district">District</label>
            <input
              id="district"
              list="district-options"
              value={form.district}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, district: e.target.value, cluster: '' }))
              }
            />
            <datalist id="district-options">
              {districts.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="cluster">Cluster</label>
            <input
              id="cluster"
              list="cluster-options"
              value={form.cluster}
              onChange={(e) => set('cluster', e.target.value)}
            />
            <datalist id="cluster-options">
              {clusters.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Project &amp; donor</h2>
        <div className="form-grid">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="projectName">Project name</label>
            <input
              id="projectName"
              value={form.projectName}
              onChange={(e) => set('projectName', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="targetType">Target type</label>
            <Select
              id="targetType"
              value={form.targetType}
              onChange={(v) => set('targetType', v)}
              options={TARGET_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>
          <div className="field">
            <label htmlFor="donorName">Donor name</label>
            <input
              id="donorName"
              value={form.donorName}
              onChange={(e) => set('donorName', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="fundingDate">Funding date</label>
            <input
              id="fundingDate"
              type="date"
              value={form.fundingDate ?? ''}
              onChange={(e) => set('fundingDate', e.target.value || null)}
            />
          </div>
          <div className="field">
            <label htmlFor="totalTarget">Total target</label>
            <input
              id="totalTarget"
              type="number"
              value={form.totalTarget ?? ''}
              onChange={(e) => setNum('totalTarget', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="volunteers">Volunteers</label>
            <input
              id="volunteers"
              type="number"
              value={form.volunteers ?? ''}
              onChange={(e) => setNum('volunteers', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Budget &amp; funding</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="projectBudget">Project budget</label>
            <input
              id="projectBudget"
              type="number"
              value={form.projectBudget ?? ''}
              onChange={(e) => setNum('projectBudget', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="expectedFunding">Expected funding</label>
            <input
              id="expectedFunding"
              type="number"
              value={form.expectedFunding ?? ''}
              onChange={(e) => setNum('expectedFunding', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="restricted">Restricted</label>
            <input
              id="restricted"
              type="number"
              value={form.restricted ?? ''}
              onChange={(e) => setNum('restricted', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="peiRoNo">PEI (RO &amp; NO)</label>
            <input
              id="peiRoNo"
              type="number"
              value={form.peiRoNo ?? ''}
              onChange={(e) => setNum('peiRoNo', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="adminOverheads">Admin &amp; overheads</label>
            <input
              id="adminOverheads"
              type="number"
              value={form.adminOverheads ?? ''}
              onChange={(e) => setNum('adminOverheads', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Tier targets</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="target5500">₹5,500 Target</label>
            <input
              id="target5500"
              type="number"
              value={form.target5500 ?? ''}
              onChange={(e) => setNum('target5500', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="target4500">₹4,500 Target</label>
            <input
              id="target4500"
              type="number"
              value={form.target4500 ?? ''}
              onChange={(e) => setNum('target4500', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="target400">$400 Target</label>
            <input
              id="target400"
              type="number"
              value={form.target400 ?? ''}
              onChange={(e) => setNum('target400', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="target800">$800 Target</label>
            <input
              id="target800"
              type="number"
              value={form.target800 ?? ''}
              onChange={(e) => setNum('target800', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Notes</h2>
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function blankEntry(fiscalYear: string): ProjectEntryInput {
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
