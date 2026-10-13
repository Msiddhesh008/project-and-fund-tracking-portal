import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { InstallPrompt } from './InstallPrompt';

const tabs = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/entries',
    label: 'Entries',
    end: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    end: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 19V5M4 19h16M8 16V10M12 16V7M16 16v-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    end: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M19.4 13a7.6 7.6 0 0 0 .05-2l1.8-1.4-1.7-3-2.1.7a7.7 7.7 0 0 0-1.7-1L15.5 3h-3.4l-.25 2.3a7.7 7.7 0 0 0-1.7 1l-2.1-.7-1.7 3L8.2 11a7.6 7.6 0 0 0 0 2l-1.85 1.4 1.7 3 2.1-.7c.53.42 1.1.75 1.7 1L12.1 21h3.4l.25-2.3c.6-.25 1.17-.58 1.7-1l2.1.7 1.7-3L19.4 13Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function Layout() {
  const location = useLocation();
  const hideFab =
    location.pathname.startsWith('/entries/new') ||
    /^\/entries\/[^/]+$/.test(location.pathname);

  return (
    <div className="app-shell">
      <header className="topnav">
        <Link to="/" className="brand">
          <BrandLogo className="brand-logo" />
          <span className="brand-text">Project &amp; Fund Tracker</span>
        </Link>
        <nav className="nav-links desktop-only" aria-label="Primary">
          {tabs.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {l.label === 'Home' ? 'Dashboard' : l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions desktop-only">
          <Link to="/entries/new" className="btn btn-primary btn-sm">
            Add Project
          </Link>
        </div>
      </header>

      <main className="main">
        <InstallPrompt />
        <Outlet />
      </main>

      {!hideFab && (
        <Link
          to="/entries/new"
          className="fab mobile-only"
          aria-label="Add project"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      )}

      <nav className="bottom-nav mobile-only" aria-label="Mobile">
        {tabs.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `bottom-tab${isActive ? ' active' : ''}`}
          >
            <span className="bottom-tab-icon">{l.icon}</span>
            <span className="bottom-tab-label">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
