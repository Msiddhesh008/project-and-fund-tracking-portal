import { NavLink, Outlet, Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/entries', label: 'Entries' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="topnav">
        <Link to="/" className="brand">
          <BrandLogo className="brand-logo" />
          <span className="brand-text">Project &amp; Fund Tracker</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to="/entries/new" className="btn btn-primary btn-sm">
            Add Project
          </Link>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
