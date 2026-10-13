import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiltersBar, type FiltersState } from '../components/FiltersBar';
import { StatTiles } from '../components/StatTiles';
import { useEntries, useSettings } from '../hooks/useTrackerData';
import { computeDashboardStats, filterEntries } from '../utils/aggregations';
import { formatINR } from '../utils/formatters';

export function Dashboard() {
  const entries = useEntries();
  const settings = useSettings();
  const [filters, setFilters] = useState<FiltersState>({
    fiscalYear: settings.fiscalYear,
    quarter: 'all',
    region: 'all',
    search: '',
    donor: 'all',
  });
  const [fySynced, setFySynced] = useState(false);

  useEffect(() => {
    if (!fySynced && settings.fiscalYear) {
      setFilters((f) => ({ ...f, fiscalYear: settings.fiscalYear }));
      setFySynced(true);
    }
  }, [settings.fiscalYear, fySynced]);

  const filtered = useMemo(() => filterEntries(entries, filters), [entries, filters]);
  const stats = useMemo(() => computeDashboardStats(filtered), [filtered]);
  const donors = useMemo(
    () => [...new Set(entries.map((e) => e.donorName?.trim() || 'Unassigned'))].sort(),
    [entries],
  );
  const years = useMemo(
    () => [...new Set(entries.map((e) => e.fiscalYear).filter(Boolean))].sort(),
    [entries],
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>FY {settings.fiscalYear} Dashboard</h1>
          <p className="page-subtitle">Project targets · Donor details · Funding allocation</p>
        </div>
        <Link to="/entries/new" className="btn btn-primary desktop-only">
          Add Project
        </Link>
      </div>

      <FiltersBar
        value={filters}
        onChange={setFilters}
        fiscalYears={years.length ? years : [settings.fiscalYear]}
        donors={donors}
      />

      <div className="navy-strip">
        <div>
          Tracking <strong>{stats.entryCount}</strong> projects across{' '}
          <strong>{stats.byRegion.length || 0}</strong> regions
        </div>
        <div>
          Overall funded <strong>{Math.round(stats.percentFunded)}%</strong>
        </div>
      </div>

      <StatTiles stats={stats} />

      <div className="split-2">
        <div className="panel panel-pad">
          <h2 style={{ marginBottom: '0.75rem', color: 'var(--brand-blue)', fontSize: '1.05rem' }}>
            Budget vs expected by region
          </h2>
          <div className="chart-box">
            {stats.byRegion.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.byRegion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5dde5" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                  <Tooltip formatter={(v) => formatINR(Number(v))} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#002F6C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expected" name="Expected" fill="#0073B1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No data for charts yet.</div>
            )}
          </div>
        </div>

        <div className="panel panel-pad">
          <h2 style={{ marginBottom: '0.75rem', color: 'var(--brand-blue)', fontSize: '1.05rem' }}>
            By quarter
          </h2>
          <div className="chart-box">
            {stats.byQuarter.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.byQuarter}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5dde5" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                  <Tooltip
                    formatter={(v, name) =>
                      name === 'Volunteers' ? String(v) : formatINR(Number(v))
                    }
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#002F6C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="volunteers" name="Volunteers" fill="#C4D600" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No data for charts yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
