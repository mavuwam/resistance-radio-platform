import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './NewsPage.css';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;  // Changed from summary
  content: string;
  category: string;
  author_name: string;  // Changed from author
  published_at: string;
  featured_image_url?: string;  // Changed from image_url
}

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: 'all', label: 'All' }
  ]);

  useEffect(() => {
    fetchArticles();
  }, [sortOrder]);

  useEffect(() => {
    filterArticles();
  }, [articles, selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/articles?limit=50&sort=published_at&order=${sortOrder}`);
      const responseData = await response.json();
      
      const articlesArray = responseData.articles || [];
      setArticles(articlesArray);
      
      // Build dynamic category list from articles
      const uniqueCategories: string[] = Array.from(new Set(articlesArray.map((a: Article) => a.category)));
      const categoryOptions: Array<{ value: string; label: string }> = [
        { value: 'all', label: 'All' },
        ...uniqueCategories.map((cat: string) => ({
          value: cat,
          label: cat.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }))
      ];
      setCategories(categoryOptions);
    } catch (error) {
      console.error('[NewsPage] Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    if (selectedCategory === 'all') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article => article.category === selectedCategory);
      setFilteredArticles(filtered);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);

  return (
    <div className="news-page">
      <SEO
        title="News & Insights"
        description="Short, accessible reflections on the issues shaping our civic life. Stay informed with news and analysis from Resistance Radio."
        keywords={['news', 'zimbabwe news', 'civic insights', 'analysis', 'commentary']}
        url="/news"
      />
      <div className="container">
        <h1>News & Insights</h1>
        <p className="intro">
          Short, accessible reflections on the issues shaping our civic life.
        </p>
        
        {loading ? (
          <div className="loading">Loading articles...</div>
        ) : (
          <>
            {featuredArticle && (
              <section className="featured-section">
                <div className="featured-label">Featured Article</div>
                <Link to={`/news/${featuredArticle.slug}`} className="featured-article">
                  {featuredArticle.featured_image_url && (
                    <div className="featured-image">
                      <img src={featuredArticle.featured_image_url} alt={featuredArticle.title} />
                    </div>
                  )}
                  <div className="featured-content">
                    <span className="article-category">{categories.find(c => c.value === featuredArticle.category)?.label || featuredArticle.category}</span>
                    <h2>{featuredArticle.title}</h2>
                    <p className="article-summary">{featuredArticle.excerpt}</p>
                    <div className="article-meta">
                      <span className="author">By {featuredArticle.author_name}</span>
                      <span className="date">{formatDate(featuredArticle.published_at)}</span>
                    </div>
                  </div>
                </Link>
              </section>
            )}
            
            <section className="content-controls">
              <div className="type-filter">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              
              <div className="sort-controls">
                <button
                  className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                  onClick={() => setSortOrder('desc')}
                >
                  Newest First
                </button>
                <button
                  className={`sort-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                  onClick={() => setSortOrder('asc')}
                >
                  Oldest First
                </button>
              </div>
            </section>
            
            {regularArticles.length === 0 ? (
              <div className="no-articles">
                {selectedCategory !== 'all' 
                  ? 'No articles found in this category.' 
                  : 'No articles available yet.'}
              </div>
            ) : (
              <div className="articles-grid">
                {regularArticles.map((article) => (
                  <Link 
                    key={article.id} 
                    to={`/news/${article.slug}`} 
                    className="article-card"
                  >
                    {article.featured_image_url && (
                      <div className="article-image">
                        <img src={article.featured_image_url} alt={article.title} />
                      </div>
                    )}
                    <div className="article-content">
                      <span className="article-category">{categories.find(c => c.value === article.category)?.label || article.category}</span>
                      <h3>{article.title}</h3>
                      <p className="article-summary">{article.excerpt}</p>
                      <div className="article-meta">
                        <span className="author">By {article.author_name}</span>
                        <span className="date">{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
