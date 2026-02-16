import React from 'react';
import SEO from '../components/SEO';
import './LegalPage.css';

const EditorialIndependencePage: React.FC = () => {
  return (
    <div className="legal-page">
      <SEO 
        title="Editorial Independence - Resistance Radio Station"
        description="Our commitment to maintaining editorial independence and journalistic integrity."
      />
      <div className="container">
        <div className="legal-content">
          <h1>Editorial Independence</h1>
          <p className="last-updated">Last Updated: February 2026</p>

          <section>
            <h2>Our Independence</h2>
            <p>
              Resistance Radio Station operates with complete editorial independence. Our content 
              decisions are made solely by our editorial team based on journalistic merit, public 
              interest, and our mission to serve the community.
            </p>
          </section>

          <section>
            <h2>Freedom from Influence</h2>
            <p>We maintain independence from:</p>
            <ul>
              <li><strong>Political Influence:</strong> No political party or government controls our content</li>
              <li><strong>Commercial Pressure:</strong> Advertisers and sponsors have no influence over editorial decisions</li>
              <li><strong>Special Interests:</strong> We resist pressure from any group seeking to influence our coverage</li>
              <li><strong>Financial Interests:</strong> Our funding model supports editorial independence</li>
            </ul>
          </section>

          <section>
            <h2>Editorial Decision-Making</h2>
            <p>
              All editorial decisions are made by our editorial team based on:
            </p>
            <ul>
              <li>Newsworthiness and public interest</li>
              <li>Accuracy and verification of information</li>
              <li>Relevance to our audience and mission</li>
              <li>Ethical journalism standards</li>
            </ul>
          </section>

          <section>
            <h2>Transparency</h2>
            <p>
              We are transparent about our funding sources, partnerships, and any potential 
              conflicts of interest. We clearly label sponsored content and distinguish it 
              from editorial content.
            </p>
          </section>

          <section>
            <h2>Accountability</h2>
            <p>
              We are accountable to our audience, not to political or commercial interests. 
              We welcome feedback and corrections, and we maintain processes for addressing 
              complaints about our editorial decisions.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              For questions about our editorial independence, contact us at{' '}
              <a href="mailto:editorial@resistanceradio.org">editorial@resistanceradio.org</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EditorialIndependencePage;
