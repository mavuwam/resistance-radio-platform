import React from 'react';
import SEO from '../components/SEO';
import './LegalPage.css';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="legal-page">
      <SEO 
        title="Cookie Policy - Resistance Radio Station"
        description="Learn about how Resistance Radio Station uses cookies and similar technologies."
      />
      <div className="container">
        <div className="legal-content">
          <h1>Cookie Policy</h1>
          <p className="last-updated">Last Updated: February 2026</p>

          <section>
            <h2>What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our site.
            </p>
          </section>

          <section>
            <h2>How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Authentication Cookies:</strong> Keep you logged in to your account</li>
            </ul>
          </section>

          <section>
            <h2>Managing Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings. Please note that 
              removing or blocking cookies may impact your user experience and some features may 
              not function properly.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@resistanceradio.org">privacy@resistanceradio.org</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
