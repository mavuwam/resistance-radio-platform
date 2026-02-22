import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'shared';
import { getDashboardStats } from 'shared/services/api';
import { useToast } from '../utils/toast';
import { extractErrorMessage } from '../utils/validation';
import './AdminDashboardPage.css';

interface Stats {
  shows: number;
  episodes: number;
  articles: number;
  events: number;
  pendingSubmissions: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState<Stats>({
    shows: 0,
    episodes: 0,
    articles: 0,
    events: 0,
    pendingSubmissions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();

    // Refresh dashboard statistics when page regains focus
    const handleFocus = () => {
      fetchStats();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      // Fetch dashboard statistics from dedicated endpoint
      const dashboardStats = await getDashboardStats();

      setStats({
        shows: dashboardStats.shows.total,
        episodes: dashboardStats.episodes.total,
        articles: dashboardStats.articles.total,
        events: dashboardStats.events.total,
        pendingSubmissions: dashboardStats.submissions.pending
      });

      // Ensure minimum loading time of 300ms to prevent flickering
      const elapsed = Date.now() - startTime;
      if (elapsed < 300) {
        await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, 'Failed to load dashboard statistics');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name || user?.email}</p>
      </div>

      {isLoading ? (
        <>
          <div className="stats-grid">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="stat-card skeleton-stat-card">
                <div className="skeleton skeleton-icon" />
                <div className="stat-content">
                  <div className="skeleton skeleton-stat-number" />
                  <div className="skeleton skeleton-stat-label" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : error ? (
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h2>Failed to Load Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchStats} className="retry-button">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.shows}</h3>
                <p>Shows</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.episodes}</h3>
                <p>Episodes</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.articles}</h3>
                <p>Articles</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.events}</h3>
                <p>Events</p>
              </div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.pendingSubmissions}</h3>
                <p>Pending Submissions</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/admin/shows" className="action-card">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3>Manage Shows</h3>
                <p>Create, edit, and delete shows</p>
              </Link>

              <Link to="/admin/episodes" className="action-card">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="8" y1="22" x2="16" y2="22" />
                  </svg>
                </div>
                <h3>Manage Episodes</h3>
                <p>Upload and manage episodes</p>
              </Link>

              <Link to="/admin/articles" className="action-card">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3>Manage Articles</h3>
                <p>Write and publish articles</p>
              </Link>

              <Link to="/admin/events" className="action-card">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3>Manage Events</h3>
                <p>Create and manage events</p>
              </Link>

              <Link to="/admin/resources" className="action-card">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3>Manage Resources</h3>
                <p>Upload and organize resources</p>
              </Link>

              <Link to="/admin/submissions" className="action-card">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h3>Review Submissions</h3>
                <p>Review and moderate submissions</p>
                {stats.pendingSubmissions > 0 && (
                  <span className="badge">{stats.pendingSubmissions}</span>
                )}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
