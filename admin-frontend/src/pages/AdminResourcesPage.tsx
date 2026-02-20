import { useEffect, useState } from 'react';
import ContentTable from '../components/ContentTable';
import ContentModal from '../components/ContentModal';
import { FileUploader } from 'shared';
import * as api from 'shared/services/api';
import './AdminResourcesPage.css';

interface Resource {
  id: number;
  title: string;
  slug: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: '',
    file_size: 0,
    category: ''
  });

  useEffect(() => {
    fetchResources();
  }, [searchTerm, fileTypeFilter, page]);

  const fetchResources = async () => {
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
      if (fileTypeFilter !== 'all') params.file_type = fileTypeFilter;

      const response = await api.getAdminResources(params);
      setResources(response.resources || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      file_url: '',
      file_type: '',
      file_size: 0,
      category: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      file_url: resource.file_url,
      file_type: resource.file_type,
      file_size: resource.file_size || 0,
      category: resource.category || ''
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

      if (editingResource) {
        await api.updateResource(editingResource.id, data);
      } else {
        await api.createResource(data);
      }

      setIsModalOpen(false);
      fetchResources();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await api.deleteResource(id);
      fetchResources();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete resource');
    }
  };

  const handleFileUpload = (fileData: any) => {
    setFormData({
      ...formData,
      file_url: fileData.url || fileData.cdnUrl,
      file_size: fileData.size || 0,
      file_type: fileData.mimeType?.split('/')[1] || formData.file_type
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const icons: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      txt: '📃',
      zip: '🗜️'
    };
    return icons[fileType] || '📎';
  };

  const columns = [
    { 
      key: 'title', 
      label: 'Title', 
      sortable: true,
      render: (resource: Resource) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{getFileIcon(resource.file_type)}</span>
          <span>{resource.title}</span>
        </div>
      )
    },
    { key: 'file_type', label: 'Type', sortable: true },
    { 
      key: 'file_size', 
      label: 'Size', 
      sortable: true,
      render: (resource: Resource) => formatFileSize(resource.file_size || 0)
    },
    { key: 'category', label: 'Category', sortable: true },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (resource: Resource) => new Date(resource.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (resource: Resource) => (
        <div className="action-buttons">
          <button onClick={() => handleEdit(resource)} className="btn-edit">Edit</button>
          <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="btn-download">
            Download
          </a>
          <button onClick={() => handleDelete(resource.id)} className="btn-delete">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-resources-page">
      <div className="page-header">
        <h1>Manage Resources</h1>
        <button onClick={handleCreate} className="btn-primary">+ Create Resource</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={fileTypeFilter} onChange={(e) => setFileTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="doc">Word</option>
          <option value="xls">Excel</option>
          <option value="ppt">PowerPoint</option>
          <option value="txt">Text</option>
          <option value="zip">Archive</option>
        </select>
      </div>

      <ContentTable
        columns={columns}
        data={resources}
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
        title={editingResource ? 'Edit Resource' : 'Create Resource'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="resource-form">
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
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>File Type *</label>
              <select
                value={formData.file_type}
                onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                required
              >
                <option value="">Select type</option>
                <option value="pdf">PDF</option>
                <option value="doc">Word (DOC)</option>
                <option value="docx">Word (DOCX)</option>
                <option value="xls">Excel (XLS)</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="ppt">PowerPoint (PPT)</option>
                <option value="pptx">PowerPoint (PPTX)</option>
                <option value="txt">Text</option>
                <option value="zip">Archive (ZIP)</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>File *</label>
            <FileUploader
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              onUploadComplete={handleFileUpload}
              maxSize={10 * 1024 * 1024}
              type="document"
            />
            {formData.file_url && (
              <div className="file-info">
                <p>File uploaded: {formatFileSize(formData.file_size)}</p>
                <a href={formData.file_url} target="_blank" rel="noopener noreferrer">
                  View file
                </a>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : editingResource ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </ContentModal>
    </div>
  );
}
