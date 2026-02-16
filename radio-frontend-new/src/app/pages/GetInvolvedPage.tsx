import React from 'react';
import { Users, Mic, Heart, MessageCircle } from 'lucide-react';

export function GetInvolvedPage() {
  const ways = [
    {
      icon: MessageCircle,
      title: 'Join the Conversation',
      description: 'Share your stories, perspectives, and ideas. Call in during live shows or submit your voice messages.',
      action: 'Share Your Voice',
    },
    {
      icon: Mic,
      title: 'Become a Contributor',
      description: 'Have a story to tell? We welcome community contributors, guest speakers, and storytellers.',
      action: 'Apply Now',
    },
    {
      icon: Heart,
      title: 'Support Our Mission',
      description: 'Help us continue broadcasting truth and justice. Your support keeps our voices strong.',
      action: 'Support Us',
    },
    {
      icon: Users,
      title: 'Volunteer',
      description: 'Join our team of passionate volunteers helping to amplify voices and build community.',
      action: 'Get Started',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#f5f5f5] mb-6">Get Involved</h1>
          <p className="text-lg text-[#999999]">
            Be part of the movement amplifying truth, courage, and community. Your voice matters.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          {ways.map((way) => {
            const Icon = way.icon;
            return (
              <div
                key={way.title}
                className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8 hover:border-[#d4633f]/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-[#d4633f]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#d4633f]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#d4633f]" />
                </div>
                <h3 className="text-[#f5f5f5] text-xl mb-3">{way.title}</h3>
                <p className="text-[#999999] mb-6">{way.description}</p>
                <button className="w-full px-6 py-3 bg-[#d4633f]/10 border border-[#d4633f]/30 text-[#d4633f] rounded-lg hover:bg-[#d4633f]/20 transition-all duration-300">
                  {way.action}
                </button>
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8 md:p-12">
          <h2 className="text-3xl text-[#f5f5f5] mb-6 text-center">Get in Touch</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-[#f5f5f5] mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-[#f5f5f5] mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-[#f5f5f5] mb-2">How would you like to get involved?</label>
              <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors">
                <option>Join the conversation</option>
                <option>Become a contributor</option>
                <option>Support our mission</option>
                <option>Volunteer</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[#f5f5f5] mb-2">Message</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors resize-none"
                placeholder="Tell us more about your interest..."
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-4 bg-gradient-to-r from-[#d4633f] to-[#d4633f]/80 hover:from-[#d4633f]/90 hover:to-[#d4633f]/70 text-[#f5f5f5] rounded-lg transition-all duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
