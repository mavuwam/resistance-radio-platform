import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

export function EventsPage() {
  const upcomingEvents = [
    {
      title: 'Community Listening Session',
      description: 'Join us for an open dialogue on justice and accountability. Share your voice and hear from community leaders.',
      date: 'February 20, 2026',
      time: '6:00 PM - 8:00 PM',
      location: 'Virtual Event (Zoom)',
      type: 'Community',
    },
    {
      title: 'Youth Voices Summit',
      description: 'A gathering of young activists and leaders discussing the future of Zimbabwe and strategies for change.',
      date: 'March 5, 2026',
      time: '10:00 AM - 4:00 PM',
      location: 'Harare Community Center',
      type: 'Youth',
    },
    {
      title: 'Diaspora Connect',
      description: 'Connecting Zimbabweans worldwide through culture, conversation, and community building.',
      date: 'March 15, 2026',
      time: '7:00 PM - 9:00 PM',
      location: 'Virtual Event (Zoom)',
      type: 'Diaspora',
    },
  ];

  const pastEvents = [
    {
      title: 'Truth & Justice Forum',
      date: 'January 18, 2026',
      description: 'A powerful discussion on accountability and transparency featuring activists and journalists.',
    },
    {
      title: 'Cultural Celebration Night',
      date: 'December 10, 2025',
      description: 'Celebrating Zimbabwean culture through music, art, and storytelling.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#f5f5f5] mb-6">Events</h1>
          <p className="text-lg text-[#999999]">
            Join us for conversations, gatherings, and community-building events.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl text-[#f5f5f5] mb-8">Upcoming Events</h2>
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.title}
                className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-6 md:p-8 hover:border-[#d4633f]/50 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 bg-[#d4633f]/10 text-[#d4633f] text-xs rounded-full mb-3">
                      {event.type}
                    </div>
                    <h3 className="text-[#f5f5f5] text-2xl mb-3">{event.title}</h3>
                    <p className="text-[#999999] mb-4">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#999999]">
                        <Calendar className="w-4 h-4 text-[#d4633f]" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#999999]">
                        <Clock className="w-4 h-4 text-[#d4633f]" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#999999]">
                        <MapPin className="w-4 h-4 text-[#d4633f]" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-[#d4633f] to-[#d4633f]/80 hover:from-[#d4633f]/90 hover:to-[#d4633f]/70 text-[#f5f5f5] rounded-lg transition-all duration-300">
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl text-[#f5f5f5] mb-8">Past Events</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pastEvents.map((event) => (
              <div
                key={event.title}
                className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 text-[#999999] text-sm mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <h3 className="text-[#f5f5f5] mb-2">{event.title}</h3>
                <p className="text-[#999999] text-sm">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
