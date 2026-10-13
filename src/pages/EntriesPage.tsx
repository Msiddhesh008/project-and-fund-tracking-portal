import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EntriesTable } from '../components/EntriesTable';
import { FiltersBar, type FiltersState } from '../components/FiltersBar';
import { deleteEntries, deleteEntry } from '../db/api';
import { useEntries, useSettings } from '../hooks/useTrackerData';
import { filterEntries } from '../utils/aggregations';
import { downloadCsv, downloadExcel } from '../utils/excel';

export function EntriesPage() {
  const entries = useEntries();
  const settings = useSettings();
  const [filters, setFilters] = useState<FiltersState>({
    fiscalYear: settings.fiscalYear,
    quarter: 'all',
    region: 'all',
    search: '',
    donor: 'all',
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  const filtered = useMemo(() => filterEntries(entries, filters), [entries, filters]);
  const donors = useMemo(
    () => [...new Set(entries.map((e) => e.donorName?.trim() || 'Unassigned'))].sort(),
    [entries],
  );
  const years = useMemo(
    () => [...new Set(entries.map((e) => e.fiscalYear).filter(Boolean))].sort(),
    [entries],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelected((prev) => {
      const allOn = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allOn) return new Set();
      return new Set(ids);
    });
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await deleteEntry(id);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setMessage('Entry deleted.');
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected entries?`)) return;
    await deleteEntries([...selected]);
    setSelected(new Set());
    setMessage(`Deleted ${selected.size} entries.`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Project entries</h1>
          <p className="page-subtitle">
            {filtered.length} of {entries.length} rows · grouped by quarter &amp; region
          </p>
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => downloadExcel(filtered, `tracker-${settings.fiscalYear}.xlsx`)}
          >
            Export Excel
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => downloadCsv(filtered, `tracker-${settings.fiscalYear}.csv`)}
          >
            Export CSV
          </button>
          <Link to="/entries/new" className="btn btn-primary">
            Add Project
          </Link>
        </div>
      </div>

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      <FiltersBar
        value={filters}
        onChange={setFilters}
        fiscalYears={years.length ? years : [settings.fiscalYear]}
        donors={donors}
      />

      {selected.size > 0 && (
        <div className="filters" style={{ marginTop: '-0.25rem' }}>
          <span className="muted">{selected.size} selected</span>
          <button type="button" className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
            Delete selected
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSelected(new Set())}
          >
            Clear selection
          </button>
        </div>
      )}

      <EntriesTable
        entries={filtered}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onDelete={handleDeleteOne}
      />
    </div>
  );
}
