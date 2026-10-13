import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blankEntry, EntryForm } from '../components/EntryForm';
import { createEntry, updateEntry } from '../db/api';
import { useEntries, useEntry, useSettings } from '../hooks/useTrackerData';
import type { ProjectEntryInput } from '../types';
import type { LocationNode } from '../utils/locations';

export function EntryNewPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const entries = useEntries();
  const extraLocations = useMemo(() => locationsFromEntries(entries), [entries]);
  const initial = blankEntry(settings.fiscalYear);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Add project entry</h1>
          <p className="page-subtitle">All fields map to the FY Excel tracker columns.</p>
        </div>
      </div>
      <EntryForm
        initial={initial}
        extraLocations={extraLocations}
        submitLabel="Create entry"
        onCancel={() => navigate('/entries')}
        onSubmit={async (data) => {
          await createEntry(data);
          navigate('/entries');
        }}
      />
    </div>
  );
}

export function EntryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = useEntry(id);
  const entries = useEntries();
  const extraLocations = useMemo(() => locationsFromEntries(entries), [entries]);

  if (entry === null) {
    return <div className="panel panel-pad">Loading…</div>;
  }

  if (!entry) {
    return (
      <div className="empty-state panel panel-pad">
        <h2>Entry not found</h2>
        <p className="muted">It may have been deleted.</p>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/entries')}>
          Back to entries
        </button>
      </div>
    );
  }

  const initial: ProjectEntryInput = {
    fiscalYear: entry.fiscalYear,
    quarter: entry.quarter,
    region: entry.region,
    month: entry.month,
    projectName: entry.projectName,
    state: entry.state,
    district: entry.district,
    cluster: entry.cluster,
    targetType: entry.targetType,
    donorName: entry.donorName,
    fundingDate: entry.fundingDate,
    totalTarget: entry.totalTarget,
    volunteers: entry.volunteers,
    projectBudget: entry.projectBudget,
    expectedFunding: entry.expectedFunding,
    restricted: entry.restricted,
    peiRoNo: entry.peiRoNo,
    adminOverheads: entry.adminOverheads,
    target5500: entry.target5500,
    target4500: entry.target4500,
    target400: entry.target400,
    target800: entry.target800,
    notes: entry.notes,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Edit entry</h1>
          <p className="page-subtitle">{entry.projectName || 'Untitled project'}</p>
        </div>
      </div>
      <EntryForm
        key={entry.id}
        initial={initial}
        extraLocations={extraLocations}
        submitLabel="Save changes"
        onCancel={() => navigate('/entries')}
        onSubmit={async (data) => {
          await updateEntry(entry.id, data);
          navigate('/entries');
        }}
      />
    </div>
  );
}

function locationsFromEntries(
  entries: { region: string; state: string; district: string; cluster: string }[],
): LocationNode[] {
  return entries.map((e) => ({
    region: e.region,
    state: e.state,
    district: e.district,
    cluster: e.cluster,
  }));
}
