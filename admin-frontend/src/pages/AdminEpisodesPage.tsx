import { useEffect, useState } from 'react';
import ContentTable from '../components/ContentTable';
import ContentModal from '../components/ContentModal';
import RichTextEditor from '../components/RichTextEditor';
import ErrorBoundary from '../components/ErrorBoundary';
import ConfirmDialog from '../components/ConfirmDialog';
import DraftRestoreDialog from '../components/DraftRestoreDialog';
import { Spinner } from '../components/Loading';
import { FileUploader } from 'shared';
import { getShows, getAdminEpisodes, createEpisode, updateEpisode, deleteEpisode } from 'shared/services/api';
import { useToastContext } from '../contexts/ToastContext';
import { useAutoSave } from '../hooks/useAutoSave';
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
  const { addToast } = useToastContext();
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

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Draft restore dialog state
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  const [formData, setFormData] = useState({
    show_id: 0,
    title: '',
    description: '',
    episode_number: '',
    audio_url: '',
    duration: '',
    thumbnail_url: ''
  });

  // Auto-save hook - only enabled when modal is open
  const { restoreDraft, clearDraft, hasDraft, getDraftTimestamp } = useAutoSave({
    formData,
    formId: 'admin-episodes-form',
    saveInterval: 30000,
    enabled: isModalOpen
  });

  useEffect(() => {
    fetchShows();
    fetchEpisodes();
  }, [searchTerm, showFilter, page]);

  const fetchShows = async () => {
    try {
      const response = await getShows();
      setShows(response || []);
    } catch (err: any) {
      const errorMessage = 'Failed to load shows';
      console.error('Failed to fetch shows:', err);
      addToast('error', errorMessage);
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

      const response = await getAdminEpisodes(params);
      setEpisodes(response.episodes || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load episodes';
      setError(errorMessage);
      addToast('error', errorMessage);
      console.error('Failed to fetch episodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEpisode(null);
    const initialFormData = {
      show_id: 0,
      title: '',
      description: '',
      episode_number: '',
      audio_url: '',
      duration: '',
      thumbnail_url: ''
    };
    setFormData(initialFormData);
    setIsModalOpen(true);

    // Check for draft after modal opens
    setTimeout(() => {
      if (hasDraft()) {
        setShowDraftDialog(true);
      }
    }, 100);
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
    
    // Clear any existing draft when editing
    clearDraft();
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
        await updateEpisode(editingEpisode.id, data);
        addToast('success', `Episode "${formData.title}" updated successfully`);
      } else {
        await createEpisode(data);
        addToast('success', `Episode "${formData.title}" created successfully`);
      }

      // Clear draft after successful submission
      clearDraft();

      setIsModalOpen(false);
      fetchEpisodes();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to save episode';
      setError(errorMessage);
      addToast('error', errorMessage);
      console.error('Failed to save episode:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number, title: string) => {
    setEpisodeToDelete({ id, title });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!episodeToDelete) return;

    const { id, title } = episodeToDelete;
    
    // Store reference for potential rollback
    const deletedItem = episodes.find(e => e.id === id);
    if (!deletedItem) return;
    const deletedItemIndex = episodes.findIndex(e => e.id === id);

    setIsDeleting(true);

    // OPTIMISTIC UPDATE: Remove from UI immediately
    setEpisodes(prevEpisodes => prevEpisodes.filter(e => e.id !== id));
    setTotal(prevTotal => prevTotal - 1);

    try {
      // Backend deletion proceeds asynchronously
      await deleteEpisode(id);
      
      // Success: Show confirmation toast
      addToast('success', `Episode "${title}" deleted successfully`);
      setShowConfirmDialog(false);
      setEpisodeToDelete(null);
    } catch (err: any) {
      // ROLLBACK: Restore item to original position
      setEpisodes(prevEpisodes => {
        const restored = [...prevEpisodes];
        restored.splice(deletedItemIndex, 0, deletedItem);
        return restored;
      });
      setTotal(prevTotal => prevTotal + 1);
      
      // Show error notification
      const errorMessage = err.response?.data?.error || 'Failed to delete episode';
      addToast('error', errorMessage);
      console.error('Failed to delete episode:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setEpisodeToDelete(null);
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

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      setFormData(draft);
      addToast('info', 'Draft restored successfully');
    }
    setShowDraftDialog(false);
  };

  const handleStartFresh = () => {
    clearDraft();
    setShowDraftDialog(false);
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
      render: (_value: any, episode: Episode) => new Date(episode.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: any, episode: Episode) => (
        <div className="action-buttons">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(episode); }} className="btn-edit">Edit</button>
          <a href={episode.audio_url} target="_blank" rel="noopener noreferrer" className="btn-play" onClick={(e) => e.stopPropagation()}>
            Play
          </a>
          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(episode.id, episode.title); }} className="btn-delete">Delete</button>
        </div>
      )
    }
  ];

  return (
    <ErrorBoundary>
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
              {loading ? (
                <>
                  <Spinner size="small" />
                  <span style={{ marginLeft: '8px' }}>Saving...</span>
                </>
              ) : (
                editingEpisode ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </ContentModal>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Episode"
        message={
          episodeToDelete
            ? `Are you sure you want to delete "${episodeToDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      <DraftRestoreDialog
        isOpen={showDraftDialog}
        onRestore={handleRestoreDraft}
        onStartFresh={handleStartFresh}
        draftTimestamp={getDraftTimestamp() || Date.now()}
      />
    </div>
    </ErrorBoundary>
  );
}
