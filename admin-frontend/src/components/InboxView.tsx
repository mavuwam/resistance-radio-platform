import { useState } from 'react';
import { Email } from '../services/mailbox';
import ConfirmDialog from './ConfirmDialog';
import './InboxView.css';

interface InboxViewProps {
  emails: Email[];
  selectedEmailId: number | null;
  onEmailSelect: (email: Email) => void;
  onStatusChange: (emailId: number, status: string) => void;
  onStarToggle: (emailId: number, isStarred: boolean) => void;
  onBulkAction: (emailIds: number[], action: string) => void;
  loading: boolean;
}

export default function InboxView({
  emails,
  selectedEmailId,
  onEmailSelect,
  onStatusChange,
  onStarToggle,
  onBulkAction,
  loading
}: InboxViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [hoveredEmailId, setHoveredEmailId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle checkbox selection
  const handleCheckboxChange = (emailId: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(emailId);
    } else {
      newSelected.delete(emailId);
    }
    setSelectedIds(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(emails.map(e => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Handle bulk action
  const handleBulkAction = (action: string) => {
    // Show confirmation for delete action
    if (action === 'delete') {
      setShowBulkDeleteConfirm(true);
      return;
    }
    
    const emailIds = Array.from(selectedIds);
    onBulkAction(emailIds, action);
    setSelectedIds(new Set()); // Clear selection after action
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const emailIds = Array.from(selectedIds);
      await onBulkAction(emailIds, 'delete');
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
    } catch (err) {
      console.error('Bulk delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle single delete click
  const handleDeleteClick = (emailId: number) => {
    setEmailToDelete(emailId);
    setShowDeleteConfirm(true);
  };

  // Handle single delete confirmation
  const handleDeleteConfirm = async () => {
    if (!emailToDelete) return;
    
    setIsDeleting(true);
    try {
      await onStatusChange(emailToDelete, 'deleted');
      setShowDeleteConfirm(false);
      setEmailToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const allSelected = emails.length > 0 && selectedIds.size === emails.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < emails.length;

  return (
    <div className="inbox-view">
      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions-toolbar">
          <span className="selected-count">{selectedIds.size} selected</span>
          <div className="bulk-actions">
            <button
              onClick={() => handleBulkAction('mark_read')}
              className="btn-bulk"
              title="Mark as read"
            >
              Mark Read
            </button>
            <button
              onClick={() => handleBulkAction('mark_unread')}
              className="btn-bulk"
              title="Mark as unread"
            >
              Mark Unread
            </button>
            <button
              onClick={() => handleBulkAction('star')}
              className="btn-bulk"
              title="Star"
            >
              ★ Star
            </button>
            <button
              onClick={() => handleBulkAction('unstar')}
              className="btn-bulk"
              title="Unstar"
            >
              ☆ Unstar
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="btn-bulk"
              title="Archive"
            >
              Archive
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn-bulk btn-danger"
              title="Delete"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Email List Table */}
      <div className="email-table-container">
        <table className="email-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all emails"
                />
              </th>
              <th className="col-star"></th>
              <th className="col-sender">From</th>
              <th className="col-subject">Subject</th>
              <th className="col-date">Date</th>
              <th className="col-status">Status</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="loading-row">
                  <div className="spinner"></div>
                  <span>Loading emails...</span>
                </td>
              </tr>
            ) : emails.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-row">
                  No emails found
                </td>
              </tr>
            ) : (
              emails.map((email) => (
                <tr
                  key={email.id}
                  className={`email-row ${email.status === 'unread' ? 'unread' : ''} ${
                    selectedEmailId === email.id ? 'selected' : ''
                  } ${selectedIds.has(email.id) ? 'checked' : ''}`}
                  onMouseEnter={() => setHoveredEmailId(email.id)}
                  onMouseLeave={() => setHoveredEmailId(null)}
                >
                  <td className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(email.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(email.id, e.target.checked);
                      }}
                      aria-label={`Select email from ${email.fromName || email.fromAddress}`}
                    />
                  </td>
                  <td className="col-star">
                    <button
                      className={`star-btn ${email.isStarred ? 'starred' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStarToggle(email.id, !email.isStarred);
                      }}
                      aria-label={email.isStarred ? 'Unstar email' : 'Star email'}
                    >
                      {email.isStarred ? '★' : '☆'}
                    </button>
                  </td>
                  <td
                    className="col-sender"
                    onClick={() => onEmailSelect(email)}
                  >
                    {email.fromName || email.fromAddress}
                  </td>
                  <td
                    className="col-subject"
                    onClick={() => onEmailSelect(email)}
                  >
                    <span className="subject-text">{email.subject}</span>
                    {email.bodyPreview && (
                      <span className="preview-text"> - {email.bodyPreview}</span>
                    )}
                  </td>
                  <td
                    className="col-date"
                    onClick={() => onEmailSelect(email)}
                  >
                    {formatDate(email.receivedAt)}
                  </td>
                  <td
                    className="col-status"
                    onClick={() => onEmailSelect(email)}
                  >
                    <span className={`status-badge ${email.status}`}>
                      {email.status}
                    </span>
                  </td>
                  <td className="col-actions">
                    {hoveredEmailId === email.id && (
                      <div className="inline-actions">
                        {email.status === 'unread' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(email.id, 'read');
                            }}
                            className="action-btn"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(email.id, 'unread');
                            }}
                            className="action-btn"
                            title="Mark as unread"
                          >
                            ○
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(email.id, 'archived');
                          }}
                          className="action-btn"
                          title="Archive"
                        >
                          📦
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(email.id);
                          }}
                          className="action-btn action-delete"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Email"
        message="Are you sure you want to delete this email? It will be moved to trash and can be recovered within 30 days."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Multiple Emails"
        message={`Are you sure you want to delete ${selectedIds.size} email${selectedIds.size > 1 ? 's' : ''}? They will be moved to trash and can be recovered within 30 days.`}
        confirmText={`Delete ${selectedIds.size} Email${selectedIds.size > 1 ? 's' : ''}`}
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
