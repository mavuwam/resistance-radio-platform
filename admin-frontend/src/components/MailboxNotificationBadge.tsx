import './MailboxNotificationBadge.css';

import './MailboxNotificationBadge.css';

interface MailboxNotificationBadgeProps {
  unreadCount: number;
}

export default function MailboxNotificationBadge({ unreadCount }: MailboxNotificationBadgeProps) {
  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="notification-badge" aria-label={`${unreadCount} unread emails`}>
      {unreadCount}
    </span>
  );
}
