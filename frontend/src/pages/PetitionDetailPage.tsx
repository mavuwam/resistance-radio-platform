import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './PetitionDetailPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Petition {
  id: string;
  title: string;
  description: string;
  goalSignatures: number;
  currentSignatures: number;
  ownerId: string;
  status: string;
  createdAt: string;
}

interface Signature {
  id: string;
  name: string;
  createdAt: string;
}

export function PetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [petition, setPetition] = useState<Petition | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [hasSigned, setHasSigned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPetition();
    fetchSignatures();
  }, [id]);

  const fetchPetition = async () => {
    try {
      const response = await axios.get(`${API_URL}/petitions/${id}`);
      setPetition(response.data.petition);
      setError('');
    } catch (err) {
      setError('Failed to load petition');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSignatures = async () => {
    try {
      const response = await axios.get(`${API_URL}/petitions/${id}/signatures`);
      setSignatures(response.data.signatures);
      
      // Check if current user has signed
      if (user) {
        const userSigned = response.data.signatures.some(
          (sig: Signature) => sig.name === user.name
        );
        setHasSigned(userSigned);
      }
    } catch (err) {
      console.error('Failed to load signatures:', err);
    }
  };

  const handleSign = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSigning(true);
    setError('');

    try {
      await axios.post(`${API_URL}/petitions/${id}/sign`);
      setHasSigned(true);
      await fetchPetition();
      await fetchSignatures();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to sign petition';
      setError(errorMessage);
    } finally {
      setIsSigning(false);
    }
  };

  const getProgress = () => {
    if (!petition) return 0;
    return Math.min((petition.currentSignatures / petition.goalSignatures) * 100, 100);
  };

  if (isLoading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!petition) {
    return <div className="error-page">Petition not found</div>;
  }

  const isOwner = user?.id === petition.ownerId;
  const isClosed = petition.status === 'closed';

  return (
    <div className="petition-detail-page">
      <div className="container">
        <div className="petition-header">
          <h1>{petition.title}</h1>
          {isClosed && <span className="status-badge closed">Closed</span>}
        </div>

        <div className="petition-content">
          <div className="main-content">
            <div className="description-section">
              <h2>About this petition</h2>
              <p className="description">{petition.description}</p>
            </div>

            <div className="signatures-section">
              <h2>Recent Signatures</h2>
              {signatures.length > 0 ? (
                <div className="signatures-list">
                  {signatures.slice(0, 10).map((sig) => (
                    <div key={sig.id} className="signature-item">
                      <strong>{sig.name}</strong>
                      <span className="signature-date">
                        {new Date(sig.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-signatures">Be the first to sign this petition!</p>
              )}
            </div>
          </div>

          <div className="sidebar">
            <div className="progress-card">
              <div className="progress-numbers">
                <div className="current-count">
                  {petition.currentSignatures.toLocaleString()}
                </div>
                <div className="goal-text">
                  of {petition.goalSignatures.toLocaleString()} signatures
                </div>
              </div>

              <div className="progress-bar-large">
                <div
                  className="progress-fill-large"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              {!isClosed && (
                <button
                  onClick={handleSign}
                  disabled={hasSigned || isSigning || !isAuthenticated}
                  className="btn-sign"
                >
                  {!isAuthenticated
                    ? 'Login to Sign'
                    : hasSigned
                    ? 'Already Signed'
                    : isSigning
                    ? 'Signing...'
                    : 'Sign This Petition'}
                </button>
              )}

              {isClosed && (
                <div className="closed-message">
                  This petition is closed and no longer accepting signatures.
                </div>
              )}

              {isOwner && (
                <div className="owner-actions">
                  <p className="owner-label">You own this petition</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
