import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowRight, Play, Users, Globe, Mic, TrendingUp, Clock, Calendar, Zap } from 'lucide-react';
import { RadioPlayer } from '../components/RadioPlayer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function HomePage() {
  const [listenerCount, setListenerCount] = useState(12483);
  const [showCount, setShowCount] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Counter animation on mount
  useEffect(() => {
    const showInterval = setInterval(() => {
      setShowCount(prev => (prev < 24 ? prev + 1 : 24));
    }, 50);
    const countryInterval = setInterval(() => {
      setCountryCount(prev => (prev < 15 ? prev + 1 : 15));
    }, 70);
    
    setTimeout(() => {
      clearInterval(showInterval);
      clearInterval(countryInterval);
    }, 2000);

    return () => {
      clearInterval(showInterval);
      clearInterval(countryInterval);
    };
  }, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredShows = [
    {
      title: 'Truth & Justice Today',
      description: 'Daily news and analysis on social justice issues',
      time: 'Mon-Fri, 7:00 AM',
      host: 'Sarah Moyo',
      listeners: '8.5K',
      image: 'https://images.unsplash.com/photo-1713281318667-920b4708e77e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMHN0dWRpbyUyMG1pY3JvcGhvbmUlMjBicm9hZGNhc3R8ZW58MXx8fHwxNzcwOTI2NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Voices of Change',
      description: 'Conversations with activists and leaders',
      time: 'Wednesday, 8:00 PM',
      host: 'Tendai Ncube',
      listeners: '6.2K',
      image: 'https://images.unsplash.com/photo-1660675587271-47f1083bc367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2RjYXN0JTIwaG9zdCUyMGludGVydmlld3xlbnwxfHx8fDE3NzA5MjY3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Community Connect',
      description: 'Stories from across the diaspora',
      time: 'Saturday, 6:00 PM',
      host: 'Chipo Banda',
      listeners: '7.8K',
      image: 'https://images.unsplash.com/photo-1764933361142-fc28a024f3da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBhZnJpY2F8ZW58MXx8fHwxNzcwOTI2NzUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  return (
    <div className="bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Parallax */}
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1768982418146-c1e7f5087d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMGRqJTIwYnJvYWRjYXN0aW5nJTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MDkyODA0N3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Radio Broadcasting"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Live Badge */}
                <div 
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#d4af37]/10 to-[#d4633f]/10 border border-[#d4af37]/30 rounded-full backdrop-blur-sm animate-fade-in-up shadow-lg shadow-[#d4af37]/10"
                >
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d4af37]"></span>
                  </div>
                  <span className="text-[#d4af37] uppercase tracking-wider font-medium">Broadcasting Live 24/7</span>
                </div>

                {/* Main Heading */}
                <div 
                  className="animate-fade-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  <h1 className="text-5xl md:text-6xl lg:text-7xl text-[#f5f5f5] mb-6 leading-tight">
                    Amplifying Voices of
                    <span className="block text-[#d4633f] mt-2">Truth & Justice</span>
                  </h1>
                  <p className="text-xl text-[#999999] leading-relaxed max-w-xl">
                    Independent radio broadcasting courage, community, and hope across Zimbabwe and the diaspora.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div 
                  className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  <Link
                    to="/listen"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#d4633f] text-[#f5f5f5] rounded-full hover:bg-[#d4633f]/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#d4633f]/50"
                  >
                    <Radio className="w-5 h-5" />
                    <span className="text-lg font-medium">Listen Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/shows"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#d4af37] text-[#d4af37] rounded-full hover:bg-[#d4af37]/10 transition-all duration-300"
                  >
                    <span className="text-lg font-medium">Explore Shows</span>
                  </Link>
                </div>

                {/* Live Stats with Counter Animation */}
                <div 
                  className="grid grid-cols-3 gap-6 pt-8 animate-fade-in-up"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#f5f5f5]/10 rounded-2xl p-5 hover:border-[#d4633f]/30 transition-all duration-300">
                    <Users className="w-6 h-6 text-[#d4633f] mb-2" />
                    <div className="text-3xl text-[#f5f5f5] font-bold mb-1">{listenerCount.toLocaleString()}</div>
                    <div className="text-[#999999] text-sm">Active Listeners</div>
                  </div>
                  <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#f5f5f5]/10 rounded-2xl p-5 hover:border-[#d4af37]/30 transition-all duration-300">
                    <Mic className="w-6 h-6 text-[#d4af37] mb-2" />
                    <div className="text-3xl text-[#f5f5f5] font-bold mb-1">{showCount}</div>
                    <div className="text-[#999999] text-sm">Weekly Shows</div>
                  </div>
                  <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#f5f5f5]/10 rounded-2xl p-5 hover:border-[#d4633f]/30 transition-all duration-300">
                    <Globe className="w-6 h-6 text-[#d4633f] mb-2" />
                    <div className="text-3xl text-[#f5f5f5] font-bold mb-1">{countryCount}+</div>
                    <div className="text-[#999999] text-sm">Countries</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Radio Player */}
              <div 
                className="animate-fade-in-up"
                style={{ animationDelay: '0.5s' }}
              >
                <RadioPlayer size="large" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#d4633f] rounded-full flex justify-center p-2">
            <div className="w-1 h-3 bg-[#d4633f] rounded-full animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,99,63,0.05),transparent_50%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#f5f5f5]/10 hover:border-[#d4633f]/30 transition-all duration-500">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1598630954858-b0039d615691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcHJvdGVzdCUyMGRlbW9uc3RyYXRpb24lMjBmcmVlZG9tfGVufDF8fHx8MTc3MDkyODA0N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Community"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-[#d4633f]/20 to-[#d4af37]/20 rounded-full blur-3xl -z-10" />
              </div>

              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-[#d4633f]/10 border border-[#d4633f]/30 rounded-full">
                  <span className="text-[#d4633f] text-sm font-medium">Our Mission</span>
                </div>
                <h2 className="text-4xl md:text-5xl text-[#f5f5f5] leading-tight">
                  Broadcasting Truth, Building Community
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#d4633f] to-[#d4af37]" />
                <div className="space-y-4 text-[#999999] text-lg leading-relaxed">
                  <p>
                    Resistance Radio was born from a commitment to amplify voices that challenge injustice and promote accountability. We are more than a radio station—we are a movement.
                  </p>
                  <p>
                    Through investigative journalism, community storytelling, and fearless conversations, we create a platform where citizens speak and power learns to listen.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#d4633f]/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-[#d4633f]" />
                    </div>
                    <div>
                      <h3 className="text-[#f5f5f5] font-medium mb-1">Independent Voice</h3>
                      <p className="text-[#999999] text-sm">100% community-funded reporting</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <div>
                      <h3 className="text-[#f5f5f5] font-medium mb-1">Always On</h3>
                      <p className="text-[#999999] text-sm">24/7 live broadcasting</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-[#d4633f] hover:text-[#d4af37] transition-colors group mt-4"
                >
                  <span className="font-medium">Learn More About Us</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shows Section */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full mb-6">
                <span className="text-[#d4af37] text-sm font-medium">Featured Programming</span>
              </div>
              <h2 className="text-4xl md:text-5xl text-[#f5f5f5] mb-4">Popular Shows</h2>
              <p className="text-[#999999] text-lg max-w-2xl mx-auto">
                From daily news to community stories—tune in to voices that matter
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredShows.map((show, index) => (
                <Link
                  key={show.title}
                  to="/shows"
                  className="group relative bg-[#1a1a1a] rounded-3xl overflow-hidden border border-[#f5f5f5]/10 hover:border-[#d4633f]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#d4633f]/20"
                  style={{
                    animation: 'fade-in-up 0.6s ease-out',
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <ImageWithFallback
                      src={show.image}
                      alt={show.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent" />
                    
                    {/* Listeners Badge */}
                    <div className="absolute top-4 right-4 px-4 py-2 bg-[#0a0a0a]/80 backdrop-blur-sm rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
                      <span className="text-[#f5f5f5] text-sm font-medium">{show.listeners}</span>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0a0a]/60 backdrop-blur-sm">
                      <div className="w-20 h-20 rounded-full bg-[#d4633f] flex items-center justify-center hover:scale-110 transition-transform">
                        <Play className="w-10 h-10 text-[#f5f5f5] fill-current ml-1" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-[#f5f5f5] text-xl font-medium mb-2 group-hover:text-[#d4633f] transition-colors">
                        {show.title}
                      </h3>
                      <p className="text-[#999999] text-sm mb-3 line-clamp-2">{show.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-[#999999]">
                          <Clock className="w-4 h-4" />
                          <span>{show.time}</span>
                        </div>
                        <span className="text-[#d4af37]">{show.host}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/shows"
                className="inline-flex items-center gap-3 px-8 py-4 border-2 border-[#d4633f] text-[#d4633f] rounded-full hover:bg-[#d4633f] hover:text-[#f5f5f5] transition-all duration-300 group"
              >
                <span className="text-lg font-medium">View All Shows</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-24 bg-[#d4633f] relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1640090878041-0b06c93d3279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6aW1iYWJ3ZSUyMGxhbmRzY2FwZSUyMG5hdHVyZSUyMGJlYXV0eXxlbnwxfHx8fDE3NzA5MjgwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Impact"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl text-[#f5f5f5] mb-16 font-medium">Making an Impact</h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: TrendingUp, number: '12,500+', label: 'Active Listeners' },
                { icon: Mic, number: '24', label: 'Weekly Shows' },
                { icon: Globe, number: '15+', label: 'Countries' },
                { icon: Zap, number: '1000+', label: 'Hours Broadcast' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label}
                    className="bg-[#f5f5f5]/10 backdrop-blur-sm border border-[#f5f5f5]/20 rounded-3xl p-8 hover:bg-[#f5f5f5]/20 transition-all duration-300"
                    style={{
                      animation: 'fade-in-up 0.6s ease-out',
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Icon className="w-12 h-12 text-[#f5f5f5] mx-auto mb-4" />
                    <div className="text-5xl text-[#f5f5f5] font-bold mb-2">{stat.number}</div>
                    <div className="text-[#f5f5f5]/90">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-24 bg-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Latest News */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl text-[#f5f5f5] font-medium">Latest News</h2>
                  <Link to="/news" className="text-[#d4633f] hover:text-[#d4af37] transition-colors">
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Community Movements Gain Momentum', date: 'Feb 10, 2026', category: 'Community' },
                    { title: 'Analysis: Economic Policy Changes', date: 'Feb 8, 2026', category: 'Analysis' },
                    { title: 'Youth Leadership Summit Announced', date: 'Feb 5, 2026', category: 'Events' },
                  ].map((article) => (
                    <Link
                      key={article.title}
                      to="/news"
                      className="block bg-[#0a0a0a]/50 border border-[#f5f5f5]/10 rounded-2xl p-6 hover:border-[#d4633f]/50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <span className="inline-block px-3 py-1 bg-[#d4633f]/10 text-[#d4633f] text-xs font-medium rounded-full">
                          {article.category}
                        </span>
                        <span className="text-[#999999] text-sm">{article.date}</span>
                      </div>
                      <h3 className="text-[#f5f5f5] font-medium group-hover:text-[#d4633f] transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl text-[#f5f5f5] font-medium">Upcoming Events</h2>
                  <Link to="/events" className="text-[#d4633f] hover:text-[#d4af37] transition-colors">
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Community Listening Session', date: 'Feb 20', time: '6:00 PM' },
                    { title: 'Youth Voices Summit', date: 'Mar 5', time: '10:00 AM' },
                    { title: 'Diaspora Connect Gathering', date: 'Mar 15', time: '7:00 PM' },
                  ].map((event) => (
                    <Link
                      key={event.title}
                      to="/events"
                      className="flex items-center gap-4 bg-[#0a0a0a]/50 border border-[#f5f5f5]/10 rounded-2xl p-6 hover:border-[#d4af37]/50 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-[#d4af37]/10 flex flex-col items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-[#d4af37] mb-1" />
                        <span className="text-[#d4af37] text-xs font-medium">{event.date}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#f5f5f5] font-medium mb-1 group-hover:text-[#d4af37] transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[#999999] text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[#d4633f] to-[#d4633f]/80 rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl text-[#f5f5f5] mb-6 font-medium">Join the Resistance</h2>
              <p className="text-[#f5f5f5]/90 text-lg mb-8 max-w-2xl mx-auto">
                Be part of a movement amplifying truth and justice across Zimbabwe and beyond
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/get-involved"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#f5f5f5] text-[#d4633f] rounded-full hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all duration-300 font-medium"
                >
                  <Users className="w-5 h-5" />
                  <span>Get Involved</span>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#f5f5f5] text-[#f5f5f5] rounded-full hover:bg-[#f5f5f5]/10 transition-all duration-300 font-medium"
                >
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scroll-down {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(12px);
            opacity: 0;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-scroll-down {
          animation: scroll-down 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}