import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import './TrashTable.css';

interface TrashItem {
  id: number;
  title: string;
  deleted_at: string;
  deleted_by: number;
  deleted_by_email: string;
  protected: boolean;
  [key: string]: any;
}

interface TrashTableProps {
  items: TrashItem[];
  contentType: string;
  onRestore: (contentType: string, id: number) => Promise<void>;
}

export default function TrashTable({ items, contentType, onRestore }: TrashTableProps) {
  const [restoring, setRestoring] = useState<number | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<TrashItem | null>(null);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleRestoreClick = (item: TrashItem) => {
    setConfirmRestore(item);
  };

  const handleConfirmRestore = async () => {
    if (!confirmRestore) return;

    try {
      setRestoring(confirmRestore.id);
      await onRestore(contentType, confirmRestore.id);
      setConfirmRestore(null);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setRestoring(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="trash-empty">
        <svg
          className="empty-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <h3>No deleted items</h3>
        <p>Deleted {contentType} will appear here for recovery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="trash-table-container">
        <table className="trash-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Deleted</th>
              <th>Deleted By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="title-cell">
                  {item.protected && (
                    <svg
                      className="lock-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-label="Protected content"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                  <span className="title-text">{item.title}</span>
                </td>
                <td className="date-cell">{formatDate(item.deleted_at)}</td>
                <td className="user-cell">{item.deleted_by_email || 'Unknown'}</td>
                <td className="status-cell">
                  {item.protected ? (
                    <span className="status-badge protected">Protected</span>
                  ) : (
                    <span className="status-badge regular">Regular</span>
                  )}
                </td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleRestoreClick(item)}
                    disabled={restoring === item.id}
                    className="btn-restore"
                    title="Restore this item"
                  >
                    {restoring === item.id ? (
                      <>
                        <span className="spinner"></span>
                        Restoring...
                      </>
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        Restore
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!confirmRestore}
        title="Restore Content"
        message={`Are you sure you want to restore "${confirmRestore?.title}"? This will make it visible again.`}
        confirmText="Restore"
        cancelText="Cancel"
        onConfirm={handleConfirmRestore}
        onClose={() => setConfirmRestore(null)}
        variant="info"
      />
    </>
  );
}
