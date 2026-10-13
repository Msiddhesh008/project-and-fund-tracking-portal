import { useEffect, useRef, useState } from 'react';
import { Select } from '../components/Select';
import {
  bulkUpsertEntries,
  clearAllData,
  getSettings,
  listEntries,
  replaceAllEntries,
  updateSettings,
} from '../db/api';
import { reseedSampleData } from '../db/seed';
import { useEntries, useSettings } from '../hooks/useTrackerData';
import type { ProjectEntry } from '../types';
import {
  downloadCsv,
  downloadExcel,
  downloadJsonBackup,
  parseJsonBackup,
  parseWorkbook,
  type ImportPreviewRow,
} from '../utils/excel';

export function SettingsPage() {
  const settings = useSettings();
  const entries = useEntries();
  const fileRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);
  const [fy, setFy] = useState(settings.fiscalYear);
  const [preview, setPreview] = useState<ImportPreviewRow[] | null>(null);
  const [importMode, setImportMode] = useState<'skip' | 'replace'>('skip');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFy(settings.fiscalYear);
  }, [settings.fiscalYear]);

  const saveSettings = async () => {
    await updateSettings({ fiscalYear: fy.trim() || settings.fiscalYear });
    setStatus({ type: 'success', text: 'Settings saved.' });
  };

  const onPickImport = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setStatus(null);
    try {
      const buffer = await file.arrayBuffer();
      const rows = parseWorkbook(buffer, settings.fiscalYear, entries);
      setPreview(rows);
      setStatus({
        type: 'info',
        text: `Parsed ${rows.length} rows from ${file.name}. Review and confirm import.`,
      });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to parse file',
      });
      setPreview(null);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!preview) return;
    const valid = preview.filter((r) => r.errors.length === 0);
    setBusy(true);
    try {
      const result = await bulkUpsertEntries(
        valid.map((r) => r.data),
        importMode,
        entries,
      );
      setPreview(null);
      setStatus({
        type: 'success',
        text: `Import done — added ${result.added}, updated ${result.updated}, skipped ${result.skipped}.`,
      });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Import failed',
      });
    } finally {
      setBusy(false);
    }
  };

  const onRestoreBackup = async (file: File | undefined) => {
    if (!file) return;
    if (!confirm('Restore will replace all local entries. Continue?')) return;
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = parseJsonBackup(text);
      const restored = parsed.entries as ProjectEntry[];
      await replaceAllEntries(restored);
      if (parsed.settings && typeof parsed.settings === 'object') {
        const s = parsed.settings as { fiscalYear?: string; currencyDisplay?: 'INR' | 'USD' | 'BOTH' };
        await updateSettings({
          fiscalYear: s.fiscalYear ?? settings.fiscalYear,
          currencyDisplay: s.currencyDisplay ?? settings.currencyDisplay,
        });
        if (s.fiscalYear) setFy(s.fiscalYear);
      }
      setStatus({ type: 'success', text: `Restored ${restored.length} entries from backup.` });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Restore failed',
      });
    } finally {
      setBusy(false);
      if (backupRef.current) backupRef.current.value = '';
    }
  };

  const exportBackup = async () => {
    const [currentSettings, all] = await Promise.all([getSettings(), listEntries()]);
    downloadJsonBackup(all, currentSettings, `tracker-backup-${currentSettings.fiscalYear}.json`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Fiscal year, import/export, and local backup</p>
        </div>
      </div>

      {status && (
        <div className={`alert alert-${status.type === 'info' ? 'info' : status.type}`} role="status">
          {status.text}
        </div>
      )}

      <div className="stack">
        <section className="panel panel-pad">
          <h2 style={{ color: 'var(--brand-blue)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
            General
          </h2>
          <div className="filters">
            <div className="field">
              <label htmlFor="settings-fy">Default fiscal year</label>
              <input
                id="settings-fy"
                value={fy}
                onChange={(e) => setFy(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={saveSettings}>
              Save settings
            </button>
          </div>
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {entries.length} entries stored locally in IndexedDB (browser only).
          </p>
        </section>

        <section className="panel panel-pad">
          <h2 style={{ color: 'var(--brand-blue)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
            Excel / CSV import
          </h2>
          <p className="muted" style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            Columns should match the tracker sheet (Quarter, Region, Month, Project Name, … Notes).
            Duplicate key: quarter + month + cluster + project name.
          </p>
          <div className="filters">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => onPickImport(e.target.files?.[0])}
            />
            <div className="field">
              <label htmlFor="import-mode">Duplicates</label>
              <Select
                id="import-mode"
                value={importMode}
                onChange={(v) => setImportMode(v as 'skip' | 'replace')}
                options={[
                  { value: 'skip', label: 'Skip existing' },
                  { value: 'replace', label: 'Replace existing' },
                ]}
              />
            </div>
          </div>

          {preview && (
            <div style={{ marginTop: '1rem' }}>
              <div className="preview-table table-wrap" style={{ boxShadow: 'none' }}>
                <table className="data-table" style={{ minWidth: 720 }}>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Quarter</th>
                      <th>Region</th>
                      <th>Month</th>
                      <th>Project</th>
                      <th>Cluster</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((r) => (
                      <tr key={r.rowNumber}>
                        <td>{r.rowNumber}</td>
                        <td>{r.data.quarter}</td>
                        <td>{r.data.region}</td>
                        <td>{r.data.month}</td>
                        <td>{r.data.projectName || '—'}</td>
                        <td>{r.data.cluster || '—'}</td>
                        <td>
                          {r.errors.length ? (
                            <span className="badge warn">{r.errors[0]}</span>
                          ) : r.duplicate ? (
                            <span className="badge warn">Duplicate</span>
                          ) : (
                            <span className="badge">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 50 && (
                <p className="muted" style={{ marginTop: '0.5rem' }}>
                  Showing first 50 of {preview.length} rows.
                </p>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={confirmImport}
                >
                  Confirm import
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreview(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="panel panel-pad">
          <h2 style={{ color: 'var(--brand-blue)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
            Export &amp; backup
          </h2>
          <div className="row-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => downloadExcel(entries, `tracker-${settings.fiscalYear}.xlsx`)}
            >
              Export Excel
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => downloadCsv(entries, `tracker-${settings.fiscalYear}.csv`)}
            >
              Export CSV
            </button>
            <button type="button" className="btn btn-secondary" onClick={exportBackup}>
              Download JSON backup
            </button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              Restore JSON backup
              <input
                ref={backupRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(e) => onRestoreBackup(e.target.files?.[0])}
              />
            </label>
          </div>
        </section>

        <section className="panel panel-pad">
          <h2 style={{ color: 'var(--brand-blue)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
            Data tools
          </h2>
          <div className="row-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                if (!confirm('Replace all entries with sample demo data?')) return;
                await reseedSampleData();
                setStatus({ type: 'success', text: 'Sample data loaded.' });
              }}
            >
              Load sample data
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                if (!confirm('Clear ALL local data? This cannot be undone.')) return;
                await clearAllData();
                setFy('2026-27');
                setStatus({ type: 'success', text: 'All local data cleared.' });
              }}
            >
              Clear all data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
