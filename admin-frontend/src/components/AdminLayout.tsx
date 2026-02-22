import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'shared';
import { useSessionManager } from '../hooks/useSessionManager';
import SessionExpiryWarning from './SessionExpiryWarning';
import MailboxNotificationBadge from './MailboxNotificationBadge';
import SubmissionsNotificationBadge from './SubmissionsNotificationBadge';
import { mailboxService } from '../services/mailbox';
import api from 'shared/services/api';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Session management
  const { 
    showWarning, 
    timeUntilExpiry, 
    extendSession, 
    dismissWarning 
  } = useSessionManager();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoutFromWarning = () => {
    dismissWarning();
    handleLogout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch unread count on mount and poll every 30 seconds
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await mailboxService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Fetch pending submissions count on mount and poll every 30 seconds
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await api.get('/admin/submissions/pending-count');
        setPendingCount(response.data.pendingCount);
      } catch (err) {
        console.error('Failed to fetch pending submissions count:', err);
      }
    };

    // Initial fetch
    fetchPendingCount();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchPendingCount();
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="admin-layout">
      {/* Hamburger menu button for mobile */}
      <button 
        className="hamburger-menu" 
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
        aria-expanded={sidebarOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <img src="/logo.jpeg" alt="Resistance Radio Logo" className="logo-image" />
          <div className="logo-text">
            <h2>Resistance Radio</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          <Link to="/dashboard" className="admin-nav-item" onClick={closeSidebar}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            Dashboard
          </Link>

          <div className="nav-section">
            <h3>Content</h3>
            <Link to="/shows" className="admin-nav-item" onClick={closeSidebar}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              Shows
            </Link>
            <Link to="/episodes" className="admin-nav-item" onClick={closeSidebar}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </span>
              Episodes
            </Link>
            <Link to="/articles" className="admin-nav-item" onClick={closeSidebar}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              Articles
            </Link>
            <Link to="/events" className="admin-nav-item" onClick={closeSidebar}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              Events
            </Link>
            <Link to="/resources" className="admin-nav-item" onClick={closeSidebar}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </span>
              Resources
            </Link>
          </div>

          <div className="nav-section">
            <h3>Community</h3>
            <Link to="/submissions" className="admin-nav-item" onClick={closeSidebar}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              Submissions
              <SubmissionsNotificationBadge pendingCount={pendingCount} />
            </Link>
            <Link to="/mailbox" className="admin-nav-item" onClick={closeSidebar}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              Mailbox
              <MailboxNotificationBadge unreadCount={unreadCount} />
            </Link>
          </div>

          <div className="nav-section">
            <h3>System</h3>
            <Link to="/trash" className="admin-nav-item" onClick={closeSidebar}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </span>
              Trash
            </Link>
          </div>

          <a href="https://resistanceradiostation.org" target="_blank" rel="noopener noreferrer" className="admin-nav-item" onClick={closeSidebar}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            View Site
          </a>
        </nav>

        <div className="admin-user">
          <div className="user-info">
            <p className="user-name">{user?.name || user?.email}</p>
            <p className="user-role">{user?.role}</p>
          </div>
          <div className="user-actions">
            <Link to="/change-password" className="btn-change-password" onClick={closeSidebar}>
              Change Password
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>

      {/* Session expiry warning modal */}
      <SessionExpiryWarning
        isOpen={showWarning}
        timeUntilExpiry={timeUntilExpiry}
        onExtendSession={extendSession}
        onLogoutNow={handleLogoutFromWarning}
      />
    </div>
  );
}
