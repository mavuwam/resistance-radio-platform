import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Episode {
  id?: number;
  title: string;
  audioUrl: string;
  showTitle?: string;
  isLive?: boolean;
}

interface AudioPlayerContextType {
  isPlaying: boolean;
  currentEpisode: Episode | null;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
  liveStreamUrl: string | null;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  playEpisode: (episode: Episode) => void;
  playLiveStream: (streamUrl: string) => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: React.ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    // Event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setError('Failed to load audio. Please try again.');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, []);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((err) => {
          setError('Failed to play audio. Please try again.');
          console.error('Play error:', err);
        });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
    }
  };

  const playEpisode = (episode: Episode) => {
    if (audioRef.current) {
      audioRef.current.src = episode.audioUrl;
      setCurrentEpisode(episode);
      setIsLive(false);
      setLiveStreamUrl(null);
      play();
    }
  };

  const playLiveStream = (streamUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      setIsLive(true);
      setLiveStreamUrl(streamUrl);
      setCurrentEpisode(null);
      play();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const value: AudioPlayerContextType = {
    isPlaying,
    currentEpisode,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    isLive,
    liveStreamUrl,
    play,
    pause,
    seek,
    setVolume,
    playEpisode,
    playLiveStream,
    stop,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
