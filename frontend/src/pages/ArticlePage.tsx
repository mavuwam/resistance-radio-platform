import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug, getArticles } from '../services/api';
import SEO from '../components/SEO';
import { generateArticleSchema } from '../utils/schema';
import './ArticlePage.css';

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  published_at: string;
  updated_at?: string;
  image_url?: string;
}

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const articleData = await getArticleBySlug(slug!);
      setArticle(articleData);
      
      // Fetch related articles from the same category
      const relatedData = await getArticles({ 
        category: articleData.category, 
        limit: 3 
      });
      setRelatedArticles(relatedData.filter((a: Article) => a.id !== articleData.id).slice(0, 3));
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
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

  const handleShare = (platform: string) => {
    if (!article) return;
    
    const url = window.location.href;
    const title = article.title;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="article-page">
        <div className="container">
          <div className="loading">Loading article...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page">
        <div className="container">
          <div className="error">Article not found</div>
          <Link to="/news" className="btn">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <SEO
        title={article.title}
        description={article.summary}
        type="article"
        image={article.image_url}
        url={`/news/${article.slug}`}
        author={article.author}
        publishedTime={article.published_at}
        modifiedTime={article.updated_at}
        keywords={[article.category, 'news', 'zimbabwe', 'resistance radio']}
        schema={generateArticleSchema({
          title: article.title,
          content: article.content,
          slug: article.slug,
          author: article.author,
          published_at: article.published_at,
          updated_at: article.updated_at,
          image_url: article.image_url,
          category: article.category
        })}
      />
      <div className="container">
        <Link to="/news" className="back-link">← Back to News</Link>
        
        <article className="article-content">
          <header className="article-header">
            <span className="article-category">{article.category.replace('_', ' ')}</span>
            <h1>{article.title}</h1>
            <div className="article-meta">
              <span className="author">By {article.author}</span>
              <span className="date">{formatDate(article.published_at)}</span>
            </div>
            <p className="article-summary">{article.summary}</p>
          </header>

          {article.image_url && (
            <div className="article-image">
              <img src={article.image_url} alt={article.title} />
            </div>
          )}

          <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

          <div className="article-footer">
            <div className="share-section">
              <h3>Share this article</h3>
              <div className="share-buttons">
                <button 
                  className="share-btn twitter"
                  onClick={() => handleShare('twitter')}
                  aria-label="Share on Twitter"
                >
                  Twitter
                </button>
                <button 
                  className="share-btn facebook"
                  onClick={() => handleShare('facebook')}
                  aria-label="Share on Facebook"
                >
                  Facebook
                </button>
                <button 
                  className="share-btn whatsapp"
                  onClick={() => handleShare('whatsapp')}
                  aria-label="Share on WhatsApp"
                >
                  WhatsApp
                </button>
                <button 
                  className="share-btn email"
                  onClick={() => handleShare('email')}
                  aria-label="Share via Email"
                >
                  Email
                </button>
              </div>
            </div>
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="related-articles">
            <h2>Related Articles</h2>
            <div className="related-grid">
              {relatedArticles.map((related) => (
                <Link 
                  key={related.id} 
                  to={`/news/${related.slug}`} 
                  className="related-card"
                >
                  {related.image_url && (
                    <div className="related-image">
                      <img src={related.image_url} alt={related.title} />
                    </div>
                  )}
                  <div className="related-content">
                    <h3>{related.title}</h3>
                    <p className="related-date">{formatDate(related.published_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;
