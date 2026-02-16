import { useEffect, useState } from 'react';
import ContentTable from '../components/ContentTable';
import ContentModal from '../components/ContentModal';
import RichTextEditor from '../components/RichTextEditor';
import FileUploader from '../components/FileUploader';
import * as api from '../services/api';
import './AdminArticlesPage.css';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  category?: string;
  status: 'draft' | 'published';
  published_at?: string;
  image_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    status: 'draft' as 'draft' | 'published',
    image_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, statusFilter, categoryFilter, page]);

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        limit,
        offset: (page - 1) * limit,
        sort: 'created_at',
        order: 'DESC'
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const response = await api.getAdminArticles(params);
      setArticles(response.articles || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: '',
      category: '',
      status: 'draft',
      image_url: '',
      thumbnail_url: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      author: article.author,
      category: article.category || '',
      status: article.status,
      image_url: article.image_url || '',
      thumbnail_url: article.thumbnail_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const data = { ...formData, slug };

      if (editingArticle) {
        await api.updateArticle(editingArticle.id, data);
      } else {
        await api.createArticle(data);
      }

      setIsModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await api.deleteArticle(id);
      fetchArticles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete article');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await api.publishArticle(id);
      fetchArticles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to publish article');
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await api.unpublishArticle(id);
      fetchArticles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unpublish article');
    }
  };

  const handleBulkPublish = async () => {
    if (selectedRows.size === 0) return;
    
    try {
      await api.bulkPublishArticles(Array.from(selectedRows));
      setSelectedRows(new Set());
      fetchArticles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to publish articles');
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedRows.size === 0) return;
    
    try {
      await api.bulkUnpublishArticles(Array.from(selectedRows));
      setSelectedRows(new Set());
      fetchArticles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unpublish articles');
    }
  };

  const handleFileUpload = (fileData: any) => {
    setFormData({
      ...formData,
      image_url: fileData.url || fileData.cdnUrl,
      thumbnail_url: fileData.thumbnailUrl || fileData.url || fileData.cdnUrl
    });
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'author', label: 'Author', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (article: Article) => (
        <span className={`status-badge ${article.status}`}>
          {article.status}
        </span>
      )
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (article: Article) => new Date(article.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (article: Article) => (
        <div className="action-buttons">
          <button onClick={() => handleEdit(article)} className="btn-edit">Edit</button>
          {article.status === 'draft' ? (
            <button onClick={() => handlePublish(article.id)} className="btn-publish">Publish</button>
          ) : (
            <button onClick={() => handleUnpublish(article.id)} className="btn-unpublish">Unpublish</button>
          )}
          <button onClick={() => handleDelete(article.id)} className="btn-delete">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-articles-page">
      <div className="page-header">
        <h1>Manage Articles</h1>
        <button onClick={handleCreate} className="btn-primary">+ Create Article</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="news">News</option>
          <option value="opinion">Opinion</option>
          <option value="analysis">Analysis</option>
          <option value="feature">Feature</option>
        </select>
      </div>

      {selectedRows.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedRows.size} selected</span>
          <button onClick={handleBulkPublish} className="btn-publish">Publish Selected</button>
          <button onClick={handleBulkUnpublish} className="btn-unpublish">Unpublish Selected</button>
        </div>
      )}

      <ContentTable
        columns={columns}
        data={articles}
        loading={loading}
        selectedRows={selectedRows}
        onSelectRow={(row, selected) => {
          const newSelected = new Set(selectedRows);
          if (selected) {
            newSelected.add(row.id);
          } else {
            newSelected.delete(row.id);
          }
          setSelectedRows(newSelected);
        }}
        selectable={true}
        onRowClick={handleEdit}
      />

      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={page >= Math.ceil(total / limit)}
        >
          Next
        </button>
      </div>

      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? 'Edit Article' : 'Create Article'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="article-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Author *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select category</option>
                <option value="news">News</option>
                <option value="opinion">Opinion</option>
                <option value="analysis">Analysis</option>
                <option value="feature">Feature</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Brief summary of the article..."
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
            />
          </div>

          <div className="form-group">
            <label>Article Image</label>
            <FileUploader
              accept="image/*"
              onUploadComplete={handleFileUpload}
              maxSize={5 * 1024 * 1024}
              type="image"
            />
            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : editingArticle ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </ContentModal>
    </div>
  );
}
