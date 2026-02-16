import React from 'react';
import { RadioPlayer } from '../components/RadioPlayer';
import { Radio, Headphones, Signal, Zap, Clock } from 'lucide-react';

export function ListenPage() {
  const schedule = [
    { time: '6:00 AM', show: 'Morning Briefing', host: 'Sarah Moyo', status: 'upcoming' },
    { time: '7:00 AM', show: 'Truth & Justice Today', host: 'Sarah Moyo', status: 'live' },
    { time: '12:00 PM', show: 'Midday News Brief', host: 'Tendai Ncube', status: 'upcoming' },
    { time: '6:00 PM', show: 'Community Connect', host: 'Chipo Banda', status: 'upcoming' },
    { time: '8:00 PM', show: 'Voices of Change', host: 'Rufaro Makoni', status: 'upcoming' },
  ];

  return (
    <div className="bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="py-32 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-3 border-l-4 border-[#d4633f] bg-[#d4633f]/5 mb-8">
              <div className="w-3 h-3 bg-[#d4633f] rounded-full animate-pulse" />
              <span className="text-[#d4633f] tracking-widest uppercase text-sm">Broadcasting Live 24/7</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl text-[#f5f5f5] mb-8 leading-none">
              LISTEN<br />
              <span className="text-[#d4633f]">LIVE</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#d4633f] to-[#d4af37] mx-auto mb-8" />
            <p className="text-xl text-[#999999] max-w-2xl mx-auto">
              Tune in to Resistance Radio — broadcasting truth, courage, and community around the clock
            </p>
          </div>

          {/* Player */}
          <div className="max-w-3xl mx-auto mb-16">
            <RadioPlayer size="large" />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Radio, title: '24/7 BROADCASTING', desc: 'Always on air' },
              { icon: Signal, title: 'HD QUALITY', desc: 'Crystal clear audio' },
              { icon: Headphones, title: 'MULTI-DEVICE', desc: 'Listen anywhere' },
              { icon: Zap, title: 'INSTANT ACCESS', desc: 'One click away' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center border border-[#f5f5f5]/10 p-6 hover:border-[#d4633f] transition-all">
                  <Icon className="w-10 h-10 text-[#d4633f] mx-auto mb-4" />
                  <h3 className="text-[#f5f5f5] text-xs tracking-widest mb-2">{feature.title}</h3>
                  <p className="text-[#999999] text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Listen */}
      <section className="py-24 bg-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[#d4633f] uppercase tracking-widest text-sm mb-4">Getting Started</div>
            <h2 className="text-5xl text-[#f5f5f5] mb-6">HOW TO LISTEN</h2>
            <div className="w-16 h-1 bg-[#d4af37] mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'CLICK PLAY', desc: 'Hit the play button to start streaming instantly' },
              { step: '02', title: 'ADJUST VOLUME', desc: 'Set your preferred listening level' },
              { step: '03', title: 'ENJOY', desc: 'Tune in 24/7 from anywhere in the world' },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="text-7xl text-[#d4633f]/20 mb-6">{item.step}</div>
                <h3 className="text-[#f5f5f5] text-lg tracking-widest mb-4">{item.title}</h3>
                <p className="text-[#999999]">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/3 right-0 transform translate-x-6 text-[#d4633f] text-3xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Schedule */}
      <section className="py-24 bg-[#d4633f]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl text-[#f5f5f5] mb-4 uppercase">ON AIR TODAY</h2>
            <div className="w-16 h-1 bg-[#f5f5f5] mx-auto" />
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {schedule.map((program) => (
              <div
                key={program.show}
                className="flex items-center gap-8 bg-[#f5f5f5]/5 backdrop-blur-sm border-2 border-[#f5f5f5]/10 p-6 hover:border-[#f5f5f5]/30 transition-all"
              >
                <div className="w-24 text-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#f5f5f5] mx-auto mb-2" />
                  <div className="text-2xl text-[#f5f5f5]">{program.time}</div>
                  {program.status === 'live' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f5f5] mt-2">
                      <div className="w-1.5 h-1.5 bg-[#d4633f] rounded-full animate-pulse" />
                      <span className="text-[#d4633f] text-xs uppercase tracking-widest">LIVE</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-[#f5f5f5] text-xl mb-1 uppercase tracking-wide">{program.show}</h3>
                  <p className="text-[#f5f5f5]/70 text-sm uppercase tracking-wider">with {program.host}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto border-2 border-[#d4633f] p-12 text-center">
            <h2 className="text-4xl text-[#f5f5f5] mb-4 uppercase">NEVER MISS A SHOW</h2>
            <div className="w-16 h-1 bg-[#d4af37] mx-auto mb-6" />
            <p className="text-[#999999] mb-8">
              Subscribe for weekly updates on upcoming shows and special broadcasts
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                className="flex-1 px-6 py-4 bg-[#1a1a1a] border border-[#f5f5f5]/10 text-[#f5f5f5] focus:border-[#d4633f] focus:outline-none uppercase text-sm tracking-wider placeholder:text-[#999999]"
              />
              <button className="px-8 py-4 bg-[#d4633f] text-[#f5f5f5] hover:bg-[#d4633f]/90 transition-colors uppercase tracking-widest text-sm">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
