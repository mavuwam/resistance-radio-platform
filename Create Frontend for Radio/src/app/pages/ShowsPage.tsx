import React, { useState } from 'react';
import { Clock, Calendar, Filter, Users } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function ShowsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'News', 'Podcast', 'Culture', 'Investigation', 'Youth'];

  const shows = [
    {
      title: 'Truth & Justice Today',
      description: 'Daily news and analysis on social justice issues affecting Zimbabwe and the diaspora community.',
      schedule: 'Monday - Friday',
      time: '7:00 AM - 9:00 AM',
      host: 'Sarah Moyo',
      category: 'News',
      listeners: '8.5K',
      image: 'https://images.unsplash.com/photo-1713281318667-920b4708e77e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMHN0dWRpbyUyMG1pY3JvcGhvbmUlMjBicm9hZGNhc3R8ZW58MXx8fHwxNzcwOTI2NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Voices of Change',
      description: 'In-depth conversations with activists, community leaders, and changemakers driving transformation.',
      schedule: 'Wednesday',
      time: '8:00 PM - 9:30 PM',
      host: 'Tendai Ncube',
      category: 'Podcast',
      listeners: '6.2K',
      image: 'https://images.unsplash.com/photo-1660675587271-47f1083bc367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2RjYXN0JTIwaG9zdCUyMGludGVydmlld3xlbnwxfHx8fDE3NzA5MjY3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Community Connect',
      description: 'Stories from across Zimbabwe and the global diaspora community celebrating unity and resilience.',
      schedule: 'Saturday',
      time: '6:00 PM - 8:00 PM',
      host: 'Chipo Banda',
      category: 'Culture',
      listeners: '7.8K',
      image: 'https://images.unsplash.com/photo-1764933361142-fc28a024f3da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBhZnJpY2F8ZW58MXx8fHwxNzcwOTI2NzUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'The Resistance Report',
      description: 'Investigative journalism uncovering stories of resistance, accountability, and justice.',
      schedule: 'Tuesday & Thursday',
      time: '9:00 PM - 10:00 PM',
      host: 'Rufaro Makoni',
      category: 'Investigation',
      listeners: '5.9K',
      image: 'https://images.unsplash.com/photo-1769509068789-f242b5a6fc47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNvcmRpbmclMjBzdHVkaW8lMjBwcm9mZXNzaW9uYWwlMjBhdWRpb3xlbnwxfHx8fDE3NzA5MjczMjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Youth Voices Rise',
      description: 'A platform for young people to share perspectives on issues affecting their generation.',
      schedule: 'Sunday',
      time: '3:00 PM - 5:00 PM',
      host: 'Tafadzwa Chikwanha',
      category: 'Youth',
      listeners: '4.3K',
      image: 'https://images.unsplash.com/photo-1660675587271-47f1083bc367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2RjYXN0JTIwaG9zdCUyMGludGVydmlld3xlbnwxfHx8fDE3NzA5MjY3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Cultural Currents',
      description: 'Exploring arts, music, and culture as vehicles for social change across Africa.',
      schedule: 'Friday',
      time: '7:00 PM - 9:00 PM',
      host: 'Nyasha Sibanda',
      category: 'Culture',
      listeners: '6.7K',
      image: 'https://images.unsplash.com/photo-1764933361142-fc28a024f3da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBhZnJpY2F8ZW58MXx8fHwxNzcwOTI2NzUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Morning Briefing',
      description: 'Start your day with the latest news, analysis, and discussions on current events.',
      schedule: 'Monday - Friday',
      time: '6:00 AM - 7:00 AM',
      host: 'Sarah Moyo',
      category: 'News',
      listeners: '9.1K',
      image: 'https://images.unsplash.com/photo-1713281318667-920b4708e77e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMHN0dWRpbyUyMG1pY3JvcGhvbmUlMjBicm9hZGNhc3R8ZW58MXx8fHwxNzcwOTI2NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Weekend Special',
      description: 'A mix of music, interviews, and community stories to kick off your weekend.',
      schedule: 'Saturday',
      time: '10:00 AM - 12:00 PM',
      host: 'Chipo Banda',
      category: 'Culture',
      listeners: '5.4K',
      image: 'https://images.unsplash.com/photo-1758875913518-7869eb5e1e91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcGVvcGxlJTIwY2VsZWJyYXRpb24lMjB1bml0eXxlbnwxfHx8fDE3NzA5MjczMjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const filteredShows = activeCategory === 'All' 
    ? shows 
    : shows.filter(show => show.category === activeCategory);

  return (
    <div className="bg-[#0a0a0a] py-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-[#d4633f] uppercase tracking-widest text-sm mb-6">Programming</div>
          <h1 className="text-6xl lg:text-8xl text-[#f5f5f5] mb-8 leading-none">
            OUR<br />
            <span className="text-[#d4633f]">SHOWS</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#d4633f] to-[#d4af37] mx-auto mb-8" />
          <p className="text-lg text-[#999999] max-w-3xl mx-auto">
            From daily news to weekend specials—tune in to programming that amplifies truth and builds community.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Filter className="w-5 h-5 text-[#d4633f]" />
            <span className="text-[#f5f5f5] uppercase tracking-widest text-sm">FILTER</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-8 py-3 transition-all uppercase tracking-widest text-sm ${
                  activeCategory === category
                    ? 'bg-[#d4633f] text-[#f5f5f5]'
                    : 'border-2 border-[#f5f5f5]/10 text-[#999999] hover:text-[#f5f5f5] hover:border-[#d4633f]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Shows Grid */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {filteredShows.map((show) => (
            <div
              key={show.title}
              className="group border-2 border-[#f5f5f5]/10 hover:border-[#d4633f] transition-all"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <ImageWithFallback
                  src={show.image}
                  alt={show.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-6 left-6">
                  <span className="inline-block px-4 py-2 bg-[#d4633f] text-[#f5f5f5] text-xs uppercase tracking-widest">
                    {show.category}
                  </span>
                </div>

                {/* Listeners */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#0a0a0a]/80 px-3 py-2">
                  <Users className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-[#f5f5f5] text-xs">{show.listeners}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 bg-[#1a1a1a]">
                <h3 className="text-[#f5f5f5] text-2xl mb-4 uppercase tracking-wide group-hover:text-[#d4633f] transition-colors">
                  {show.title}
                </h3>
                <p className="text-[#999999] mb-6 leading-relaxed">{show.description}</p>
                
                {/* Schedule Info */}
                <div className="space-y-3 mb-6 pb-6 border-b border-[#f5f5f5]/10">
                  <div className="flex items-center gap-3 text-[#999999] text-sm">
                    <Calendar className="w-4 h-4 text-[#d4633f]" />
                    <span className="uppercase tracking-wider">{show.schedule}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#999999] text-sm">
                    <Clock className="w-4 h-4 text-[#d4633f]" />
                    <span className="uppercase tracking-wider">{show.time}</span>
                  </div>
                </div>

                {/* Host */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[#999999] text-xs uppercase tracking-wider mb-1">HOST</div>
                    <div className="text-[#d4af37] uppercase tracking-wide">{show.host}</div>
                  </div>
                  <button className="px-6 py-3 bg-[#d4633f] text-[#f5f5f5] hover:bg-[#d4633f]/90 transition-all uppercase text-sm tracking-widest">
                    LISTEN
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredShows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#999999] text-lg uppercase tracking-wider">No shows in this category</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-24 border-2 border-[#d4633f] p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl text-[#f5f5f5] mb-4 uppercase">HAVE A SHOW IDEA?</h2>
          <div className="w-16 h-1 bg-[#d4af37] mx-auto mb-6" />
          <p className="text-[#999999] mb-8 max-w-2xl mx-auto">
            We're always looking for new voices and perspectives. Submit your show idea today.
          </p>
          <button className="px-8 py-4 bg-[#d4633f] text-[#f5f5f5] hover:bg-[#d4633f]/90 transition-all uppercase tracking-widest">
            SUBMIT IDEA
          </button>
        </div>
      </div>
    </div>
  );
}
