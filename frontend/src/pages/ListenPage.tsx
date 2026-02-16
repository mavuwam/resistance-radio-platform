import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { getEpisodes } from '../services/api';
import SEO from '../components/SEO';
import './ListenPage.css';

interface Episode {
  id: number;
  title: string;
  slug: string;
  description: string;
  audio_url: string;
  duration: number;
  published_at: string;
  show_title: string;
  show_slug: string;
  category: string;
}

const ListenPage: React.FC = () => {
  const { playEpisode } = useAudioPlayer();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All Episodes' },
    { value: 'civic_education', label: 'Civic Education' },
    { value: 'youth_voices', label: 'Youth Voices' },
    { value: 'diaspora', label: 'Diaspora' },
    { value: 'constitutional_literacy', label: 'Constitutional Literacy' },
    { value: 'investigative', label: 'Investigative' },
    { value: 'community_stories', label: 'Community Stories' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const episodesData = await getEpisodes({ limit: 50, sort: 'published_at', order: 'desc' });
        setEpisodes(episodesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterEpisodes();
  }, [episodes, selectedCategory, searchQuery]);

  const filterEpisodes = () => {
    let filtered = episodes;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ep => ep.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ep => 
        ep.title.toLowerCase().includes(query) ||
        ep.description.toLowerCase().includes(query) ||
        ep.show_title.toLowerCase().includes(query)
      );
    }

    setFilteredEpisodes(filtered);
  };

  const handlePlayEpisode = (episode: Episode) => {
    playEpisode({
      title: episode.title,
      showTitle: episode.show_title,
      audioUrl: episode.audio_url,
      isLive: false
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="listen-page">
      <SEO
        title="Listen Live"
        description="Listen to Resistance Radio live or explore our on-demand library of episodes. Amplifying truth, courage, and community across Zimbabwe and the diaspora."
        keywords={['listen live', 'radio stream', 'on-demand', 'podcasts', 'zimbabwe radio']}
        url="/listen"
      />
      <div className="container">
        <h1>Listen Live</h1>
        
        <section className="live-player">
          <div className="player-container">
            <div className="now-playing">
              <span className="live-indicator">● LIVE</span>
              <span className="show-name">
                Resistance Radio - Live 24/7
              </span>
            </div>
            
            <div className="radio-iframe-container">
              <iframe 
                width="100%" 
                height="180" 
                src="https://s6.citrus3.com/AudioPlayer/resistanceradiostation?mount=&" 
                style={{ border: 0 }}
                title="Resistance Radio Live Player"
                allow="autoplay"
              />
            </div>
          </div>
        </section>
        
        <section className="on-demand">
          <h2>On-Demand Library</h2>
          <p className="intro">Browse and search past episodes</p>
          
          <div className="controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search episodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
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
          </div>

          {loading ? (
            <div className="loading">Loading episodes...</div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="no-episodes">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No episodes found matching your criteria.' 
                : 'No episodes available yet.'}
            </div>
          ) : (
            <div className="episodes-grid">
              {filteredEpisodes.map((episode) => (
                <div key={episode.id} className="episode-card">
                  <div className="episode-header">
                    <span className="show-badge">{episode.show_title}</span>
                    <span className="episode-date">{formatDate(episode.published_at)}</span>
                  </div>
                  <h3>{episode.title}</h3>
                  <p className="episode-description">{episode.description}</p>
                  <div className="episode-footer">
                    <span className="episode-duration">{formatDuration(episode.duration)}</span>
                    <button 
                      className="btn btn-small"
                      onClick={() => handlePlayEpisode(episode)}
                    >
                      ▶ Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ListenPage;
