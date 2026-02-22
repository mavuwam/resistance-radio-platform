import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, useEffect, Suspense } from 'react';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { AuthProvider } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import PageLayout from './components/PageLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import './App.css';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ShowsPage = lazy(() => import('./pages/ShowsPage'));
const ShowDetailPage = lazy(() => import('./pages/ShowDetailPage'));
const ListenPage = lazy(() => import('./pages/ListenPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const GetInvolvedPage = lazy(() => import('./pages/GetInvolvedPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const EthicalPrinciplesPage = lazy(() => import('./pages/EthicalPrinciplesPage'));
const SafeguardingPage = lazy(() => import('./pages/SafeguardingPage'));
const EditorialIndependencePage = lazy(() => import('./pages/EditorialIndependencePage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminShowsPage = lazy(() => import('./pages/AdminShowsPage'));
const AdminSubmissionsPage = lazy(() => import('./pages/AdminSubmissionsPage'));
const AdminArticlesPage = lazy(() => import('./pages/AdminArticlesPage'));
const AdminEventsPage = lazy(() => import('./pages/AdminEventsPage'));
const AdminResourcesPage = lazy(() => import('./pages/AdminResourcesPage'));
const AdminEpisodesPage = lazy(() => import('./pages/AdminEpisodesPage'));
const NewsPageDebug = lazy(() => import('./pages/NewsPageDebug'));

function App() {
  return (
    <ErrorBoundary>
      <SecurityProvider>
        <AuthProvider>
          <AudioPlayerProvider>
            <Router>
              <ScrollToTop />
              <div className="App">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
              {/* Public routes */}
              <Route path="/" element={<PageLayout><HomePage /></PageLayout>} />
              <Route path="/about" element={<PageLayout><AboutPage /></PageLayout>} />
              <Route path="/shows" element={<PageLayout><ShowsPage /></PageLayout>} />
              <Route path="/shows/:slug" element={<PageLayout><ShowDetailPage /></PageLayout>} />
              <Route path="/listen" element={<PageLayout><ListenPage /></PageLayout>} />
              <Route path="/news" element={<PageLayout><NewsPage /></PageLayout>} />
              <Route path="/news-debug" element={<PageLayout><NewsPageDebug /></PageLayout>} />
              <Route path="/news/:slug" element={<PageLayout><ArticlePage /></PageLayout>} />
              <Route path="/events" element={<PageLayout><EventsPage /></PageLayout>} />
              <Route path="/get-involved" element={<PageLayout><GetInvolvedPage /></PageLayout>} />
              <Route path="/resources" element={<PageLayout><ResourcesPage /></PageLayout>} />
              <Route path="/contact" element={<PageLayout><ContactPage /></PageLayout>} />
              <Route path="/privacy-policy" element={<PageLayout><PrivacyPolicyPage /></PageLayout>} />
              <Route path="/terms-of-use" element={<PageLayout><TermsOfUsePage /></PageLayout>} />
              <Route path="/cookie-policy" element={<PageLayout><CookiePolicyPage /></PageLayout>} />
              <Route path="/ethical-principles" element={<PageLayout><EthicalPrinciplesPage /></PageLayout>} />
              <Route path="/safeguarding" element={<PageLayout><SafeguardingPage /></PageLayout>} />
              <Route path="/editorial-independence" element={<PageLayout><EditorialIndependencePage /></PageLayout>} />

              {/* Admin login (no layout) */}
              <Route path="/admin/login" element={<PageLayout showHeader={false} showFooter={false} showAudioPlayer={false}><AdminLoginPage /></PageLayout>} />

              {/* Protected admin routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/shows" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminShowsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/submissions" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminSubmissionsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/articles" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminArticlesPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminEventsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/resources" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminResourcesPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/episodes" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminEpisodesPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
            </Routes>
                </Suspense>
              </div>
            </Router>
          </AudioPlayerProvider>
        </AuthProvider>
      </SecurityProvider>
    </ErrorBoundary>
  );
}

export default App;
