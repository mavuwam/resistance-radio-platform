import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

const footerLinks = {
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Our Shows', path: '/shows' },
    { name: 'News & Insights', path: '/news' },
    { name: 'Events', path: '/events' },
  ],
  community: [
    { name: 'Get Involved', path: '/get-involved' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Listen Live', path: '/listen' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Use', path: '/terms' },
    { name: 'Ethical Principles', path: '/ethical-principles' },
    { name: 'Safeguarding', path: '/safeguarding' },
  ],
};

const socialLinks = [
  { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, url: 'https://youtube.com', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#d4af37]/20 relative overflow-hidden">
      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      
      {/* Newsletter Section */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] py-16 relative">
        {/* Gold corner decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#d4af37]/5 to-transparent rounded-bl-full" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4">
              <div className="px-4 py-2 bg-gradient-to-r from-[#d4af37]/10 to-[#d4633f]/10 border border-[#d4af37]/20 rounded-full">
                <span className="text-[#d4af37] text-sm uppercase tracking-wider">Newsletter</span>
              </div>
            </div>
            <h3 className="text-3xl text-[#f5f5f5] mb-4 font-light">Stay Informed</h3>
            <p className="text-[#d4af37]/70 mb-8">
              Get weekly updates on our latest shows, events, and community stories
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-[#0a0a0a] border border-[#d4af37]/20 text-[#f5f5f5] rounded-full focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 placeholder:text-[#999999] transition-all"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-[#d4633f] to-[#d4633f]/90 text-[#f5f5f5] rounded-full hover:from-[#d4633f]/90 hover:to-[#d4633f]/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#d4af37]/30 inline-flex items-center justify-center gap-2 font-medium">
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <Radio className="h-12 w-12 text-[#d4af37]" />
              <span className="text-2xl font-bold text-white">Resistance Radio</span>
            </Link>
            <p className="text-[#999999] mb-8 leading-relaxed">
              Amplifying voices of truth, courage, and justice across Zimbabwe and the diaspora.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-[#999999]">
                <MapPin className="w-4 h-4 text-[#d4633f]" />
                <span>Harare, Zimbabwe</span>
              </div>
              <div className="flex items-center gap-3 text-[#999999]">
                <Mail className="w-4 h-4 text-[#d4633f]" />
                <span>contact@resistanceradiostation.org</span>
              </div>
              <div className="flex items-center gap-3 text-[#999999]">
                <Phone className="w-4 h-4 text-[#d4633f]" />
                <span>+263 (0) XX XXX XXXX</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#f5f5f5]/10 flex items-center justify-center text-[#999999] hover:text-[#d4633f] hover:border-[#d4633f] hover:scale-110 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[#f5f5f5] font-medium mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#999999] hover:text-[#d4633f] transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#d4633f] transition-all duration-300" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="text-[#f5f5f5] font-medium mb-6">Community</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#999999] hover:text-[#d4633f] transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#d4633f] transition-all duration-300" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-[#f5f5f5] font-medium mb-6">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#999999] hover:text-[#d4633f] transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#d4633f] transition-all duration-300" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#f5f5f5]/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#999999] text-sm text-center md:text-left">
              © 2026 Resistance Radio. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-full">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4633f] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4633f]"></span>
                </div>
                <span className="text-[#d4633f] text-sm font-medium">Broadcasting 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}