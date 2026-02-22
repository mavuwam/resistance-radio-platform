/**
 * TypeScript models for Admin Mailbox feature
 * Matches database schema from create_admin_mailbox_tables.sql migration
 */

/**
 * AdminEmail interface representing an email message in the admin mailbox
 */
export interface AdminEmail {
  id: number;
  adminUserId: number;
  
  // Email metadata
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  ccAddresses?: string[];
  subject: string;
  
  // Email content
  bodyText?: string;
  bodyHtml?: string;
  
  // Status and flags
  status: 'unread' | 'read' | 'archived' | 'deleted';
  isStarred: boolean;
  
  // Metadata
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  
  // Timestamps
  receivedAt: Date;
  readAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AdminEmailAddress interface representing an email address assigned to an admin user
 */
export interface AdminEmailAddress {
  id: number;
  adminUserId: number;
  emailAddress: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
}
