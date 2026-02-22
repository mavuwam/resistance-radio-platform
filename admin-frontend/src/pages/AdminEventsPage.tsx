import { useEffect, useState } from 'react';
import ContentTable from '../components/ContentTable';
import ContentModal from '../components/ContentModal';
import RichTextEditor from '../components/RichTextEditor';
import ErrorBoundary from '../components/ErrorBoundary';
import ConfirmDialog from '../components/ConfirmDialog';
import DraftRestoreDialog from '../components/DraftRestoreDialog';
import { Spinner } from '../components/Loading';
import { getAdminEvents, createEvent, updateEvent, deleteEvent } from 'shared/services/api';
import { useToastContext } from '../contexts/ToastContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { extractErrorMessage } from '../utils/validation';
import './AdminEventsPage.css';

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time?: string;
  location?: string;
  is_virtual: boolean;
  registration_url?: string;
  max_participants?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminEventsPage() {
  const { addToast } = useToastContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Draft restore dialog state
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    start_time: '',
    end_time: '',
    location: '',
    is_virtual: false,
    registration_url: '',
    max_participants: '',
    status: 'upcoming'
  });

  // Auto-save hook
  const { restoreDraft, clearDraft, hasDraft, getDraftTimestamp } = useAutoSave({
    formData,
    formId: 'admin-events-form',
    saveInterval: 30000,
    enabled: isModalOpen
  });

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, startDate, endDate, page]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        limit,
        offset: (page - 1) * limit,
        sort: 'event_date',
        order: 'DESC'
      };
      
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await getAdminEvents(params);
      setEvents(response.events || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, 'Failed to load events');
      setError(errorMessage);
      addToast('error', errorMessage);
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    const initialFormData = {
      title: '',
      description: '',
      event_type: '',
      start_time: '',
      end_time: '',
      location: '',
      is_virtual: false,
      registration_url: '',
      max_participants: '',
      status: 'upcoming'
    };
    setFormData(initialFormData);
    setIsModalOpen(true);

    setTimeout(() => {
      if (hasDraft()) {
        setShowDraftDialog(true);
      }
    }, 100);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      start_time: event.start_time.substring(0, 16),
      end_time: event.end_time ? event.end_time.substring(0, 16) : '',
      location: event.location || '',
      is_virtual: event.is_virtual,
      registration_url: event.registration_url || '',
      max_participants: event.max_participants?.toString() || '',
      status: event.status
    });
    setIsModalOpen(true);
    clearDraft();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data: any = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_time: formData.start_time,
        location: formData.location,
        is_virtual: formData.is_virtual,
        registration_url: formData.registration_url || undefined,
        status: formData.status
      };

      if (formData.end_time) {
        data.end_time = formData.end_time;
      }

      if (formData.max_participants) {
        data.max_participants = parseInt(formData.max_participants);
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        addToast('success', `Event "${formData.title}" updated successfully`);
      } else {
        await createEvent(data);
        addToast('success', `Event "${formData.title}" created successfully`);
      }

      clearDraft();
      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, 'Failed to save event');
      setError(errorMessage);
      addToast('error', errorMessage);
      console.error('Failed to save event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number, title: string) => {
    setEventToDelete({ id, title });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    const { id, title } = eventToDelete;
    
    // Store reference for potential rollback
    const deletedItem = events.find(e => e.id === id);
    if (!deletedItem) return;
    const deletedItemIndex = events.findIndex(e => e.id === id);

    setIsDeleting(true);

    // OPTIMISTIC UPDATE: Remove from UI immediately
    setEvents(prevEvents => prevEvents.filter(e => e.id !== id));
    setTotal(prevTotal => prevTotal - 1);

    try {
      // Backend deletion proceeds asynchronously
      await deleteEvent(id);
      
      // Success: Show confirmation toast
      addToast('success', `Event "${title}" deleted successfully`);
      setShowConfirmDialog(false);
      setEventToDelete(null);
    } catch (err: any) {
      // ROLLBACK: Restore item to original position
      setEvents(prevEvents => {
        const restored = [...prevEvents];
        restored.splice(deletedItemIndex, 0, deletedItem);
        return restored;
      });
      setTotal(prevTotal => prevTotal + 1);
      
      // Show error notification
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.error || 'Failed to delete event';
      addToast('error', errorMessage);
      console.error('Failed to delete event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setEventToDelete(null);
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
    { key: 'event_type', label: 'Type', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { 
      key: 'start_time', 
      label: 'Start Time', 
      sortable: true,
      render: (_value: any, event: Event) => new Date(event.start_time).toLocaleString()
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (_value: any, event: Event) => (
        <span className={`status-badge status-${event.status}`}>
          {event.status}
        </span>
      )
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (_value: any, event: Event) => new Date(event.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: any, event: Event) => (
        <div className="action-buttons">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }} className="btn-edit">Edit</button>
          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(event.id, event.title); }} className="btn-delete">Delete</button>
        </div>
      )
    }
  ];

  return (
    <ErrorBoundary>
      <div className="admin-events-page">
        <div className="page-header">
          <h1>Manage Events</h1>
          <button onClick={handleCreate} className="btn-primary">+ Create Event</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="filters">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End date"
          />
        </div>

        <ContentTable
          columns={columns}
          data={events}
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
          title={editingEvent ? 'Edit Event' : 'Create Event'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="event-form">
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
                <label>Event Type *</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="rally">Rally</option>
                  <option value="protest">Protest</option>
                  <option value="meeting">Meeting</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="webinar">Webinar</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Physical location or 'Online'"
                />
              </div>

              <div className="form-group">
                <label>Max Participants</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_virtual}
                  onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                />
                <span>Virtual Event</span>
              </label>
            </div>

            <div className="form-group">
              <label>Registration URL</label>
              <input
                type="url"
                value={formData.registration_url}
                onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
              />
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
                  editingEvent ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </form>
        </ContentModal>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Event"
          message={
            eventToDelete
              ? `Are you sure you want to delete "${eventToDelete.title}"? This action cannot be undone.`
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
