import React from 'react';
import { Target, Users, Globe2, Award, Shield, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function AboutPage() {
  const timeline = [
    { year: '2020', title: 'Foundation', desc: 'Resistance Radio launched with a commitment to truth' },
    { year: '2021', title: 'Growth', desc: 'Reached 5,000 listeners across Zimbabwe' },
    { year: '2023', title: 'Expansion', desc: 'Extended to 15 countries in the diaspora' },
    { year: '2026', title: 'Today', desc: 'Over 12,500 active listeners worldwide' },
  ];

  const team = [
    { name: 'Sarah Moyo', role: 'Program Director', image: 'https://images.unsplash.com/photo-1660675587271-47f1083bc367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2RjYXN0JTIwaG9zdCUyMGludGVydmlld3xlbnwxfHx8fDE3NzA5MjY3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { name: 'Tendai Ncube', role: 'Lead Journalist', image: 'https://images.unsplash.com/photo-1713281318667-920b4708e77e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMHN0dWRpbyUyMG1pY3JvcGhvbmUlMjBicm9hZGNhc3R8ZW58MXx8fHwxNzcwOTI2NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { name: 'Chipo Banda', role: 'Community Lead', image: 'https://images.unsplash.com/photo-1764933361142-fc28a024f3da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBhZnJpY2F8ZW58MXx8fHwxNzcwOTI2NzUwfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { name: 'Rufaro Makoni', role: 'Investigative Reporter', image: 'https://images.unsplash.com/photo-1769509068789-f242b5a6fc47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNvcmRpbmclMjBzdHVkaW8lMjBwcm9mZXNzaW9uYWwlMjBhdWRpb3xlbnwxfHx8fDE3NzA5MjczMjl8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  ];

  return (
    <div className="relative bg-[#0a0a0a] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0f0f] to-[#0a0a0a]" />
        
        {/* Moving Lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full w-px bg-gradient-to-b from-transparent via-[#d4633f] to-transparent animate-slide-down"
              style={{
                left: `${i * 6.66}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${10 + (i % 3) * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 opacity-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent animate-slide-right"
              style={{
                top: `${i * 8.33}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${12 + (i % 4) * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#d4633f]/20 to-transparent rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4633f]/10 backdrop-blur-xl border border-[#d4633f]/30 rounded-full mb-8">
                <span className="text-[#d4633f] text-sm">Our Story</span>
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl text-[#f5f5f5] mb-8 leading-tight font-light">
                About
                <br />
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#d4633f] to-[#d4af37]">
                  Resistance Radio
                </span>
              </h1>
              <p className="text-xl text-[#999999] leading-relaxed">
                A justice-oriented radio station amplifying truth, courage, and community across Zimbabwe and the diaspora.
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                { 
                  icon: Target, 
                  title: 'Our Mission', 
                  desc: 'To amplify voices of truth and justice, creating a platform where citizens speak and power learns to listen.',
                },
                { 
                  icon: TrendingUp, 
                  title: 'Our Vision', 
                  desc: 'A Zimbabwe where truth prevails, communities thrive, and every voice contributes to a just society.',
                },
                { 
                  icon: Award, 
                  title: 'Our Values', 
                  desc: 'Truth, courage, community, dignity, and hope guide everything we do and broadcast.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.title}
                    className="bg-[#1a1a1a]/30 backdrop-blur-xl border border-[#f5f5f5]/10 hover:border-[#d4633f]/50 rounded-3xl p-8 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-16 h-16 bg-[#d4633f]/10 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-[#d4633f]" />
                    </div>
                    <h3 className="text-[#f5f5f5] text-2xl mb-4">{item.title}</h3>
                    <p className="text-[#999999] leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-5xl text-[#f5f5f5] mb-8 leading-tight">
                    Born from a commitment to truth
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-[#d4633f] to-[#d4af37] mb-8" />
                  <div className="space-y-6 text-[#999999] text-lg leading-relaxed">
                    <p>
                      Resistance Radio emerged from a deep commitment to truth and justice. In a time when voices of
                      reason are often silenced, we stand as a beacon of hope and clarity.
                    </p>
                    <p>
                      We believe in the power of community, the strength of courage, and the necessity of transparent
                      communication. Our platform serves Zimbabwe and its diaspora.
                    </p>
                    <p>
                      Every broadcast reflects our commitment to amplifying truth and empowering communities to create lasting change.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/5] relative rounded-3xl overflow-hidden border border-[#f5f5f5]/10">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1598630954858-b0039d615691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcHJvdGVzdCUyMGRlbW9uc3RyYXRpb24lMjBmcmVlZG9tfGVufDF8fHx8MTc3MDkyODA0N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Our Story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl text-[#f5f5f5] mb-4">Our Journey</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#d4633f] to-[#d4af37] mx-auto" />
            </div>

            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {timeline.map((item) => (
                <div 
                  key={item.year}
                  className="bg-[#1a1a1a]/30 backdrop-blur-xl border border-[#f5f5f5]/10 hover:border-[#d4af37]/50 rounded-3xl p-8 text-center transition-all duration-300 hover:scale-105"
                >
                  <div className="text-5xl text-[#d4633f] mb-4">{item.year}</div>
                  <h3 className="text-[#f5f5f5] text-lg mb-3">{item.title}</h3>
                  <p className="text-[#999999] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { icon: Users, number: '12,500+', label: 'Active Listeners' },
                { icon: MapPin, number: '15+', label: 'Countries' },
                { icon: Award, number: '24', label: 'Weekly Shows' },
                { icon: Calendar, number: '1000+', label: 'Hours Broadcast' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label}
                    className="bg-[#1a1a1a]/30 backdrop-blur-xl border border-[#f5f5f5]/10 rounded-3xl p-8 text-center hover:border-[#d4633f]/50 transition-all duration-300"
                  >
                    <Icon className="w-12 h-12 text-[#d4633f] mx-auto mb-4" />
                    <div className="text-5xl text-[#f5f5f5] mb-3">{stat.number}</div>
                    <div className="text-[#999999]">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl text-[#f5f5f5] mb-4">Meet Our Team</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#d4633f] to-[#d4af37] mx-auto mb-4" />
              <p className="text-[#999999] text-lg">The voices behind Resistance Radio</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {team.map((member) => (
                <div 
                  key={member.name}
                  className="group bg-[#1a1a1a]/30 backdrop-blur-xl border border-[#f5f5f5]/10 hover:border-[#d4633f]/50 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <div className="aspect-square overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-[#f5f5f5] text-lg mb-1">{member.name}</h3>
                    <p className="text-[#d4af37] text-sm">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl text-[#f5f5f5] mb-4">Our Core Principles</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#d4633f] to-[#d4af37] mx-auto" />
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, title: 'Truth & Transparency', desc: 'Honest, transparent reporting in everything we broadcast' },
                { icon: Award, title: 'Courage & Resistance', desc: 'Standing fearlessly for justice and accountability' },
                { icon: Users, title: 'Community & Warmth', desc: 'Fostering connections across our communities' },
                { icon: Globe2, title: 'Hope & Future', desc: 'Inspiring action toward a better tomorrow' },
              ].map((principle) => {
                const Icon = principle.icon;
                return (
                  <div 
                    key={principle.title}
                    className="flex gap-6 bg-[#1a1a1a]/30 backdrop-blur-xl border border-[#f5f5f5]/10 hover:border-[#d4633f]/50 rounded-3xl p-8 transition-all duration-300"
                  >
                    <Icon className="w-12 h-12 text-[#d4633f] flex-shrink-0" />
                    <div>
                      <h3 className="text-[#f5f5f5] text-lg mb-3">{principle.title}</h3>
                      <p className="text-[#999999]">{principle.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        .animate-slide-down { animation: slide-down linear infinite; }
        .animate-slide-right { animation: slide-right linear infinite; }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
