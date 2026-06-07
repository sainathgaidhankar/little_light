import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />

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
