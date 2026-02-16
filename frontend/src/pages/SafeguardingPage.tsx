import React from 'react';
import SEO from '../components/SEO';
import './LegalPage.css';

const SafeguardingPage: React.FC = () => {
  return (
    <div className="legal-page">
      <SEO 
        title="Safeguarding Statement - Resistance Radio Station"
        description="Our commitment to safeguarding and protecting vulnerable individuals."
      />
      <div className="container">
        <div className="legal-content">
          <h1>Safeguarding Statement</h1>
          <p className="last-updated">Last Updated: February 2026</p>

          <section>
            <h2>Our Commitment to Safeguarding</h2>
            <p>
              Resistance Radio Station is committed to safeguarding and protecting all individuals, 
              particularly children and vulnerable adults, who engage with our platform and services.
            </p>
          </section>

          <section>
            <h2>Safeguarding Principles</h2>
            <ul>
              <li><strong>Zero Tolerance:</strong> We have zero tolerance for abuse, exploitation, or harm</li>
              <li><strong>Prevention:</strong> We implement measures to prevent harm before it occurs</li>
              <li><strong>Protection:</strong> We protect individuals from harm and respond appropriately to concerns</li>
              <li><strong>Empowerment:</strong> We empower individuals to speak up and seek help</li>
              <li><strong>Partnership:</strong> We work with relevant authorities and organizations</li>
            </ul>
          </section>

          <section>
            <h2>Reporting Concerns</h2>
            <p>
              If you have concerns about the safety or wellbeing of any individual in connection 
              with our platform, please report it immediately:
            </p>
            <ul>
              <li>Email: <a href="mailto:safeguarding@resistanceradio.org">safeguarding@resistanceradio.org</a></li>
              <li>Emergency situations: Contact local authorities immediately</li>
            </ul>
          </section>

          <section>
            <h2>Content Moderation</h2>
            <p>
              We actively moderate content to ensure it does not contain material that could harm 
              or exploit vulnerable individuals. We remove harmful content promptly and take 
              appropriate action against violators.
            </p>
          </section>

          <section>
            <h2>Training and Awareness</h2>
            <p>
              Our team receives regular training on safeguarding practices and recognizing signs 
              of abuse or exploitation. We maintain awareness of emerging risks and update our 
              policies accordingly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SafeguardingPage;
