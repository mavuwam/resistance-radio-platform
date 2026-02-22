import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from 'shared';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingOverlay } from './components/Loading';
import './App.css';

// Lazy load page components for better performance
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminShowsPage = lazy(() => import('./pages/AdminShowsPage'));
const AdminEpisodesPage = lazy(() => import('./pages/AdminEpisodesPage'));
const AdminArticlesPage = lazy(() => import('./pages/AdminArticlesPage'));
const AdminEventsPage = lazy(() => import('./pages/AdminEventsPage'));
const AdminResourcesPage = lazy(() => import('./pages/AdminResourcesPage'));
const AdminSubmissionsPage = lazy(() => import('./pages/AdminSubmissionsPage'));
const AdminTrashPage = lazy(() => import('./pages/AdminTrashPage'));
const MailboxPage = lazy(() => import('./pages/MailboxPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<LoadingOverlay message="Loading..." fullScreen />}>
              <Routes>
                {/* Public routes - no layout */}
                <Route path="/login" element={<AdminLoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

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
                  path="/change-password"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <ChangePasswordPage />
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

                <Route
                  path="/mailbox"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <MailboxPage />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/trash"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminTrashPage />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
