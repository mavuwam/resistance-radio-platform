import React from 'react';
import SEO from '../components/SEO';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <SEO
        title="About Us"
        description="Learn about Resistance Radio's mission to cultivate informed, courageous, and justice-oriented citizens through accessible broadcasting, ethical dialogue, and community-centred storytelling."
        keywords={['about resistance radio', 'mission', 'vision', 'values', 'zimbabwe media']}
        url="/about"
      />
      <div className="container">
        <h1>About Us</h1>
        
        <section className="mission">
          <h2>Our Mission</h2>
          <p>
            To cultivate informed, courageous, and justice-oriented citizens through accessible 
            broadcasting, ethical dialogue, and community-centred storytelling.
          </p>
        </section>
        
        <section className="vision">
          <h2>Our Vision</h2>
          <p>
            A society where every citizen understands their power, every voice matters, and public 
            discourse heals rather than harms.
          </p>
        </section>
        
        <section className="values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Truth-telling</h3>
              <p>We verify information before broadcasting and commit to factual accuracy.</p>
            </div>
            <div className="value-card">
              <h3>Courage</h3>
              <p>We speak honestly about injustice, even when it's uncomfortable.</p>
            </div>
            <div className="value-card">
              <h3>Ethical Leadership</h3>
              <p>We lead with integrity, compassion, and accountability.</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>Citizens' voices guide our work and shape our programming.</p>
            </div>
            <div className="value-card">
              <h3>Justice</h3>
              <p>We stand for fairness, accountability, and human dignity.</p>
            </div>
            <div className="value-card">
              <h3>Healing</h3>
              <p>We create conversations that heal divisions and build understanding.</p>
            </div>
          </div>
        </section>
        
        <section className="story">
          <h2>Our Story</h2>
          <p>
            Resistance Radio Station was born from a simple but urgent truth: citizens deserve spaces 
            where they can think freely, speak boldly, and imagine a just future together. For too long, 
            public discourse has been shaped by fear, distortion, and the silencing of ordinary people. 
            We created this station to change that.
          </p>
          <p>
            We are a civic broadcasting platform rooted in ethical dialogue, constitutional literacy, 
            and community empowerment. Our work is guided by the belief that democracy is not a spectator 
            sport — it is a living practice, carried out in the voices, questions, and courage of everyday people.
          </p>
          <p>
            Here, we centre the citizen. We honour lived experience. We interrogate power with clarity 
            and compassion. We create conversations that heal, challenge, and illuminate. Whether you are 
            in Harare, Bulawayo, Johannesburg, London, or the diaspora beyond, this station is your home — 
            a place where your voice matters and your agency is recognised.
          </p>
          <p>
            Resistance Radio Station is not just a broadcaster. It is a gathering. A movement. A reminder 
            that when citizens speak, the nation shifts.
          </p>
          <p className="welcome">
            <strong>Welcome to the resistance.</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
