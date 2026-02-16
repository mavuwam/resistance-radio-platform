import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShowBySlug, getShowEpisodes } from '../services/api';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import './ShowDetailPage.css';

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

interface Episode {
  id: number;
  title: string;
  slug: string;
  description: string;
  audio_url: string;
  duration: number;
  published_at: string;
  episode_number?: number;
}

const ShowDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { playEpisode } = useAudioPlayer();

  useEffect(() => {
    if (slug) {
      fetchShowData();
    }
  }, [slug]);

  const fetchShowData = async () => {
    try {
      setLoading(true);
      const [showData, episodesData] = await Promise.all([
        getShowBySlug(slug!),
        getShowEpisodes(slug!)
      ]);
      setShow(showData);
      setEpisodes(episodesData);
    } catch (error) {
      console.error('Error fetching show data:', error);
    } finally {
      setLoading(false);
    }
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
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handlePlayEpisode = (episode: Episode) => {
    playEpisode({
      title: episode.title,
      showTitle: show?.title || '',
      audioUrl: episode.audio_url,
      isLive: false
    });
  };

  if (loading) {
    return (
      <div className="show-detail-page">
        <div className="container">
          <div className="loading">Loading show...</div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="show-detail-page">
        <div className="container">
          <div className="error">Show not found</div>
          <Link to="/shows" className="btn">Back to Shows</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="show-detail-page">
      <div className="container">
        <Link to="/shows" className="back-link">← Back to Shows</Link>
        
        <div className="show-header">
          <div className="show-header-image">
            {show.image_url ? (
              <img src={show.image_url} alt={show.title} />
            ) : (
              <div className="show-image-placeholder"></div>
            )}
          </div>
          <div className="show-header-content">
            <h1>{show.title}</h1>
            <p className="host">Hosted by {show.host}</p>
            <p className="broadcast-schedule">{show.broadcast_schedule}</p>
            <p className="description">{show.description}</p>
          </div>
        </div>

        <div className="episodes-section">
          <h2>Episodes</h2>
          {episodes.length === 0 ? (
            <div className="no-episodes">No episodes available yet.</div>
          ) : (
            <div className="episodes-list">
              {episodes.map((episode) => (
                <div key={episode.id} className="episode-card">
                  <div className="episode-info">
                    {episode.episode_number && (
                      <span className="episode-number">Episode {episode.episode_number}</span>
                    )}
                    <h3>{episode.title}</h3>
                    <p className="episode-description">{episode.description}</p>
                    <div className="episode-meta">
                      <span className="episode-date">{formatDate(episode.published_at)}</span>
                      <span className="episode-duration">{formatDuration(episode.duration)}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-play"
                    onClick={() => handlePlayEpisode(episode)}
                  >
                    ▶ Play
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowDetailPage;
