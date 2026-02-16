import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#f5f5f5] mb-6">Contact Us</h1>
          <p className="text-lg text-[#999999]">
            Have a question, story to share, or want to get involved? We'd love to hear from you.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8">
            <h2 className="text-2xl text-[#f5f5f5] mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-[#f5f5f5] mb-2">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[#f5f5f5] mb-2">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[#f5f5f5] mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors"
                  placeholder="+263 ..."
                />
              </div>
              <div>
                <label className="block text-[#f5f5f5] mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors"
                  placeholder="What is this about?"
                />
              </div>
              <div>
                <label className="block text-[#f5f5f5] mb-2">Message *</label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#f5f5f5]/10 rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#d4633f] transition-colors resize-none"
                  placeholder="Tell us more..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-[#d4633f] to-[#d4633f]/80 hover:from-[#d4633f]/90 hover:to-[#d4633f]/70 text-[#f5f5f5] rounded-lg transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#d4633f]/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#d4633f]" />
              </div>
              <h3 className="text-[#f5f5f5] mb-2">Email</h3>
              <p className="text-[#999999]">contact@resistanceradiostation.org</p>
              <p className="text-[#999999]">news@resistanceradiostation.org</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#d4633f]/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#d4633f]" />
              </div>
              <h3 className="text-[#f5f5f5] mb-2">Phone</h3>
              <p className="text-[#999999]">+263 (0) XX XXX XXXX</p>
              <p className="text-[#999999] text-sm mt-2">Mon-Fri: 9:00 AM - 5:00 PM CAT</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#d4633f]/10 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#d4633f]" />
              </div>
              <h3 className="text-[#f5f5f5] mb-2">Location</h3>
              <p className="text-[#999999]">Harare, Zimbabwe</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#d4af37]" />
              </div>
              <h3 className="text-[#f5f5f5] mb-2">Share Your Story</h3>
              <p className="text-[#999999] mb-3">
                Have a story that needs to be heard? We're always looking for voices from the community.
              </p>
              <a href="#" className="text-[#d4633f] hover:text-[#d4af37] transition-colors text-sm">
                Submit Your Story →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}