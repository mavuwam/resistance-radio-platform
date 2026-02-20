import { useEffect, useState } from 'react';
import { api } from 'shared';
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

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissionsList();
  }, [submissions, filterType, filterStatus]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/submissions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
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
      const token = localStorage.getItem('token');
      await api.put(`/admin/submissions/${selectedSubmission.id}/approve`, {
        feedback: feedback || undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSubmissions(submissions.map(s =>
        s.id === selectedSubmission.id ? { ...s, status: 'approved' as const } : s
      ));
      setSelectedSubmission(null);
      setFeedback('');
    } catch (error) {
      alert('Failed to approve submission');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/submissions/${selectedSubmission.id}/reject`, {
        feedback: feedback || undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSubmissions(submissions.map(s =>
        s.id === selectedSubmission.id ? { ...s, status: 'rejected' as const } : s
      ));
      setSelectedSubmission(null);
      setFeedback('');
    } catch (error) {
      alert('Failed to reject submission');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/submissions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSubmissions(submissions.filter(s => s.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      alert('Failed to delete submission');
      console.error(error);
    }
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

  if (isLoading) return <div className="loading">Loading submissions...</div>;

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
                  onClick={() => handleDelete(selectedSubmission.id)}
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
    </div>
  );
}
