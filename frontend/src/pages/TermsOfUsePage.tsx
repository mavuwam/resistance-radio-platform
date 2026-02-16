import React from 'react';
import './LegalPage.css';

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <h1>Terms of Use</h1>
        <p className="last-updated">Last Updated: February 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Resistance Radio Station website ("the Site"), you accept and agree to be bound 
            by these Terms of Use. If you do not agree to these terms, please do not use the Site.
          </p>
        </section>

        <section>
          <h2>2. Use of the Site</h2>
          <h3>2.1 Permitted Use</h3>
          <p>You may use the Site for lawful purposes only. You agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Transmit harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to the Site or its systems</li>
            <li>Interfere with the proper functioning of the Site</li>
            <li>Use automated systems to access the Site without permission</li>
          </ul>

          <h3>2.2 User Content</h3>
          <p>
            When you submit content to the Site (stories, comments, applications), you grant us a non-exclusive, 
            royalty-free, worldwide license to use, reproduce, modify, and distribute that content for the purposes 
            of operating and promoting our services.
          </p>
        </section>

        <section>
          <h2>3. Intellectual Property</h2>
          <p>
            All content on the Site, including text, graphics, logos, audio clips, and software, is the property of 
            Resistance Radio Station or its content suppliers and is protected by copyright and other intellectual 
            property laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, or create derivative works from our content without express 
            written permission, except for personal, non-commercial use.
          </p>
        </section>

        <section>
          <h2>4. Audio Content and Streaming</h2>
          <p>
            Our audio content is provided for personal, non-commercial listening only. You may not:
          </p>
          <ul>
            <li>Record, download, or redistribute our broadcasts without permission</li>
            <li>Use our content for commercial purposes</li>
            <li>Remove or alter any copyright notices or attributions</li>
          </ul>
          <p>
            Educators may use audio clips for educational purposes with proper attribution.
          </p>
        </section>

        <section>
          <h2>5. User Accounts</h2>
          <p>
            If you create an account on the Site, you are responsible for maintaining the confidentiality of your 
            account credentials and for all activities that occur under your account. You agree to notify us immediately 
            of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2>6. Disclaimer of Warranties</h2>
          <p>
            The Site and its content are provided "as is" without warranties of any kind, either express or implied. 
            We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Resistance Radio Station shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages arising out of or related to your use of the Site.
          </p>
        </section>

        <section>
          <h2>8. Third-Party Links</h2>
          <p>
            The Site may contain links to third-party websites. We are not responsible for the content, privacy practices, 
            or terms of use of these external sites. Your use of third-party websites is at your own risk.
          </p>
        </section>

        <section>
          <h2>9. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your access to the Site at any time, without notice, for conduct 
            that we believe violates these Terms of Use or is harmful to other users, us, or third parties.
          </p>
        </section>

        <section>
          <h2>10. Governing Law</h2>
          <p>
            These Terms of Use shall be governed by and construed in accordance with the laws of Zimbabwe, without regard 
            to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>11. Changes to Terms</h2>
          <p>
            We may revise these Terms of Use at any time. Continued use of the Site after changes are posted constitutes 
            your acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2>12. Contact Information</h2>
          <p>For questions about these Terms of Use, please contact us at:</p>
          <p>
            Email: legal@resistanceradio.org<br />
            Address: Resistance Radio Station, Zimbabwe
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
