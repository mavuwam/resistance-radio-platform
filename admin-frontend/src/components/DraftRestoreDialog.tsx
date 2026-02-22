import './DraftRestoreDialog.css';

interface DraftRestoreDialogProps {
  isOpen: boolean;
  onRestore: () => void;
  onStartFresh: () => void;
  draftTimestamp: number;
}

/**
 * Dialog component that prompts the user to restore a draft or start fresh
 * 
 * @param isOpen - Whether the dialog is visible
 * @param onRestore - Callback when user chooses to restore the draft
 * @param onStartFresh - Callback when user chooses to start fresh
 * @param draftTimestamp - Timestamp when the draft was saved (in milliseconds)
 */
export default function DraftRestoreDialog({
  isOpen,
  onRestore,
  onStartFresh,
  draftTimestamp
}: DraftRestoreDialogProps) {
  if (!isOpen) return null;

  // Format the timestamp to a human-readable format
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // More than 1 day - show full date
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="draft-restore-overlay" onClick={onStartFresh}>
      <div className="draft-restore-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="draft-restore-header">
          <h3>Draft Found</h3>
          <svg 
            className="draft-icon" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        
        <div className="draft-restore-body">
          <p>
            We found a draft of your work from <strong>{formatTimestamp(draftTimestamp)}</strong>.
          </p>
          <p>
            Would you like to restore it or start fresh?
          </p>
        </div>
        
        <div className="draft-restore-actions">
          <button 
            type="button"
            onClick={onStartFresh} 
            className="btn-secondary"
          >
            Start Fresh
          </button>
          <button 
            type="button"
            onClick={onRestore} 
            className="btn-primary"
          >
            Restore Draft
          </button>
        </div>
      </div>
    </div>
  );
}
