import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiltersBar, type FiltersState } from '../components/FiltersBar';
import { useEntries, useSettings } from '../hooks/useTrackerData';
import {
  allocationTotals,
  donorRollup,
  filterEntries,
  volunteersByRegionMonth,
} from '../utils/aggregations';
import { formatDate, formatINR, formatNumber } from '../utils/formatters';

const PIE_COLORS = ['#002F6C', '#0073B1', '#E56B30', '#C4D600', '#5a6570', '#8fb8d6'];

export function ReportsPage() {
  const entries = useEntries();
  const settings = useSettings();
  const [filters, setFilters] = useState<FiltersState>({
    fiscalYear: settings.fiscalYear,
    quarter: 'all',
    region: 'all',
    search: '',
    donor: 'all',
  });

  const filtered = useMemo(() => filterEntries(entries, filters), [entries, filters]);
  const donorsFilter = useMemo(
    () => [...new Set(entries.map((e) => e.donorName?.trim() || 'Unassigned'))].sort(),
    [entries],
  );
  const years = useMemo(
    () => [...new Set(entries.map((e) => e.fiscalYear).filter(Boolean))].sort(),
    [entries],
  );

  const donors = useMemo(() => donorRollup(filtered), [filtered]);
  const volunteers = useMemo(() => volunteersByRegionMonth(filtered), [filtered]);
  const allocation = useMemo(() => allocationTotals(filtered), [filtered]);

  const allocationChart = [
    { name: 'Restricted', value: allocation.restricted },
    { name: 'PEI (RO & NO)', value: allocation.peiRoNo },
    { name: 'Admin & Overheads', value: allocation.adminOverheads },
  ].filter((d) => d.value > 0);

  const tierChart = [
    { name: '₹5,500', value: allocation.target5500 },
    { name: '₹4,500', value: allocation.target4500 },
    { name: '$400', value: allocation.target400 },
    { name: '$800', value: allocation.target800 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Donor rollups, volunteer load, and funding allocation</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
          Print report
        </button>
      </div>

      <FiltersBar
        value={filters}
        onChange={setFilters}
        fiscalYears={years.length ? years : [settings.fiscalYear]}
        donors={donorsFilter}
      />

      <div className="split-2" style={{ marginBottom: '1rem' }}>
        <div className="panel panel-pad">
          <h2 style={{ marginBottom: '0.75rem', color: 'var(--brand-blue)', fontSize: '1.05rem' }}>
            Funding allocation
          </h2>
          <div className="chart-box">
            {allocationChart.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={allocationChart} dataKey="value" nameKey="name" outerRadius={90} label>
                    {allocationChart.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatINR(Number(v))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No allocation amounts yet.</div>
            )}
          </div>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            Total project budget in view: {formatINR(allocation.projectBudget)}
          </p>
        </div>

        <div className="panel panel-pad">
          <h2 style={{ marginBottom: '0.75rem', color: 'var(--brand-blue)', fontSize: '1.05rem' }}>
            Tier targets
          </h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tierChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d5dde5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Count / amount" fill="#E56B30" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel panel-pad" style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginBottom: '0.75rem', color: 'var(--brand-blue)', fontSize: '1.05rem' }}>
          Donor rollup
        </h2>
        <div className="table-wrap" style={{ boxShadow: 'none' }}>
          <table className="data-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Donor</th>
                <th className="num">Entries</th>
                <th className="num">Budget</th>
                <th className="num">Expected</th>
                <th>Latest funding date</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d) => (
                <tr key={d.donor}>
                  <td>{d.donor}</td>
                  <td className="num">{d.count}</td>
                  <td className="num">{formatINR(d.budget)}</td>
                  <td className="num">{formatINR(d.expected)}</td>
                  <td>{formatDate(d.latestFunding)}</td>
                </tr>
              ))}
              {!donors.length && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No donors in this filter.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel panel-pad">
        <h2 style={{ marginBottom: '0.75rem', color: 'var(--brand-blue)', fontSize: '1.05rem' }}>
          Volunteers by region &amp; month
        </h2>
        <div className="table-wrap" style={{ boxShadow: 'none' }}>
          <table className="data-table" style={{ minWidth: 480 }}>
            <thead>
              <tr>
                <th>Region</th>
                <th>Month</th>
                <th className="num">Volunteers</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={`${v.region}-${v.month}`}>
                  <td>{v.region}</td>
                  <td>{v.month}</td>
                  <td className="num">{formatNumber(v.volunteers)}</td>
                </tr>
              ))}
              {!volunteers.length && (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">No volunteer data.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
