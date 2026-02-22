import './SessionExpiryWarning.css';

interface SessionExpiryWarningProps {
  isOpen: boolean;
  timeUntilExpiry: number;
  onExtendSession: () => void;
  onLogoutNow: () => void;
}

/**
 * Format milliseconds to MM:SS
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function SessionExpiryWarning({
  isOpen,
  timeUntilExpiry,
  onExtendSession,
  onLogoutNow
}: SessionExpiryWarningProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="session-warning-overlay" aria-hidden="true" />
      <div 
        className="session-warning-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-warning-title"
        aria-describedby="session-warning-description"
      >
        <div className="session-warning-content">
          <div className="session-warning-icon">⏰</div>
          
          <h2 id="session-warning-title" className="session-warning-title">
            Session Expiring Soon
          </h2>
          
          <p id="session-warning-description" className="session-warning-description">
            Your session will expire in <strong>{formatTime(timeUntilExpiry)}</strong>
          </p>
          
          <p className="session-warning-info">
            You will be automatically logged out when the session expires. 
            Click "Stay Logged In" to continue working.
          </p>
          
          <div className="session-warning-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={onExtendSession}
              autoFocus
            >
              Stay Logged In
            </button>
            
            <button
              type="button"
              className="btn-secondary"
              onClick={onLogoutNow}
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
