import React from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import './AudioPlayer.css';

const AudioPlayer: React.FC = () => {
  const {
    isPlaying,
    currentEpisode,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    isLive,
    play,
    pause,
    seek,
    setVolume,
  } = useAudioPlayer();

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  if (!currentEpisode && !isLive) {
    return null; // Don't show player if nothing is playing
  }

  return (
    <div className="audio-player" role="region" aria-label="Audio player">
      <div className="player-content">
        <div className="player-info">
          {isLive ? (
            <>
              <span className="live-badge" aria-label="Live broadcast">● LIVE</span>
              <span className="track-title">Live Broadcast</span>
            </>
          ) : (
            <>
              <span className="track-title">{currentEpisode?.title}</span>
              {currentEpisode?.showTitle && (
                <span className="track-show">{currentEpisode.showTitle}</span>
              )}
            </>
          )}
        </div>

        <div className="player-controls">
          <button
            className="control-btn play-pause"
            onClick={isPlaying ? pause : play}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            aria-pressed={isPlaying}
          >
            {isLoading ? (
              <span className="loading-spinner" aria-hidden="true">⟳</span>
            ) : isPlaying ? (
              <span aria-hidden="true">⏸</span>
            ) : (
              <span aria-hidden="true">▶</span>
            )}
          </button>

          {!isLive && (
            <div className="progress-container">
              <span className="time-display" aria-label="Current time">{formatTime(currentTime)}</span>
              <input
                type="range"
                className="progress-bar"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                aria-label={`Seek audio, current time ${formatTime(currentTime)} of ${formatTime(duration)}`}
                aria-valuemin={0}
                aria-valuemax={duration || 0}
                aria-valuenow={currentTime}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              />
              <span className="time-display" aria-label="Total duration">{formatTime(duration)}</span>
            </div>
          )}

          <div className="volume-container">
            <span className="volume-icon" aria-hidden="true">🔊</span>
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              aria-label={`Volume control, current volume ${Math.round(volume * 100)}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
              aria-valuetext={`${Math.round(volume * 100)}%`}
            />
          </div>
        </div>

        {error && (
          <div className="player-error" role="alert" aria-live="assertive">
            <span className="error-icon" aria-hidden="true">⚠</span>
            <span className="error-message">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
