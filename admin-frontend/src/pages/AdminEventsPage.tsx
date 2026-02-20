import { useEffect, useState } from 'react';
import ContentTable from '../components/ContentTable';
import ContentModal from '../components/ContentModal';
import RichTextEditor from '../components/RichTextEditor';
import { FileUploader } from 'shared';
import * as api from 'shared/services/api';
import './AdminEventsPage.css';

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  location: string;
  organizer?: string;
  registration_url?: string;
  image_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminEventsPage() {
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    organizer: '',
    registration_url: '',
    image_url: '',
    thumbnail_url: ''
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

      const response = await api.getAdminEvents(params);
      setEvents(response.events || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      location: '',
      organizer: '',
      registration_url: '',
      image_url: '',
      thumbnail_url: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date.split('T')[0] + 'T' + event.event_date.split('T')[1].substring(0, 5),
      location: event.location,
      organizer: event.organizer || '',
      registration_url: event.registration_url || '',
      image_url: event.image_url || '',
      thumbnail_url: event.thumbnail_url || ''
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

      if (editingEvent) {
        await api.updateEvent(editingEvent.id, data);
      } else {
        await api.createEvent(data);
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.deleteEvent(id);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete event');
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
    { key: 'location', label: 'Location', sortable: true },
    { 
      key: 'event_date', 
      label: 'Event Date', 
      sortable: true,
      render: (event: Event) => new Date(event.event_date).toLocaleString()
    },
    { key: 'organizer', label: 'Organizer', sortable: true },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (event: Event) => new Date(event.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (event: Event) => (
        <div className="action-buttons">
          <button onClick={() => handleEdit(event)} className="btn-edit">Edit</button>
          <button onClick={() => handleDelete(event.id)} className="btn-delete">Delete</button>
        </div>
      )
    }
  ];

  return (
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
              <label>Event Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Organizer</label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              />
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
          </div>

          <div className="form-group">
            <label>Description *</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
            />
          </div>

          <div className="form-group">
            <label>Event Image</label>
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
              {loading ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </ContentModal>
    </div>
  );
}
