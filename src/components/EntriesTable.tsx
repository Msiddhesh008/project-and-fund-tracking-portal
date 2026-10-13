import { Link } from 'react-router-dom';
import type { ProjectEntry } from '../types';
import { formatDate, formatINR, formatNumber, percentFunded } from '../utils/formatters';

interface Props {
  entries: ProjectEntry[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

function groupEntries(entries: ProjectEntry[]) {
  const groups: { key: string; quarter: string; region: string; rows: ProjectEntry[] }[] = [];
  const map = new Map<string, ProjectEntry[]>();

  const sorted = [...entries].sort((a, b) => {
    const q = a.quarter.localeCompare(b.quarter) || a.region.localeCompare(b.region);
    if (q !== 0) return q;
    return a.month.localeCompare(b.month) || a.projectName.localeCompare(b.projectName);
  });

  for (const e of sorted) {
    const key = `${e.quarter}||${e.region}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }

  for (const [key, rows] of map) {
    const [quarter, region] = key.split('||');
    groups.push({ key, quarter, region, rows });
  }
  return groups;
}

export function EntriesTable({ entries, selected, onToggle, onToggleAll, onDelete }: Props) {
  const groups = groupEntries(entries);
  const ids = entries.map((e) => e.id);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));

  return (
    <>
      <div className="table-wrap desktop-only">
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleAll(ids)}
                  aria-label="Select all"
                />
              </th>
              <th>Month</th>
              <th>Project</th>
              <th>Location</th>
              <th>Donor</th>
              <th className="num">Volunteers</th>
              <th className="num">Budget</th>
              <th className="num">Expected</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <GroupBlock
                key={g.key}
                group={g}
                selected={selected}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
            {!entries.length && (
              <tr>
                <td colSpan={10}>
                  <div className="empty-state">No entries match your filters.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mobile-cards mobile-only">
        {entries.map((e) => {
          const pct = percentFunded(e.expectedFunding, e.projectBudget);
          return (
            <article key={e.id} className="entry-card">
              <div className="entry-card-top">
                <label className="entry-card-select">
                  <input
                    type="checkbox"
                    checked={selected.has(e.id)}
                    onChange={() => onToggle(e.id)}
                  />
                  <div>
                    <h3>{e.projectName || 'Untitled project'}</h3>
                    <p className="entry-card-sub">
                      {e.quarter} · {e.region} · {e.month}
                    </p>
                  </div>
                </label>
                <span className={`badge ${pct >= 100 ? '' : 'warn'}`}>{Math.round(pct)}%</span>
              </div>
              <div className="entry-meta">
                <div>
                  <span className="meta-label">Location</span>
                  <span>{e.cluster || e.district || e.state || '—'}</span>
                </div>
                <div>
                  <span className="meta-label">Donor</span>
                  <span>{e.donorName || 'No donor'}</span>
                </div>
                <div>
                  <span className="meta-label">Volunteers</span>
                  <span>{formatNumber(e.volunteers)}</span>
                </div>
                <div>
                  <span className="meta-label">Budget</span>
                  <span>{formatINR(e.projectBudget)}</span>
                </div>
              </div>
              <div className="entry-card-actions">
                <Link className="btn btn-secondary btn-block" to={`/entries/${e.id}`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-block"
                  onClick={() => onDelete(e.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
        {!entries.length && (
          <div className="empty-state panel panel-pad">No entries match your filters.</div>
        )}
      </div>
    </>
  );
}

function GroupBlock({
  group,
  selected,
  onToggle,
  onDelete,
}: {
  group: { key: string; quarter: string; region: string; rows: ProjectEntry[] };
  selected: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <tr className="group-row">
        <td colSpan={10}>
          {group.quarter} · {group.region} · {group.rows.length}{' '}
          {group.rows.length === 1 ? 'entry' : 'entries'}
        </td>
      </tr>
      {group.rows.map((e) => {
        const pct = percentFunded(e.expectedFunding, e.projectBudget);
        return (
          <tr key={e.id}>
            <td className="checkbox-cell">
              <input
                type="checkbox"
                checked={selected.has(e.id)}
                onChange={() => onToggle(e.id)}
                aria-label={`Select ${e.projectName || e.id}`}
              />
            </td>
            <td>{e.month}</td>
            <td>
              <div style={{ fontWeight: 600 }}>{e.projectName || 'Untitled'}</div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>
                {e.targetType}
                {e.fundingDate ? ` · ${formatDate(e.fundingDate)}` : ''}
              </div>
            </td>
            <td>
              {[e.state, e.district, e.cluster].filter(Boolean).join(' / ') || '—'}
            </td>
            <td>{e.donorName || '—'}</td>
            <td className="num">{formatNumber(e.volunteers)}</td>
            <td className="num">{formatINR(e.projectBudget)}</td>
            <td className="num">{formatINR(e.expectedFunding)}</td>
            <td>
              <span className={`badge ${pct >= 100 ? '' : 'warn'}`}>{Math.round(pct)}% funded</span>
            </td>
            <td>
              <div className="row-actions">
                <Link className="btn btn-secondary btn-sm" to={`/entries/${e.id}`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onDelete(e.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
