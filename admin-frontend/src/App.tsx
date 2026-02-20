import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'shared';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminShowsPage from './pages/AdminShowsPage';
import AdminEpisodesPage from './pages/AdminEpisodesPage';
import AdminArticlesPage from './pages/AdminArticlesPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminSubmissionsPage from './pages/AdminSubmissionsPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Login route - no layout */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Protected admin routes with layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/shows"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminShowsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/episodes"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminEpisodesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/articles"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminArticlesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminEventsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminResourcesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminSubmissionsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
