import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import api from 'shared/services/api';
import './ResetPasswordForm.css';

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setErrors({ token: 'No reset token provided' });
      setIsValidating(false);
      setTokenValid(false);
      return;
    }

    setToken(tokenParam);
    setIsValidating(false);
    setTokenValid(true);
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post('/admin/password/reset/complete', {
        token,
        newPassword,
      });

      // Show success message and redirect to login
      navigate('/login', {
        state: {
          message: 'Password reset successfully. Please log in with your new password.',
          type: 'success'
        }
      });
    } catch (error: any) {
      console.error('Password reset error:', error);

      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        
        if (errorData.code === 'INVALID_TOKEN') {
          setErrors({ 
            token: 'This reset link is invalid or has expired. Please request a new one.' 
          });
          setTokenValid(false);
        } else if (errorData.code === 'VALIDATION_ERROR' && errorData.details) {
          setErrors({ 
            newPassword: errorData.details.join('. ')
          });
        } else {
          setErrors({ 
            general: errorData.message || 'Failed to reset password' 
          });
        }
      } else {
        setErrors({ 
          general: 'Failed to reset password. Please try again.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="reset-password-loading">
        <div className="loading-spinner"></div>
        <p>Validating reset link...</p>
      </div>
    );
  }

  if (!tokenValid || errors.token) {
    return (
      <div className="reset-password-error">
        <div className="error-icon">✕</div>
        <h3>Invalid Reset Link</h3>
        <p>{errors.token || 'This password reset link is invalid or has expired.'}</p>
        <p className="help-text">
          Reset links expire after 1 hour and can only be used once.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/forgot-password')}
        >
          Request New Reset Link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="reset-password-form">
      <div className="form-description">
        <p>Enter your new password below.</p>
      </div>

      {errors.general && (
        <div className="alert alert-error">
          {errors.general}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="newPassword">
          New Password <span className="required">*</span>
        </label>
        <div className="password-input-wrapper">
          <input
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={errors.newPassword ? 'error' : ''}
            disabled={isSubmitting}
            autoComplete="new-password"
            autoFocus
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showNewPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.newPassword && (
          <span className="error-message">{errors.newPassword}</span>
        )}
        
        <PasswordStrengthIndicator password={newPassword} />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">
          Confirm New Password <span className="required">*</span>
        </label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirmPassword ? 'error' : ''}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !newPassword || !confirmPassword}
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
}
