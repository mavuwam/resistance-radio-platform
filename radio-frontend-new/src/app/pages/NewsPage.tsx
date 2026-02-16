import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

export function NewsPage() {
  const articles = [
    {
      title: 'Community Voices: Grassroots Movements Gain Momentum',
      excerpt: 'Local activists report growing support for accountability measures across multiple provinces.',
      date: 'February 10, 2026',
      category: 'Community',
    },
    {
      title: 'Economic Justice: New Analysis on Income Inequality',
      excerpt: 'Recent data reveals widening gaps, prompting calls for systemic reform.',
      date: 'February 8, 2026',
      category: 'Analysis',
    },
    {
      title: 'Diaspora Connections: Strengthening Ties Across Borders',
      excerpt: 'How Zimbabweans abroad are maintaining cultural connections and supporting change at home.',
      date: 'February 5, 2026',
      category: 'Culture',
    },
    {
      title: 'Youth Leadership: Rising Voices Demand Action',
      excerpt: 'Young activists organize nationwide conversations on climate and social justice.',
      date: 'February 3, 2026',
      category: 'Youth',
    },
    {
      title: 'Truth & Accountability: Investigating Power Structures',
      excerpt: 'Our investigative team uncovers new findings in ongoing accountability efforts.',
      date: 'January 30, 2026',
      category: 'Investigation',
    },
    {
      title: 'Community Resilience: Stories of Hope and Strength',
      excerpt: 'Local communities demonstrate remarkable resilience in face of ongoing challenges.',
      date: 'January 28, 2026',
      category: 'Community',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#f5f5f5] mb-6">News & Insights</h1>
          <p className="text-lg text-[#999999]">
            In-depth reporting and analysis on issues affecting Zimbabwe and its diaspora.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {articles.map((article) => (
            <article
              key={article.title}
              className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-6 md:p-8 hover:border-[#d4633f]/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block px-3 py-1 bg-[#d4633f]/10 text-[#d4633f] text-xs rounded-full">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-2 text-[#999999] text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <h2 className="text-[#f5f5f5] text-xl mb-2 group-hover:text-[#d4633f] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-[#999999] mb-4">{article.excerpt}</p>
                  <button className="inline-flex items-center gap-2 text-[#d4633f] hover:text-[#d4af37] transition-colors text-sm">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-[#d4633f] to-[#d4633f]/80 rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl text-[#f5f5f5] mb-4">Stay Informed</h2>
            <p className="text-[#f5f5f5]/90 mb-6">
              Subscribe to our newsletter for weekly insights and updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-[#f5f5f5] text-[#0a0a0a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
              <button className="px-6 py-3 bg-[#d4af37] text-[#0a0a0a] rounded-lg hover:bg-[#d4af37]/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
