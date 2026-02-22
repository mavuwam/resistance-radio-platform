import './SubmissionsNotificationBadge.css';

interface SubmissionsNotificationBadgeProps {
  pendingCount: number;
}

export default function SubmissionsNotificationBadge({ pendingCount }: SubmissionsNotificationBadgeProps) {
  if (pendingCount === 0) {
    return null;
  }

  return (
    <span className="notification-badge" aria-label={`${pendingCount} pending submissions`}>
      {pendingCount}
    </span>
  );
}
