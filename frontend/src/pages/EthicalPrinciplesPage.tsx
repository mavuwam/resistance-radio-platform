import React from 'react';
import SEO from '../components/SEO';
import './LegalPage.css';

const EthicalPrinciplesPage: React.FC = () => {
  return (
    <div className="legal-page">
      <SEO 
        title="Ethical Broadcasting Principles - Resistance Radio Station"
        description="Our commitment to ethical journalism and broadcasting standards."
      />
      <div className="container">
        <div className="legal-content">
          <h1>Ethical Broadcasting Principles</h1>
          <p className="last-updated">Last Updated: February 2026</p>

          <section>
            <h2>Our Commitment</h2>
            <p>
              Resistance Radio Station is committed to the highest standards of ethical journalism 
              and broadcasting. We believe in truth, accuracy, fairness, and accountability in all 
              our content.
            </p>
          </section>

          <section>
            <h2>Core Principles</h2>
            <ul>
              <li><strong>Truth and Accuracy:</strong> We strive for accuracy in all our reporting and correct errors promptly</li>
              <li><strong>Independence:</strong> We maintain editorial independence from political and commercial interests</li>
              <li><strong>Fairness and Impartiality:</strong> We present diverse viewpoints and treat all subjects fairly</li>
              <li><strong>Accountability:</strong> We are accountable to our audience and transparent about our processes</li>
              <li><strong>Respect for Privacy:</strong> We respect individuals' privacy and dignity</li>
              <li><strong>Protection of Sources:</strong> We protect confidential sources of information</li>
            </ul>
          </section>

          <section>
            <h2>Editorial Standards</h2>
            <p>
              All content broadcast on Resistance Radio Station adheres to strict editorial standards. 
              We verify information from multiple sources, provide context, and clearly distinguish 
              between news, analysis, and opinion.
            </p>
          </section>

          <section>
            <h2>Community Responsibility</h2>
            <p>
              We recognize our responsibility to the communities we serve. We amplify marginalized 
              voices, hold power to account, and contribute to informed public discourse on issues 
              affecting democracy and human rights.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              If you have concerns about our editorial standards, please contact us at{' '}
              <a href="mailto:ethics@resistanceradio.org">ethics@resistanceradio.org</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EthicalPrinciplesPage;
