import React, { useState, useRef, useEffect } from 'react';
import { Radio, Play, Pause, Volume2 } from 'lucide-react';
import Hls from 'hls.js';

interface RadioPlayerProps {
  size?: 'small' | 'large';
  embedCode?: string;
}

export function RadioPlayer({ size = 'large', embedCode }: RadioPlayerProps) {
  const [showInstructions, setShowInstructions] = useState(!embedCode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const streamUrl = 'https://s6.citrus3.com/public/resistanceradiostation';

  useEffect(() => {
    if (!audioRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(audioRef.current);
    } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      audioRef.current.src = streamUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  if (size === 'small') {
    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#d4af37]/20 rounded-lg p-4 shadow-lg shadow-[#d4af37]/5">
        <audio ref={audioRef} />
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#d4633f] rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-[#0a0a0a]" />
            ) : (
              <Play className="w-6 h-6 text-[#0a0a0a] ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#d4af37] animate-pulse' : 'bg-[#999999]'}`} />
              <span className={`text-sm font-medium ${isPlaying ? 'text-[#d4af37]' : 'text-[#999999]'}`}>
                {isPlaying ? 'LIVE' : 'Ready to Stream'}
              </span>
            </div>
            <p className="text-[#999999] text-xs">Resistance Radio</p>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#d4af37]" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-[#999999]/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d4af37]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl p-8 md:p-12 overflow-hidden shadow-2xl">
      <audio ref={audioRef} />
      
      {/* Decorative Gold Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      
      {/* Gold Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#d4af37]/10 to-transparent rounded-tl-full" />

      <div className="relative z-10">
        {/* Animated Visualizer Effect */}
        <div className="mb-8 flex items-center justify-center gap-1.5 h-32">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full bg-gradient-to-t from-[#d4633f] via-[#d4af37] to-[#d4af37]/50 ${isPlaying ? '' : 'opacity-30'}`}
              style={{
                height: isPlaying ? '30%' : '10%',
                animation: isPlaying ? `pulse ${0.8 + Math.random() * 0.4}s ease-in-out infinite alternate` : 'none',
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37]/10 to-[#d4633f]/10 border border-[#d4af37]/30 rounded-full mb-4">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#d4af37] animate-pulse' : 'bg-[#999999]'}`} />
            <span className={`text-sm uppercase tracking-wider font-medium ${isPlaying ? 'text-[#d4af37]' : 'text-[#999999]'}`}>
              {isPlaying ? 'LIVE NOW' : 'Ready to Broadcast'}
            </span>
          </div>
          <h2 className="text-[#f5f5f5] text-3xl mb-2 font-light">Resistance Radio</h2>
          <p className="text-[#d4af37]/70">Voice of the resistance • 24/7 Stream</p>
        </div>

        {/* Play Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={togglePlay}
            className="relative w-24 h-24 bg-gradient-to-br from-[#d4af37] to-[#d4633f] rounded-full flex items-center justify-center shadow-lg shadow-[#d4af37]/30 hover:scale-105 transition-transform"
          >
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#d4af37]/0 to-[#d4633f]/30 ${isPlaying ? 'animate-pulse' : ''}`} />
            {isPlaying ? (
              <Pause className="w-12 h-12 text-[#0a0a0a] relative z-10" />
            ) : (
              <Play className="w-12 h-12 text-[#0a0a0a] relative z-10 ml-1" />
            )}
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          <Volume2 className="w-5 h-5 text-[#d4af37]" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-[#999999]/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d4af37] [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-[#d4af37] text-sm w-12 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
