import { useState } from 'react';
import { Email } from '../services/mailbox';
import { sanitizeEmailHtml } from '../utils/sanitize';
import ConfirmDialog from './ConfirmDialog';
import './EmailDetailView.css';

interface EmailDetailViewProps {
  email: Email;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onStarToggle: (isStarred: boolean) => void;
  onDelete: () => void;
}

export default function EmailDetailView({
  email,
  onClose,
  onStatusChange,
  onStarToggle,
  onDelete
}: EmailDetailViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Handle delete with confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="email-detail-view">
      {/* Header with action buttons */}
      <div className="detail-header">
        <button onClick={onClose} className="btn-back" aria-label="Back to inbox">
          ← Back
        </button>
        <div className="detail-actions">
          <button
            className={`btn-star ${email.isStarred ? 'starred' : ''}`}
            onClick={() => onStarToggle(!email.isStarred)}
            aria-label={email.isStarred ? 'Unstar email' : 'Star email'}
            title={email.isStarred ? 'Unstar' : 'Star'}
          >
            {email.isStarred ? '★' : '☆'}
          </button>
          {email.status === 'read' && (
            <button
              onClick={() => onStatusChange('unread')}
              className="btn-action"
              title="Mark as unread"
            >
              Mark Unread
            </button>
          )}
          <button
            onClick={() => onStatusChange('archived')}
            className="btn-action"
            title="Archive email"
          >
            Archive
          </button>
          <button
            onClick={handleDeleteClick}
            className="btn-delete"
            title="Delete email"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Email metadata */}
      <div className="email-metadata">
        <div className="metadata-row">
          <span className="metadata-label">From:</span>
          <span className="metadata-value">
            {email.fromName ? (
              <>{email.fromName} &lt;{email.fromAddress}&gt;</>
            ) : (
              email.fromAddress
            )}
          </span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">To:</span>
          <span className="metadata-value">{email.toAddress}</span>
        </div>
        {email.ccAddresses && email.ccAddresses.length > 0 && (
          <div className="metadata-row">
            <span className="metadata-label">CC:</span>
            <span className="metadata-value">{email.ccAddresses.join(', ')}</span>
          </div>
        )}
        <div className="metadata-row">
          <span className="metadata-label">Subject:</span>
          <span className="metadata-value subject">{email.subject}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">Date:</span>
          <span className="metadata-value">{formatDate(email.receivedAt)}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">Status:</span>
          <span className={`status-badge ${email.status}`}>{email.status}</span>
        </div>
      </div>

      {/* Email body */}
      <div className="email-body">
        {email.bodyHtml ? (
          <div
            className="email-html-content"
            dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(email.bodyHtml) }}
          />
        ) : email.bodyText ? (
          <div className="email-text-content">
            {email.bodyText}
          </div>
        ) : (
          <div className="email-empty">
            <p>No content available</p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Email"
        message="Are you sure you want to delete this email? It will be moved to trash and can be recovered within 30 days."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
