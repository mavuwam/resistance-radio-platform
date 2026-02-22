import api from 'shared/services/api';

// TypeScript interfaces
export interface Email {
  id: number;
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  ccAddresses?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  bodyPreview?: string;
  status: 'unread' | 'read' | 'archived' | 'deleted';
  isStarred: boolean;
  receivedAt: string;
  readAt?: string;
}

export interface EmailListResponse {
  emails: Email[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  unreadCount: number;
}

// Mailbox API service functions
export const mailboxService = {
  // List emails with filters
  async listEmails(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<EmailListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status && params.status !== 'all') queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);
    
    const response = await api.get(`/admin/mailbox?${queryParams}`);
    return response.data;
  },

  // Get email detail
  async getEmail(id: number): Promise<Email> {
    const response = await api.get(`/admin/mailbox/${id}`);
    return response.data;
  },

  // Update email status
  async updateStatus(id: number, status: string): Promise<void> {
    await api.patch(`/admin/mailbox/${id}/status`, { status });
  },

  // Toggle star
  async toggleStar(id: number, isStarred: boolean): Promise<void> {
    await api.patch(`/admin/mailbox/${id}/star`, { isStarred });
  },

  // Bulk operations
  async bulkAction(emailIds: number[], action: string): Promise<void> {
    await api.post('/admin/mailbox/bulk', { emailIds, action });
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/admin/mailbox/unread-count');
    return response.data.unreadCount;
  }
};
