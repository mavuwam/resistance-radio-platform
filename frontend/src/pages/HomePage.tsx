import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShows, getEpisodes } from '../services/api';
import SEO from '../components/SEO';
import './HomePage.css';

interface Show {
  id: number;
  title: string;
  slug: string;
  description: string;
  host_name: string;
  broadcast_schedule?: string;
  cover_image_url?: string;
}

interface Episode {
  id: number;
  title: string;
  show_title?: string;
  published_at: string;
}

const HomePage: React.FC = () => {
  const [featuredShows, setFeaturedShows] = useState<Show[]>([]);
  const [upcomingBroadcasts, setUpcomingBroadcasts] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured shows (limit to 4)
        const showsData = await getShows({ is_active: true });
        setFeaturedShows(showsData.shows?.slice(0, 4) || []);

        // Fetch recent episodes for upcoming broadcasts section
        const episodesData = await getEpisodes({ limit: 5, sort: 'published_at', order: 'DESC' });
        setUpcomingBroadcasts(episodesData.episodes || []);
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      <SEO
        title="Home"
        description="Resistance Radio - A justice-oriented radio station amplifying truth, courage, and community across Zimbabwe and the diaspora. Where citizens speak, and power learns to listen."
        keywords={['resistance radio', 'zimbabwe radio', 'civic broadcasting', 'community radio', 'justice', 'activism']}
        url="/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'RadioStation',
          name: 'Resistance Radio',
          description: 'A justice-oriented radio station amplifying truth, courage, and community across Zimbabwe and the diaspora',
          url: 'https://resistanceradio.org',
          logo: 'https://resistanceradio.org/logo.jpeg',
          sameAs: [
            'https://twitter.com/ResistanceRadio',
            'https://facebook.com/ResistanceRadio'
          ]
        }}
      />
      <section className="hero">
        <div className="container">
          <h2 className="hero-title">Where citizens speak, and power learns to listen.</h2>
          <p className="hero-subtitle">
            A justice-oriented radio station amplifying truth, courage, and community 
            across Zimbabwe and the diaspora.
          </p>
          <div className="hero-buttons">
            <Link to="/listen" className="btn btn-primary">Listen Live</Link>
            <Link to="/get-involved" className="btn btn-secondary">Join the Conversation</Link>
          </div>
        </div>
      </section>

      <section className="featured-shows">
        <div className="container">
          <h2>Featured Shows</h2>
          {loading ? (
            <p>Loading shows...</p>
          ) : (
            <div className="shows-grid">
              {featuredShows.length > 0 ? (
                featuredShows.map((show) => (
                  <div key={show.id} className="show-card">
                    {show.cover_image_url && (
                      <img src={show.cover_image_url} alt={show.title} className="show-image" />
                    )}
                    <h3>{show.title}</h3>
                    <p className="host">Hosted by {show.host_name}</p>
                    <p>{show.description}</p>
                    {show.broadcast_schedule && (
                      <p className="schedule">{show.broadcast_schedule}</p>
                    )}
                    <Link to={`/shows/${show.slug}`} className="btn btn-small">Learn More</Link>
                  </div>
                ))
              ) : (
                <>
                  <div className="show-card">
                    <h3>The Citizen's Bench</h3>
                    <p className="host">Hosted by Gerrard Anko Ged Belts</p>
                    <p>A weekly deep dive into constitutional issues, public accountability, and the ethics of leadership.</p>
                    <Link to="/shows" className="btn btn-small">Learn More</Link>
                  </div>
                  <div className="show-card">
                    <h3>Youth Voices</h3>
                    <p className="host">Hosted by Community Leaders</p>
                    <p>Amplifying the perspectives and concerns of young citizens across Zimbabwe.</p>
                    <Link to="/shows" className="btn btn-small">Learn More</Link>
                  </div>
                  <div className="show-card">
                    <h3>Diaspora Reflections</h3>
                    <p className="host">Hosted by Various Contributors</p>
                    <p>Connecting Zimbabweans abroad with conversations that matter back home.</p>
                    <Link to="/shows" className="btn btn-small">Learn More</Link>
                  </div>
                  <div className="show-card">
                    <h3>Constitutional Literacy Hour</h3>
                    <p className="host">Hosted by Legal Experts</p>
                    <p>Breaking down constitutional rights and civic responsibilities in accessible language.</p>
                    <Link to="/shows" className="btn btn-small">Learn More</Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="upcoming-broadcasts">
        <div className="container">
          <h2>Upcoming Broadcasts</h2>
          {loading ? (
            <p>Loading schedule...</p>
          ) : upcomingBroadcasts.length > 0 ? (
            <div className="broadcast-schedule">
              {upcomingBroadcasts.map((episode) => (
                <div key={episode.id} className="broadcast-item">
                  <span className="broadcast-show">{episode.show_title || 'Special Broadcast'}</span>
                  <span className="broadcast-title">{episode.title}</span>
                  <span className="broadcast-time">
                    {new Date(episode.published_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>Check back soon for our broadcast schedule</p>
          )}
        </div>
      </section>

      <section className="mission">
        <div className="container">
          <h2>Why We Exist</h2>
          <p>
            Resistance Radio Station is a civic broadcasting platform dedicated to constitutional 
            literacy, ethical dialogue, and citizen empowerment. We create spaces where ordinary 
            people can interrogate power, imagine alternatives, and build a future rooted in justice.
          </p>
        </div>
      </section>

      <section className="values">
        <div className="container">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Truth-telling</h3>
              <p>We verify information before broadcasting</p>
            </div>
            <div className="value-card">
              <h3>Courage</h3>
              <p>We speak honestly about injustice</p>
            </div>
            <div className="value-card">
              <h3>Ethical Leadership</h3>
              <p>We lead with integrity and compassion</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>Citizens' voices guide our work</p>
            </div>
            <div className="value-card">
              <h3>Justice</h3>
              <p>We stand for fairness and accountability</p>
            </div>
            <div className="value-card">
              <h3>Healing</h3>
              <p>We create conversations that heal</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Get Involved</h2>
          <p>Your voice matters. Join us in building a more just and informed society.</p>
          <div className="cta-buttons">
            <Link to="/get-involved" className="btn btn-primary">Submit a Story</Link>
            <Link to="/get-involved" className="btn btn-secondary">Volunteer</Link>
            <Link to="/get-involved" className="btn btn-secondary">Become a Contributor</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
