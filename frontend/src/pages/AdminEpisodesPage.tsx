import { useEffect, useState } from 'react';
import ContentTable from '../components/ContentTable';
import ContentModal from '../components/ContentModal';
import RichTextEditor from '../components/RichTextEditor';
import FileUploader from '../components/FileUploader';
import * as api from '../services/api';
import './AdminEpisodesPage.css';

interface Episode {
  id: number;
  show_id: number;
  show_title?: string;
  title: string;
  slug: string;
  description: string;
  episode_number?: number;
  audio_url: string;
  duration?: string;
  published_at?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

interface Show {
  id: number;
  title: string;
}

export default function AdminEpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [formData, setFormData] = useState({
    show_id: 0,
    title: '',
    description: '',
    episode_number: '',
    audio_url: '',
    duration: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    fetchShows();
    fetchEpisodes();
  }, [searchTerm, showFilter, page]);

  const fetchShows = async () => {
    try {
      const response = await api.getShows();
      setShows(response || []);
    } catch (err) {
      console.error('Failed to load shows:', err);
    }
  };

  const fetchEpisodes = async () => {
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
      if (showFilter !== 'all') params.show_id = parseInt(showFilter);

      const response = await api.getAdminEpisodes(params);
      setEpisodes(response.episodes || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEpisode(null);
    setFormData({
      show_id: 0,
      title: '',
      description: '',
      episode_number: '',
      audio_url: '',
      duration: '',
      thumbnail_url: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setFormData({
      show_id: episode.show_id,
      title: episode.title,
      description: episode.description,
      episode_number: episode.episode_number?.toString() || '',
      audio_url: episode.audio_url,
      duration: episode.duration || '',
      thumbnail_url: episode.thumbnail_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const data = {
        ...formData,
        slug,
        episode_number: formData.episode_number ? parseInt(formData.episode_number) : undefined
      };

      if (editingEpisode) {
        await api.updateEpisode(editingEpisode.id, data);
      } else {
        await api.createEpisode(data);
      }

      setIsModalOpen(false);
      fetchEpisodes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save episode');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this episode?')) return;

    try {
      await api.deleteEpisode(id);
      fetchEpisodes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete episode');
    }
  };

  const handleAudioUpload = (fileData: any) => {
    setFormData({
      ...formData,
      audio_url: fileData.url || fileData.cdnUrl
    });
  };

  const handleThumbnailUpload = (fileData: any) => {
    setFormData({
      ...formData,
      thumbnail_url: fileData.url || fileData.cdnUrl
    });
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'show_title', label: 'Show', sortable: true },
    { key: 'episode_number', label: 'Episode #', sortable: true },
    { key: 'duration', label: 'Duration', sortable: false },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (episode: Episode) => new Date(episode.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (episode: Episode) => (
        <div className="action-buttons">
          <button onClick={() => handleEdit(episode)} className="btn-edit">Edit</button>
          <a href={episode.audio_url} target="_blank" rel="noopener noreferrer" className="btn-play">
            Play
          </a>
          <button onClick={() => handleDelete(episode.id)} className="btn-delete">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-episodes-page">
      <div className="page-header">
        <h1>Manage Episodes</h1>
        <button onClick={handleCreate} className="btn-primary">+ Create Episode</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search episodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={showFilter} onChange={(e) => setShowFilter(e.target.value)}>
          <option value="all">All Shows</option>
          {shows.map(show => (
            <option key={show.id} value={show.id}>{show.title}</option>
          ))}
        </select>
      </div>

      <ContentTable
        columns={columns}
        data={episodes}
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
        title={editingEpisode ? 'Edit Episode' : 'Create Episode'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="episode-form">
          <div className="form-group">
            <label>Show *</label>
            <select
              value={formData.show_id}
              onChange={(e) => setFormData({ ...formData, show_id: parseInt(e.target.value) })}
              required
            >
              <option value={0}>Select a show</option>
              {shows.map(show => (
                <option key={show.id} value={show.id}>{show.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Episode Number</label>
              <input
                type="number"
                value={formData.episode_number}
                onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 45:30"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
            />
          </div>

          <div className="form-group">
            <label>Audio File *</label>
            <FileUploader
              accept="audio/*"
              onUploadComplete={handleAudioUpload}
              maxSize={100 * 1024 * 1024}
              type="audio"
            />
            {formData.audio_url && (
              <div className="audio-preview">
                <audio controls src={formData.audio_url} style={{ width: '100%', marginTop: '1rem' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Thumbnail Image</label>
            <FileUploader
              accept="image/*"
              onUploadComplete={handleThumbnailUpload}
              maxSize={5 * 1024 * 1024}
              type="image"
            />
            {formData.thumbnail_url && (
              <div className="image-preview">
                <img src={formData.thumbnail_url} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : editingEpisode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </ContentModal>
    </div>
  );
}
