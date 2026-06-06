import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DonatePage from './pages/DonatePage';
import UpdatesPage from './pages/UpdatesPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import { useAuth } from './context/AuthContext';

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-shell">Loading admin session...</div>;
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminPage />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/dashboard" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
