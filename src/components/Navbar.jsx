import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCampaign } from '../context/CampaignContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/donate', label: 'Donate' },
  { to: '/updates', label: 'Updates' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { campaign } = useCampaign();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const donorCount = Number(campaign?.donations || 0);
  const daysSincePosted = Number.isFinite(Number(campaign?.daysSincePosted))
    ? Number(campaign.daysSincePosted)
    : 0;

  return (
    <header className={`nav-shell ${open ? 'open' : ''}`}>
      <div className="nav-topbar">
        <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
          <img src="/logo.svg" alt="Little Light Fund logo" className="nav-logo" />
          <span>Little Light Fund</span>
        </Link>

        <button
          type="button"
          className={`burger-button ${open ? 'active' : ''}`}
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="nav-drawer">
        <nav className="nav-links" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/admin" className="nav-link nav-link-admin" onClick={() => setOpen(false)}>
            Admin
          </NavLink>
        </nav>

        <div className="nav-meta">
          <div className="nav-stat">
            <span>Donors</span>
            <strong>{donorCount.toLocaleString('en-IN')}</strong>
          </div>
          <div className="nav-stat">
            <span>Days posted</span>
            <strong>{daysSincePosted}</strong>
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                <span className="session-pill">{isAdmin ? 'Admin' : 'Signed in'}</span>
                <button className="ghost-button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <Link className="ghost-button" to="/admin" onClick={() => setOpen(false)}>
                Admin login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
