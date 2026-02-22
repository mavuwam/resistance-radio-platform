import { useState, FormEvent } from 'react';
import api from 'shared/services/api';
import './ForgotPasswordForm.css';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ retryAfter: number } | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatRetryTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setRateLimitInfo(null);

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/admin/password/reset/request', { email });
      setSubmitted(true);
    } catch (error: any) {
      console.error('Password reset request error:', error);

      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.error?.retryAfter || 900;
        setRateLimitInfo({ retryAfter });
        setError(`Too many password reset requests. Please try again in ${formatRetryTime(retryAfter)}.`);
      } else if (error.response?.data?.error) {
        // Still show generic message for security (email enumeration prevention)
        setSubmitted(true);
      } else {
        // Network or other errors
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="forgot-password-success">
        <div className="success-icon">✓</div>
        <h3>Check Your Email</h3>
        <p>
          If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
        </p>
        <p className="help-text">
          Please check your inbox and spam folder. The link will expire in 1 hour.
        </p>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setSubmitted(false);
            setEmail('');
          }}
        >
          Send Another Reset Link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <div className="form-description">
        <p>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email Address <span className="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={error ? 'error' : ''}
          disabled={isSubmitting}
          autoComplete="email"
          placeholder="admin@example.com"
          autoFocus
        />
        {error && <span className="error-message">{error}</span>}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !email}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>

      {rateLimitInfo && (
        <div className="rate-limit-info">
          <p>
            For security reasons, password reset requests are limited to 3 attempts per 15 minutes.
          </p>
        </div>
      )}
    </form>
  );
}
