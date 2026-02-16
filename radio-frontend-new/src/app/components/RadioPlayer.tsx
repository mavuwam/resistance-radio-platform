import React, { useState } from 'react';
import { Radio } from 'lucide-react';

interface RadioPlayerProps {
  size?: 'small' | 'large';
  embedCode?: string;
}

export function RadioPlayer({ size = 'large', embedCode }: RadioPlayerProps) {
  const [showInstructions, setShowInstructions] = useState(!embedCode);

  if (size === 'small') {
    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#d4af37]/20 rounded-lg p-4 shadow-lg shadow-[#d4af37]/5">
        {embedCode ? (
          <div dangerouslySetInnerHTML={{ __html: embedCode }} />
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#d4633f] rounded-full flex items-center justify-center">
              <Radio className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                <span className="text-[#d4af37] text-sm font-medium">Ready to Stream</span>
              </div>
              <p className="text-[#999999] text-xs">Awaiting radio embed code</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl p-8 md:p-12 overflow-hidden shadow-2xl">
      {/* Decorative Gold Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      
      {/* Gold Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#d4af37]/10 to-transparent rounded-tl-full" />

      {embedCode ? (
        <div className="relative z-10" dangerouslySetInnerHTML={{ __html: embedCode }} />
      ) : (
        <div className="relative z-10">
          {/* Animated Visualizer Effect */}
          <div className="mb-8 flex items-center justify-center gap-1.5 h-32">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#d4633f] via-[#d4af37] to-[#d4af37]/50"
                style={{
                  height: '30%',
                  animation: `pulse ${0.8 + Math.random() * 0.4}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37]/10 to-[#d4633f]/10 border border-[#d4af37]/30 rounded-full mb-4">
              <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="text-[#d4af37] text-sm uppercase tracking-wider font-medium">
                Ready to Broadcast
              </span>
            </div>
            <h2 className="text-[#f5f5f5] text-3xl mb-2 font-light">Resistance Radio</h2>
            <p className="text-[#d4af37]/70">Voice of the resistance • 24/7 Stream</p>
          </div>

          {/* Radio Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#d4af37] to-[#d4633f] rounded-full flex items-center justify-center shadow-lg shadow-[#d4af37]/30">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4af37]/0 to-[#d4633f]/30 animate-pulse" />
              <Radio className="w-12 h-12 text-[#0a0a0a] relative z-10" />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl p-6">
            <h3 className="text-[#d4af37] text-lg mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#d4633f] rounded-full" />
              Embed Your Radio Stream
            </h3>
            <p className="text-[#f5f5f5]/80 text-sm mb-4">
              To activate the live radio player, paste the HTML embed code from your Citrus3 streaming provider into the RadioPlayer component.
            </p>
            <div className="bg-[#1a1a1a] border border-[#d4af37]/10 rounded-lg p-4">
              <code className="text-[#d4633f] text-xs font-mono">
                &lt;RadioPlayer embedCode="YOUR_HTML_CODE_HERE" /&gt;
              </code>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
