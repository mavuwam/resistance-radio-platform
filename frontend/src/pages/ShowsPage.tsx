import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getShows } from '../services/api';
import SEO from '../components/SEO';
import './ShowsPage.css';

interface Show {
  id: number;
  title: string;
  slug: string;
  description: string;
  host: string;
  category: string;
  broadcast_schedule: string;
  image_url?: string;
  is_active: boolean;
}

const ShowsPage: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Shows' },
    { value: 'civic_education', label: 'Civic Education' },
    { value: 'youth_voices', label: 'Youth Voices' },
    { value: 'diaspora', label: 'Diaspora' },
    { value: 'constitutional_literacy', label: 'Constitutional Literacy' },
    { value: 'investigative', label: 'Investigative' },
    { value: 'community_stories', label: 'Community Stories' },
  ];

  useEffect(() => {
    fetchShows();
  }, [selectedCategory]);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory, is_active: true } : { is_active: true };
      const data = await getShows(params);
      setShows(data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shows-page">
      <SEO
        title="Our Shows"
        description="Explore our programming designed to spark reflection, deepen civic understanding, and amplify the voices of citizens across generations and geographies."
        keywords={['radio shows', 'zimbabwe radio programs', 'civic education', 'community voices']}
        url="/shows"
      />
      <div className="container">
        <h1>Our Shows</h1>
        <p className="intro">
          Our programming is designed to spark reflection, deepen civic understanding, and amplify 
          the voices of citizens across generations and geographies.
        </p>

        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category.value}
              className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading shows...</div>
        ) : shows.length === 0 ? (
          <div className="no-shows">No shows found in this category.</div>
        ) : (
          <div className="shows-grid">
            {shows.map((show) => (
              <div key={show.id} className="show-card">
                <div className="show-image">
                  {show.image_url ? (
                    <img src={show.image_url} alt={show.title} />
                  ) : (
                    <div className="show-image-placeholder"></div>
                  )}
                </div>
                <div className="show-content">
                  <h3>{show.title}</h3>
                  <p className="host">Hosted by {show.host}</p>
                  <p className="description">{show.description}</p>
                  <p className="broadcast-time">{show.broadcast_schedule}</p>
                  <Link to={`/shows/${show.slug}`} className="btn btn-small">
                    View Episodes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowsPage;
