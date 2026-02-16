import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ShowsPage } from './pages/ShowsPage';
import { ListenPage } from './pages/ListenPage';
import { NewsPage } from './pages/NewsPage';
import { EventsPage } from './pages/EventsPage';
import { GetInvolvedPage } from './pages/GetInvolvedPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { EthicalPrinciplesPage } from './pages/EthicalPrinciplesPage';
import { SafeguardingPage } from './pages/SafeguardingPage';
import { SocialPage } from './pages/SocialPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/shows" element={<ShowsPage />} />
            <Route path="/listen" element={<ListenPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/get-involved" element={<GetInvolvedPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/ethical-principles" element={<EthicalPrinciplesPage />} />
            <Route path="/safeguarding" element={<SafeguardingPage />} />
            <Route path="/social" element={<SocialPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}