import type { DashboardStats } from '../types';
import { formatINR, formatNumber, formatPercent } from '../utils/formatters';

interface Props {
  stats: DashboardStats;
}

export function StatTiles({ stats }: Props) {
  const tiles = [
    { label: 'Entries', value: formatNumber(stats.entryCount) },
    { label: 'Project Budget', value: formatINR(stats.totalBudget) },
    { label: 'Expected Funding', value: formatINR(stats.expectedFunding) },
    {
      label: 'Funding Gap',
      value: formatINR(stats.fundingGap),
      tone: stats.fundingGap < 0 ? 'gap' : 'on-track',
    },
    {
      label: '% Funded',
      value: formatPercent(stats.percentFunded),
      tone: stats.percentFunded >= 100 ? 'on-track' : 'gap',
    },
    { label: 'Volunteers', value: formatNumber(stats.totalVolunteers) },
  ];

  return (
    <div className="stat-grid">
      {tiles.map((t) => (
        <div key={t.label} className={`stat-tile ${t.tone ?? ''}`}>
          <div className="stat-label">{t.label}</div>
          <div className="stat-value">{t.value}</div>
        </div>
      ))}
    </div>
  );
}
