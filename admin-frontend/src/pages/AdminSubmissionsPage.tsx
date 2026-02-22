import { useEffect, useState } from 'react';
import { getAdminSubmissions, updateSubmissionStatus, deleteSubmission } from 'shared/services/api';
import ErrorBoundary from '../components/ErrorBoundary';
import DraftRestoreDialog from '../components/DraftRestoreDialog';
import { useToastContext } from '../contexts/ToastContext';
import { useAutoSave } from '../hooks/useAutoSave';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner } from '../components/Loading';
import './AdminSubmissionsPage.css';

interface Submission {
  id: number;
  submission_type: string;
  submitter_name: string;
  submitter_email: string;
  subject?: string;
  content: string;
  metadata?: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  feedback?: string;
}

function AdminSubmissionsPageContent() {
  const { addToast } = useToastContext();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<number | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Auto-save for review notes
  const { restoreDraft, clearDraft, getDraftTimestamp } = useAutoSave({
    formData: { feedback },
    formId: `admin-submission-review-${selectedSubmission?.id || 'new'}`,
    saveInterval: 30000,
    enabled: selectedSubmission !== null
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissionsList();
  }, [submissions, filterType, filterStatus]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAdminSubmissions({ status: filterStatus !== 'all' ? filterStatus : undefined });
      setSubmissions(response.submissions || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load submissions';
      setError(errorMessage);
      addToast('error', errorMessage);
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubmissionsList = () => {
    let filtered = submissions;

    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.submission_type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    setFilteredSubmissions(filtered);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);

    try {
      await updateSubmissionStatus(selectedSubmission.id, 'approved');

      setSubmissions(submissions.map(s =>
        s.id === selectedSubmission.id ? { ...s, status: 'approved' as const } : s
      ));
      addToast('success', `Submission from ${selectedSubmission.submitter_name} approved successfully`);
      clearDraft();
      setSelectedSubmission(null);
      setFeedback('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to approve submission';
      addToast('error', errorMessage);
      console.error('Error approving submission:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    
    // Show confirmation dialog for rejection
    setShowRejectConfirm(true);
  };

  const confirmReject = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    setShowRejectConfirm(false);

    try {
      await updateSubmissionStatus(selectedSubmission.id, 'rejected');

      setSubmissions(submissions.map(s =>
        s.id === selectedSubmission.id ? { ...s, status: 'rejected' as const } : s
      ));
      addToast('success', `Submission from ${selectedSubmission.submitter_name} rejected`);
      clearDraft();
      setSelectedSubmission(null);
      setFeedback('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject submission';
      addToast('error', errorMessage);
      console.error('Error rejecting submission:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSubmissionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (submissionToDelete === null) return;
    
    try {
      await deleteSubmission(submissionToDelete);
      setSubmissions(submissions.filter(s => s.id !== submissionToDelete));
      if (selectedSubmission?.id === submissionToDelete) {
        setSelectedSubmission(null);
      }
      addToast('success', 'Submission deleted successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete submission';
      addToast('error', errorMessage);
      console.error('Error deleting submission:', err);
    } finally {
      setShowDeleteConfirm(false);
      setSubmissionToDelete(null);
    }
  };

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft && draft.feedback) {
      setFeedback(draft.feedback);
      addToast('info', 'Draft notes restored successfully');
    }
    setShowDraftDialog(false);
  };

  const handleStartFresh = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      story: 'Story',
      volunteer: 'Volunteer',
      contributor: 'Contributor',
      contact: 'Contact'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner size="large" />
        <p>Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchSubmissions} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-submissions-page">
      <div className="page-header">
        <h1>Review Submissions</h1>
        <div className="filters">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="story">Stories</option>
            <option value="volunteer">Volunteers</option>
            <option value="contributor">Contributors</option>
            <option value="contact">Contact</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="submissions-layout">
        <div className="submissions-list">
          {filteredSubmissions.length === 0 ? (
            <div className="empty-state">No submissions found</div>
          ) : (
            filteredSubmissions.map(submission => (
              <div
                key={submission.id}
                className={`submission-card ${selectedSubmission?.id === submission.id ? 'selected' : ''}`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="submission-header">
                  <span className="submission-type">{getTypeLabel(submission.submission_type)}</span>
                  <span className={`status-badge ${submission.status}`}>
                    {submission.status}
                  </span>
                </div>
                <h3>{submission.submitter_name}</h3>
                <p className="submission-email">{submission.submitter_email}</p>
                <p className="submission-date">{formatDate(submission.created_at)}</p>
              </div>
            ))
          )}
        </div>

        <div className="submission-detail">
          {selectedSubmission ? (
            <>
              <div className="detail-header">
                <h2>{getTypeLabel(selectedSubmission.submission_type)} Submission</h2>
                <button
                  onClick={() => handleDeleteClick(selectedSubmission.id)}
                  className="btn-delete-small"
                >
                  Delete
                </button>
              </div>

              <div className="detail-content">
                <div className="detail-section">
                  <label>Name:</label>
                  <p>{selectedSubmission.submitter_name}</p>
                </div>

                <div className="detail-section">
                  <label>Email:</label>
                  <p>{selectedSubmission.submitter_email}</p>
                </div>

                {selectedSubmission.subject && (
                  <div className="detail-section">
                    <label>Subject:</label>
                    <p>{selectedSubmission.subject}</p>
                  </div>
                )}

                <div className="detail-section">
                  <label>Message:</label>
                  <p className="message-content">{selectedSubmission.content}</p>
                </div>

                {selectedSubmission.metadata && (
                  <div className="detail-section">
                    <label>Additional Info:</label>
                    <pre>{JSON.stringify(selectedSubmission.metadata, null, 2)}</pre>
                  </div>
                )}

                <div className="detail-section">
                  <label>Submitted:</label>
                  <p>{formatDate(selectedSubmission.created_at)}</p>
                </div>

                <div className="detail-section">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedSubmission.status}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
              </div>

              {selectedSubmission.status === 'pending' && (
                <div className="action-section">
                  <div className="feedback-input">
                    <label>Feedback (optional):</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add feedback for the submitter..."
                      rows={3}
                    />
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={handleApprove}
                      className="btn-approve"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={handleReject}
                      className="btn-reject"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-detail">
              Select a submission to view details
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSubmissionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Submission"
        message="Are you sure you want to delete this submission? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={confirmReject}
        title="Reject Submission"
        message={`Are you sure you want to reject the submission from ${selectedSubmission?.submitter_name}?`}
        confirmText="Reject"
        cancelText="Cancel"
        variant="warning"
        isLoading={isProcessing}
      />

      <DraftRestoreDialog
        isOpen={showDraftDialog}
        onRestore={handleRestoreDraft}
        onStartFresh={handleStartFresh}
        draftTimestamp={getDraftTimestamp() || Date.now()}
      />
    </div>
  );
}

export default function AdminSubmissionsPage() {
  return (
    <ErrorBoundary>
      <AdminSubmissionsPageContent />
    </ErrorBoundary>
  );
}
