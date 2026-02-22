import { useEffect, useState, useCallback, useRef } from 'react';
import { mailboxService, Email, EmailListResponse } from '../services/mailbox';
import { useToastContext } from '../contexts/ToastContext';
import ErrorBoundary from '../components/ErrorBoundary';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner } from '../components/Loading';
import Pagination from '../components/Pagination';
import './MailboxPage.css';

export default function MailboxPage() {
  const { addToast } = useToastContext();
  
  // State management
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<number | null>(null);

  // Refs for polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch emails from API
  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response: EmailListResponse = await mailboxService.listEmails({
        page: currentPage,
        limit: 50,
        status: statusFilter,
        search: debouncedSearch
      });
      
      setEmails(response.emails);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.totalCount);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load emails';
      setError(errorMessage);
      addToast('error', errorMessage);
      console.error('Failed to fetch emails:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch, addToast]);

  // Fetch unread count for polling
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await mailboxService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Email polling hook - poll every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchUnreadCount]);

  // Fetch emails when filters change
  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle status filter change
  const handleStatusFilterChange = (status: 'all' | 'unread' | 'read' | 'archived') => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of inbox view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle email selection
  const handleEmailSelect = async (email: Email) => {
    if (loadingDetail) return; // Prevent multiple clicks
    
    setLoadingDetail(true);
    try {
      // Fetch full email details
      const fullEmail = await mailboxService.getEmail(email.id);
      setSelectedEmail(fullEmail);
      
      // Refresh email list to update read status
      fetchEmails();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load email';
      addToast('error', errorMessage);
      console.error('Failed to fetch email:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle close detail view
  const handleCloseDetail = () => {
    setSelectedEmail(null);
  };

  // Handle status change
  const handleStatusChange = async (emailId: number, status: string) => {
    if (actionLoading) return; // Prevent multiple actions
    
    setActionLoading(emailId);
    try {
      await mailboxService.updateStatus(emailId, status);
      addToast('success', 'Email status updated');
      fetchEmails();
      
      // If viewing detail, close it
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update status';
      addToast('error', errorMessage);
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle star toggle
  const handleStarToggle = async (emailId: number, isStarred: boolean) => {
    if (actionLoading) return; // Prevent multiple actions
    
    setActionLoading(emailId);
    try {
      await mailboxService.toggleStar(emailId, isStarred);
      fetchEmails();
      
      // Update selected email if it's the one being starred
      if (selectedEmail?.id === emailId) {
        setSelectedEmail({ ...selectedEmail, isStarred });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to toggle star';
      addToast('error', errorMessage);
      console.error('Failed to toggle star:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete click - show confirmation dialog
  const handleDeleteClick = (emailId: number) => {
    setEmailToDelete(emailId);
    setShowDeleteConfirm(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!emailToDelete) return;
    
    setShowDeleteConfirm(false);
    await handleStatusChange(emailToDelete, 'deleted');
    setEmailToDelete(null);
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setEmailToDelete(null);
  };

  return (
    <ErrorBoundary>
      <div className="mailbox-page">
        <div className="page-header">
          <h1>Mailbox</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button 
                onClick={fetchEmails} 
                className="btn-retry"
                aria-label="Retry loading emails"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="mailbox-filters">
          <div className="filter-controls">
            <select 
              value={statusFilter} 
              onChange={(e) => handleStatusFilterChange(e.target.value as any)}
              className="status-filter"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>

            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mailbox-content">
          {/* Inbox View */}
          <div className={`inbox-view ${selectedEmail ? 'with-detail' : ''}`}>
            {loading ? (
              <div className="loading-container">
                <Spinner />
                <p>Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="empty-state">
                <p>No emails found</p>
              </div>
            ) : (
              <div className="email-list">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className={`email-item ${email.status === 'unread' ? 'unread' : ''} ${selectedEmail?.id === email.id ? 'selected' : ''} ${actionLoading === email.id ? 'loading' : ''}`}
                    onClick={() => !actionLoading && handleEmailSelect(email)}
                  >
                    <div className="email-item-header">
                      <button
                        className={`star-button ${email.isStarred ? 'starred' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarToggle(email.id, !email.isStarred);
                        }}
                        disabled={actionLoading === email.id}
                        aria-label={email.isStarred ? 'Unstar' : 'Star'}
                      >
                        {actionLoading === email.id ? '⋯' : email.isStarred ? '★' : '☆'}
                      </button>
                      <span className="email-from">
                        {email.fromName || email.fromAddress}
                      </span>
                      <span className="email-date">
                        {new Date(email.receivedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="email-subject">{email.subject}</div>
                    <div className="email-preview">{email.bodyPreview}</div>
                    <div className="email-status">
                      <span className={`status-badge ${email.status}`}>
                        {email.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination with email count info */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="email-count-info">
                  Showing {((currentPage - 1) * 50) + 1}-{Math.min(currentPage * 50, totalCount)} of {totalCount} emails
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* Detail View */}
          {selectedEmail && (
            <div className="detail-view">
              {loadingDetail ? (
                <div className="loading-container">
                  <Spinner />
                  <p>Loading email...</p>
                </div>
              ) : (
                <>
                  <div className="detail-header">
                    <button onClick={handleCloseDetail} className="btn-back" disabled={actionLoading !== null}>
                      ← Back to Inbox
                    </button>
                    <div className="detail-actions">
                      <button
                        className={`star-button ${selectedEmail.isStarred ? 'starred' : ''}`}
                        onClick={() => handleStarToggle(selectedEmail.id, !selectedEmail.isStarred)}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === selectedEmail.id ? '⋯' : selectedEmail.isStarred ? '★' : '☆'}
                      </button>
                      {selectedEmail.status === 'read' && (
                        <button
                          onClick={() => handleStatusChange(selectedEmail.id, 'unread')}
                          className="btn-secondary"
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === selectedEmail.id ? 'Processing...' : 'Mark Unread'}
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(selectedEmail.id, 'archived')}
                        className="btn-secondary"
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === selectedEmail.id ? 'Processing...' : 'Archive'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(selectedEmail.id)}
                        className="btn-danger"
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === selectedEmail.id ? 'Processing...' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className="detail-content">
                    <div className="email-meta">
                      <div className="meta-row">
                        <span className="meta-label">From:</span>
                        <span className="meta-value">
                          {selectedEmail.fromName ? (
                            `${selectedEmail.fromName} <${selectedEmail.fromAddress}>`
                          ) : (
                            selectedEmail.fromAddress
                          )}
                        </span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">To:</span>
                        <span className="meta-value">{selectedEmail.toAddress}</span>
                      </div>
                      {selectedEmail.ccAddresses && selectedEmail.ccAddresses.length > 0 && (
                        <div className="meta-row">
                          <span className="meta-label">CC:</span>
                          <span className="meta-value">{selectedEmail.ccAddresses.join(', ')}</span>
                        </div>
                      )}
                      <div className="meta-row">
                        <span className="meta-label">Subject:</span>
                        <span className="meta-value">{selectedEmail.subject}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Date:</span>
                        <span className="meta-value">
                          {new Date(selectedEmail.receivedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="email-body">
                      {selectedEmail.bodyHtml ? (
                        <div
                          className="email-html-body"
                          dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                        />
                      ) : (
                        <div className="email-text-body">
                          {selectedEmail.bodyText}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Email"
          message="Are you sure you want to delete this email? It will be moved to trash and can be recovered within 30 days."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={actionLoading !== null}
        />
      </div>
    </ErrorBoundary>
  );
}
