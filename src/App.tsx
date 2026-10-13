import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useTrackerReady } from './hooks/useTrackerData';
import { Dashboard } from './pages/Dashboard';
import { EntriesPage } from './pages/EntriesPage';
import { EntryEditPage, EntryNewPage } from './pages/EntryEditPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { ready, error } = useTrackerReady();

  if (error) {
    return (
      <div className="main">
        <div className="alert alert-error">Failed to open local database: {error}</div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="main">
        <div className="panel panel-pad empty-state">
          <h2>Loading tracker…</h2>
          <p className="muted">Opening local IndexedDB</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="entries/new" element={<EntryNewPage />} />
          <Route path="entries/:id" element={<EntryEditPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
