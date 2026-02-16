import React from 'react';
import { FileText, Download, BookOpen } from 'lucide-react';

export function ResourcesPage() {
  const resources = [
    {
      category: 'Community Guides',
      items: [
        { title: 'Activism & Organizing Guide', type: 'PDF' },
        { title: 'Digital Security Handbook', type: 'PDF' },
        { title: 'Community Building Toolkit', type: 'PDF' },
      ],
    },
    {
      category: 'Reports & Analysis',
      items: [
        { title: 'State of Justice 2026 Report', type: 'PDF' },
        { title: 'Economic Justice Analysis', type: 'PDF' },
        { title: 'Youth Voices Survey Results', type: 'PDF' },
      ],
    },
    {
      category: 'Educational Materials',
      items: [
        { title: 'Media Literacy Guide', type: 'PDF' },
        { title: 'Know Your Rights Handbook', type: 'PDF' },
        { title: 'Community Radio Guide', type: 'PDF' },
      ],
    },
  ];

  const externalLinks = [
    {
      title: 'Human Rights Organizations',
      links: ['Amnesty International Zimbabwe', 'Zimbabwe Human Rights NGO Forum', 'Zimbabwe Lawyers for Human Rights'],
    },
    {
      title: 'News & Media',
      links: ['Zimbabwe Independent', 'NewZimbabwe.com', 'The Standard'],
    },
    {
      title: 'Community Resources',
      links: ['Legal Aid Directorate', 'Community Support Services', 'Youth Empowerment Network'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#f5f5f5] mb-6">Resources</h1>
          <p className="text-lg text-[#999999]">
            Educational materials, guides, and links to support community action and awareness.
          </p>
        </div>

        {/* Downloadable Resources */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl text-[#f5f5f5] mb-8">Downloadable Resources</h2>
          <div className="space-y-8">
            {resources.map((section) => (
              <div key={section.category}>
                <h3 className="text-[#f5f5f5] mb-4">{section.category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item) => (
                    <div
                      key={item.title}
                      className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-lg p-6 hover:border-[#d4633f]/50 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#d4633f]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#d4633f]/20 transition-colors">
                          <FileText className="w-5 h-5 text-[#d4633f]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#f5f5f5] text-sm mb-1 group-hover:text-[#d4633f] transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[#999999] text-xs">{item.type}</span>
                        </div>
                        <Download className="w-4 h-4 text-[#999999] group-hover:text-[#d4633f] transition-colors flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* External Links */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl text-[#f5f5f5] mb-8">Useful Links</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {externalLinks.map((section) => (
              <div key={section.title} className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-6">
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 text-[#d4af37]" />
                </div>
                <h3 className="text-[#f5f5f5] mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[#999999] hover:text-[#d4633f] text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
