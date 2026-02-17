import React, { useState, useEffect } from 'react';
import { getResources } from '../services/api';
import SEO from '../components/SEO';
import './ResourcesPage.css';

interface Resource {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  resource_type: string;
  file_url?: string;
  external_url?: string;
  file_size_bytes?: number | string;
}

const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'constitutional_explainer', label: 'Constitutional Explainers' },
    { value: 'debate_toolkit', label: 'Debate Toolkits' },
    { value: 'citizen_rights', label: 'Citizen Rights' },
    { value: 'audio_clips', label: 'Audio Clips' },
    { value: 'educational_material', label: 'Educational Materials' },
    { value: 'press_kit', label: 'Press & Media' },
  ];

  const resourceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'audio', label: 'Audio Files' },
    { value: 'video', label: 'Video Files' },
    { value: 'link', label: 'External Links' },
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, selectedCategory, selectedType, searchQuery]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await getResources({ limit: 100 });
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => 
        resource.resource_type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query)
      );
    }

    setFilteredResources(filtered);
  };

  const handleDownload = (resource: Resource) => {
    if (resource.file_url) {
      window.open(resource.file_url, '_blank');
    } else if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    }
  };

  const handleViewCollection = (category: string) => {
    setSelectedCategory(category);
    setSelectedType('all');
    setSearchQuery('');
    // Scroll to resources grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getResourceIcon = (type: string): string => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'pdf':
        return '📄';
      case 'audio':
        return '🎵';
      case 'video':
        return '🎥';
      case 'link':
        return '🔗';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes?: number | string): string => {
    if (!bytes) return '';
    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    const mb = numBytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }
    const kb = numBytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  return (
    <div className="resources-page">
      <SEO
        title="Resources"
        description="Access our library of civic education materials, toolkits, and guides. Empowering citizens with knowledge and resources for positive change."
        keywords={['resources', 'civic education', 'toolkits', 'guides', 'downloads']}
        url="/resources"
      />
      <div className="container">
        <h1>Resources</h1>
        <p className="intro">
          Access civic education materials, constitutional guides, and downloadable resources.
        </p>

        <div className="resources-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading resources...</div>
        ) : filteredResources.length === 0 ? (
          <div className="no-resources">
            {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
              ? 'No resources found matching your criteria.'
              : 'No resources available yet.'}
          </div>
        ) : (
          <div className="resources-grid">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="resource-card">
                <div className="resource-icon">
                  {getResourceIcon(resource.resource_type)}
                </div>
                <div className="resource-content">
                  <div className="resource-header">
                    <span className="resource-category">
                      {categories.find(c => c.value === resource.category)?.label || resource.category}
                    </span>
                    <span className="resource-type">
                      {resourceTypes.find(t => t.value === resource.resource_type)?.label || resource.resource_type}
                    </span>
                  </div>
                  <h3>{resource.title}</h3>
                  <p className="resource-description">{resource.description}</p>
                  {resource.file_size_bytes && (
                    <span className="file-size">{formatFileSize(resource.file_size_bytes)}</span>
                  )}
                  <button
                    className="btn btn-small"
                    onClick={() => handleDownload(resource)}
                  >
                    {resource.resource_type === 'link' ? 'Visit Link' : 'Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="featured-resources">
          <h2>Featured Collections</h2>
          <div className="collections-grid">
            <div className="collection-card">
              <h3>Constitutional Literacy Pack</h3>
              <p>Complete guide to understanding your constitutional rights and civic responsibilities</p>
              <ul>
                <li>Zimbabwe Constitution (Consolidated 2023)</li>
                <li>Bill of Rights explained</li>
                <li>Civic participation guide</li>
                <li>Electoral process overview</li>
              </ul>
              <button 
                className="btn btn-secondary"
                onClick={() => handleViewCollection('constitutional_explainer')}
              >
                View Collection
              </button>
            </div>

            <div className="collection-card">
              <h3>Educator's Toolkit</h3>
              <p>Resources for teachers and community educators</p>
              <ul>
                <li>Lesson plans</li>
                <li>Discussion guides</li>
                <li>Audio clips for classroom use</li>
              </ul>
              <button 
                className="btn btn-secondary"
                onClick={() => handleViewCollection('educational_material')}
              >
                View Collection
              </button>
            </div>

            <div className="collection-card">
              <h3>Media & Press Kit</h3>
              <p>Information and assets for media professionals</p>
              <ul>
                <li>Station information</li>
                <li>Logos and branding</li>
                <li>Press releases</li>
              </ul>
              <button 
                className="btn btn-secondary"
                onClick={() => handleViewCollection('press_kit')}
              >
                View Collection
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResourcesPage;
