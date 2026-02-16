import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePetitionPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function CreatePetitionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalSignatures, setGoalSignatures] = useState('1000');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (title.length < 10 || title.length > 200) {
      setError('Title must be between 10 and 200 characters');
      return;
    }

    if (description.length < 50) {
      setError('Description must be at least 50 characters');
      return;
    }

    const goal = parseInt(goalSignatures);
    if (isNaN(goal) || goal <= 0) {
      setError('Goal must be a positive number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/petitions`, {
        title,
        description,
        goalSignatures: goal
      });

      navigate(`/petitions/${response.data.petition.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to create petition';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-petition-page">
      <div className="container">
        <h1>Start a Campaign</h1>
        <p className="subtitle">Rally Zimbabweans around your cause for democracy and freedom</p>

        <form className="petition-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Campaign Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Protect Zimbabwe's Constitutional Term Limits"
              required
              disabled={isLoading}
              maxLength={200}
            />
            <small>{title.length}/200 characters (minimum 10)</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Why This Matters *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this issue is critical for Zimbabwe's democracy and freedom..."
              required
              disabled={isLoading}
              rows={8}
            />
            <small>{description.length} characters (minimum 50)</small>
          </div>

          <div className="form-group">
            <label htmlFor="goal">Signature Goal *</label>
            <input
              type="number"
              id="goal"
              value={goalSignatures}
              onChange={(e) => setGoalSignatures(e.target.value)}
              min="1"
              required
              disabled={isLoading}
            />
            <small>How many signatures do you want to collect?</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
