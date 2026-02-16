import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './AdminDashboardPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Stats {
  shows: number;
  episodes: number;
  articles: number;
  events: number;
  pendingSubmissions: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    shows: 0,
    episodes: 0,
    articles: 0,
    events: 0,
    pendingSubmissions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch counts from various endpoints
      const [showsRes, episodesRes, articlesRes, eventsRes, submissionsRes] = await Promise.all([
        axios.get(`${API_URL}/shows`),
        axios.get(`${API_URL}/episodes`),
        axios.get(`${API_URL}/articles`),
        axios.get(`${API_URL}/events`),
        axios.get(`${API_URL}/admin/submissions?status=pending`)
      ]);

      setStats({
        shows: showsRes.data.length || 0,
        episodes: episodesRes.data.length || 0,
        articles: articlesRes.data.length || 0,
        events: eventsRes.data.length || 0,
        pendingSubmissions: submissionsRes.data.submissions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📻</div>
              <div className="stat-content">
                <h3>{stats.shows}</h3>
                <p>Shows</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎙️</div>
              <div className="stat-content">
                <h3>{stats.episodes}</h3>
                <p>Episodes</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📰</div>
              <div className="stat-content">
                <h3>{stats.articles}</h3>
                <p>Articles</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{stats.events}</h3>
                <p>Events</p>
              </div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-icon">📬</div>
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
                <div className="action-icon">📻</div>
                <h3>Manage Shows</h3>
                <p>Create, edit, and delete shows</p>
              </Link>

              <Link to="/admin/episodes" className="action-card">
                <div className="action-icon">🎙️</div>
                <h3>Manage Episodes</h3>
                <p>Upload and manage episodes</p>
              </Link>

              <Link to="/admin/articles" className="action-card">
                <div className="action-icon">📰</div>
                <h3>Manage Articles</h3>
                <p>Write and publish articles</p>
              </Link>

              <Link to="/admin/events" className="action-card">
                <div className="action-icon">📅</div>
                <h3>Manage Events</h3>
                <p>Create and manage events</p>
              </Link>

              <Link to="/admin/resources" className="action-card">
                <div className="action-icon">📚</div>
                <h3>Manage Resources</h3>
                <p>Upload and organize resources</p>
              </Link>

              <Link to="/admin/submissions" className="action-card">
                <div className="action-icon">📬</div>
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
