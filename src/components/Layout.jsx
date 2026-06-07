import { useEffect, useState } from 'react';
import { useLocation, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCampaign } from '../context/CampaignContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/donate', label: 'Donate' },
  { to: '/updates', label: 'Updates' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const { campaign } = useCampaign();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const donorCount = Number(campaign?.donations || 0);
  const daysSincePosted = Number.isFinite(Number(campaign?.daysSincePosted))
    ? Number(campaign.daysSincePosted)
    : 0;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <div className="brand-top">
            <Link to="/" className="brand-mark brand-mark-with-logo">
              <img src="/logo.svg" alt="Little Light Fund logo" className="brand-logo" />
              <span>Little Light Fund</span>
            </Link>
            <span className="brand-badge">Verified fundraising</span>
          </div>
          <p className="brand-subtitle">Direct support for a baby&apos;s treatment and recovery</p>

          <div className="campaign-kpis" aria-label="Campaign summary">
            <div className="kpi-chip">
              <span>Donors</span>
              <strong>{donorCount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="kpi-chip">
              <span>Days since posted</span>
              <strong>{daysSincePosted}</strong>
            </div>
            <div className="kpi-chip">
              <span>Status</span>
              <strong>{campaign?.progress ? `${campaign.progress}% funded` : 'Active'}</strong>
            </div>
          </div>
        </div>

        <button
          className={`burger-button ${menuOpen ? 'active' : ''}`}
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`header-drawer ${menuOpen ? 'open' : ''}`}>
          <nav className="site-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/admin" className="nav-link nav-link-admin" onClick={() => setMenuOpen(false)}>
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
              <Link className="ghost-button" to="/admin" onClick={() => setMenuOpen(false)}>
                Admin login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <strong>Little Light Fund</strong>
          <p>Transparent medical fundraising with Appwrite and secure payment flows.</p>
        </div>
        <div className="footer-note-block">
          <p className="footer-note">SSL is required in production for all payment and admin actions.</p>
          <p className="footer-note">Responsive design adapts to mobile, tablet, and desktop.</p>
        </div>
      </footer>
    </div>
  );
}
