import { useEffect, useState } from 'react';
import ContentTable from '../components/ContentTable';
import ContentModal from '../components/ContentModal';
import FileUploader from '../components/FileUploader';
import * as api from '../services/api';
import './AdminShowsPage.css';

interface Show {
  id: number;
  title: string;
  slug: string;
  description: string;
  host_name: string;
  category: string;
  broadcast_schedule: string;
  is_active: boolean;
  image_url?: string;
  thumbnail_url?: string;
  episode_count?: number;
  created_at: string;
  updated_at: string;
}

export default function AdminShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    host_name: '',
    category: '',
    broadcast_schedule: '',
    is_active: true,
    image_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    fetchShows();
  }, [searchTerm, statusFilter, page]);

  const fetchShows = async () => {
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
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';

      const response = await api.getAdminShows(params);
      setShows(response.shows || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load shows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingShow(null);
    setFormData({
      title: '',
      description: '',
      host_name: '',
      category: '',
      broadcast_schedule: '',
      is_active: true,
      image_url: '',
      thumbnail_url: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (show: Show) => {
    setEditingShow(show);
    setFormData({
      title: show.title,
      description: show.description,
      host_name: show.host_name,
      category: show.category,
      broadcast_schedule: show.broadcast_schedule,
      is_active: show.is_active,
      image_url: show.image_url || '',
      thumbnail_url: show.thumbnail_url || ''
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

      if (editingShow) {
        await api.updateShow(editingShow.id, data);
      } else {
        await api.createShow(data);
      }

      setIsModalOpen(false);
      fetchShows();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save show');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string, episodeCount?: number) => {
    if (episodeCount && episodeCount > 0) {
      alert(`Cannot delete "${title}" because it has ${episodeCount} episode${episodeCount > 1 ? 's' : ''}. Please delete the episodes first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.deleteShow(id);
      fetchShows();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete show';
      if (err.response?.data?.episode_count) {
        alert(`Cannot delete "${title}" because it has ${err.response.data.episode_count} episode(s). Please delete the episodes first.`);
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleImageUpload = (fileData: any) => {
    setFormData({
      ...formData,
      image_url: fileData.url || fileData.cdnUrl,
      thumbnail_url: fileData.thumbnailUrl || fileData.url || fileData.cdnUrl
    });
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'host_name', label: 'Host', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'broadcast_schedule', label: 'Schedule', sortable: false },
    { 
      key: 'episode_count', 
      label: 'Episodes', 
      sortable: true,
      render: (show: Show) => show.episode_count || 0
    },
    { 
      key: 'is_active', 
      label: 'Status', 
      sortable: true,
      render: (show: Show) => (
        <span className={`status-badge ${show.is_active ? 'active' : 'inactive'}`}>
          {show.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (show: Show) => new Date(show.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (show: Show) => (
        <div className="action-buttons">
          <button onClick={() => handleEdit(show)} className="btn-edit">Edit</button>
          <button 
            onClick={() => handleDelete(show.id, show.title, show.episode_count)} 
            className="btn-delete"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-shows-page">
      <div className="page-header">
        <h1>Manage Shows</h1>
        <button onClick={handleCreate} className="btn-primary">+ Create Show</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search shows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <ContentTable
        columns={columns}
        data={shows}
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
        title={editingShow ? 'Edit Show' : 'Create Show'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="show-form">
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
            <label>Host Name *</label>
            <input
              type="text"
              value={formData.host_name}
              onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Broadcast Schedule *</label>
              <input
                type="text"
                value={formData.broadcast_schedule}
                onChange={(e) => setFormData({ ...formData, broadcast_schedule: e.target.value })}
                placeholder="e.g., Mondays 8PM"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              {' '}Active
            </label>
          </div>

          <div className="form-group">
            <label>Cover Image</label>
            <FileUploader
              accept="image/*"
              onUploadComplete={handleImageUpload}
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
              {loading ? 'Saving...' : editingShow ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </ContentModal>
    </div>
  );
}
