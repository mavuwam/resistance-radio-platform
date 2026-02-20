import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'shared';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Resistance Radio</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          <Link to="/dashboard" className="admin-nav-item">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>

          <div className="nav-section">
            <h3>Content</h3>
            <Link to="/shows" className="admin-nav-item">
              <span className="nav-icon">📻</span>
              Shows
            </Link>
            <Link to="/episodes" className="admin-nav-item">
              <span className="nav-icon">🎙️</span>
              Episodes
            </Link>
            <Link to="/articles" className="admin-nav-item">
              <span className="nav-icon">📰</span>
              Articles
            </Link>
            <Link to="/events" className="admin-nav-item">
              <span className="nav-icon">📅</span>
              Events
            </Link>
            <Link to="/resources" className="admin-nav-item">
              <span className="nav-icon">📚</span>
              Resources
            </Link>
          </div>

          <div className="nav-section">
            <h3>Community</h3>
            <Link to="/submissions" className="admin-nav-item">
              <span className="nav-icon">📬</span>
              Submissions
            </Link>
          </div>

          <a href="https://resistanceradiostation.org" target="_blank" rel="noopener noreferrer" className="admin-nav-item">
            <span className="nav-icon">🏠</span>
            View Site
          </a>
        </nav>

        <div className="admin-user">
          <div className="user-info">
            <p className="user-name">{user?.name || user?.email}</p>
            <p className="user-role">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
