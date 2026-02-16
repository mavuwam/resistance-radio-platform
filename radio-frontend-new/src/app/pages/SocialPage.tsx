import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, ExternalLink } from 'lucide-react';

export function SocialPage() {
  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      handle: '@ResistanceRadioZW',
      url: 'https://facebook.com/resistanceradio',
      description: 'Follow us for daily updates, live discussions, and community news.',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      handle: '@ResistanceRadio',
      url: 'https://twitter.com/resistanceradio',
      description: 'Join the conversation and stay updated with real-time news and analysis.',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      handle: '@resistanceradiostation',
      url: 'https://instagram.com/resistanceradio',
      description: 'Visual stories from our community and behind-the-scenes content.',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      handle: 'Resistance Radio',
      url: 'https://youtube.com/@resistanceradio',
      description: 'Watch full interviews, panel discussions, and special broadcasts.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#f5f5f5] mb-6">Connect With Us</h1>
          <p className="text-lg text-[#999999]">
            Follow Resistance Radio on social media to stay connected with our community.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8 hover:border-[#d4633f]/50 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#d4633f]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#d4633f]/20 transition-colors">
                    <Icon className="w-7 h-7 text-[#d4633f]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[#f5f5f5] text-xl group-hover:text-[#d4633f] transition-colors">
                        {platform.name}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-[#999999] group-hover:text-[#d4633f] transition-colors" />
                    </div>
                    <p className="text-[#d4af37] text-sm mb-2">{platform.handle}</p>
                    <p className="text-[#999999] text-sm">{platform.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto mt-12 bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8 text-center">
          <h2 className="text-2xl text-[#f5f5f5] mb-4">Share Your Story</h2>
          <p className="text-[#999999] mb-6">
            Tag us in your posts with <span className="text-[#d4af37]">#ResistanceRadio</span> and{' '}
            <span className="text-[#d4af37]">#VoicesOfZimbabwe</span>
          </p>
          <p className="text-[#999999] text-sm">
            We love sharing stories from our community. Your voice matters!
          </p>
        </div>
      </div>
    </div>
  );
}