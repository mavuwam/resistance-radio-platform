import { useState, FormEvent } from 'react';
import { useAuth } from 'shared';
import { useToastContext } from '../contexts/ToastContext';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import api from 'shared/services/api';
import './ChangePasswordForm.css';

export default function ChangePasswordForm() {
  const { user } = useAuth();
  const { addToast } = useToastContext();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

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
      await api.post('/admin/password/change', {
        currentPassword,
        newPassword,
      });

      addToast('success', 'Password changed successfully');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);

      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        
        if (errorData.code === 'INVALID_CURRENT_PASSWORD') {
          setErrors({ currentPassword: 'Current password is incorrect' });
          addToast('error', 'Current password is incorrect');
        } else if (errorData.code === 'VALIDATION_ERROR' && errorData.details) {
          addToast('error', errorData.details.join('. '));
        } else {
          addToast('error', errorData.message || 'Failed to change password');
        }
      } else {
        addToast('error', 'Failed to change password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      <div className="form-group">
        <label htmlFor="currentPassword">
          Current Password <span className="required">*</span>
        </label>
        <div className="password-input-wrapper">
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={errors.currentPassword ? 'error' : ''}
            disabled={isSubmitting}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.currentPassword && (
          <span className="error-message">{errors.currentPassword}</span>
        )}
      </div>

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
        
        <PasswordStrengthIndicator password={newPassword} email={user?.email} />
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
          disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
        >
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
