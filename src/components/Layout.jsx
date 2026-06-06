import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/donate', label: 'Donate' },
  { to: '/updates', label: 'Updates' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <Link to="/" className="brand-mark brand-mark-with-logo">
            <img src="/logo.svg" alt="Little Light Fund logo" className="brand-logo" />
            <span>Little Light Fund</span>
          </Link>
          <p className="brand-subtitle">Direct support for a baby’s treatment and recovery</p>
        </div>

        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/admin" className="nav-link nav-link-admin">
            Admin
          </NavLink>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="session-pill">{isAdmin ? 'Admin' : 'Signed in'}</span>
              <button className="ghost-button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="ghost-button" to="/admin">
              Admin login
            </Link>
          )}
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <strong>Little Light Fund</strong>
          <p>Transparent medical fundraising with Appwrite and secure payment flows.</p>
        </div>
        <p className="footer-note">SSL is required in production for all payment and admin actions.</p>
      </footer>
    </div>
  );
}
