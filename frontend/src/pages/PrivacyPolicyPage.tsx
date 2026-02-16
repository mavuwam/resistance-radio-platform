import React from 'react';
import './LegalPage.css';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: February 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Resistance Radio Station ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website and use our services.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Register for an account</li>
            <li>Subscribe to our newsletter</li>
            <li>Submit a story or volunteer application</li>
            <li>Contact us through our forms</li>
            <li>Participate in community events</li>
          </ul>
          <p>This information may include: name, email address, phone number, and any other information you choose to provide.</p>

          <h3>2.2 Automatically Collected Information</h3>
          <p>When you visit our website, we may automatically collect certain information about your device, including:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain our services</li>
            <li>Improve and personalize your experience</li>
            <li>Send you newsletters and updates (with your consent)</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Process volunteer applications and story submissions</li>
            <li>Analyze website usage and improve our content</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or respond to lawful requests</li>
            <li>To protect our rights, property, or safety, or that of our users</li>
            <li>With service providers who assist in operating our website (under strict confidentiality agreements)</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
            the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to processing of your personal information</li>
            <li>Withdraw consent for data processing</li>
            <li>Unsubscribe from our newsletters at any time</li>
          </ul>
          <p>To exercise these rights, please contact us at privacy@resistanceradio.org</p>
        </section>

        <section>
          <h2>7. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, 
            and understand user preferences. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 13. We do not knowingly collect personal 
            information from children under 13. If you believe we have collected information from a child under 13, 
            please contact us immediately.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
          <p>
            Email: privacy@resistanceradio.org<br />
            Address: Resistance Radio Station, Zimbabwe
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
