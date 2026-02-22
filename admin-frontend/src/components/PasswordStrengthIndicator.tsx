import { useMemo } from 'react';
import './PasswordStrengthIndicator.css';

interface PasswordStrengthIndicatorProps {
  password: string;
  email?: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

export default function PasswordStrengthIndicator({ password, email }: PasswordStrengthIndicatorProps) {
  const requirements = useMemo((): PasswordRequirement[] => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    const notMatchEmail = !email || password.toLowerCase() !== email.toLowerCase();

    return [
      { label: 'At least 8 characters', met: hasMinLength },
      { label: 'One uppercase letter', met: hasUppercase },
      { label: 'One lowercase letter', met: hasLowercase },
      { label: 'One digit', met: hasDigit },
      { label: 'One special character (!@#$%^&*...)', met: hasSpecialChar },
      { label: 'Not same as email', met: notMatchEmail },
    ];
  }, [password, email]);

  const strength = useMemo((): PasswordStrength => {
    const metCount = requirements.filter(req => req.met).length;
    
    if (metCount <= 2) return 'weak';
    if (metCount <= 4) return 'medium';
    return 'strong';
  }, [requirements]);

  const strengthPercentage = useMemo(() => {
    const metCount = requirements.filter(req => req.met).length;
    return (metCount / requirements.length) * 100;
  }, [requirements]);

  if (!password) {
    return null;
  }

  return (
    <div className="password-strength-indicator">
      <div className="strength-bar-container">
        <div 
          className={`strength-bar strength-${strength}`}
          style={{ width: `${strengthPercentage}%` }}
          role="progressbar"
          aria-valuenow={strengthPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${strength}`}
        />
      </div>
      
      <p className={`strength-label strength-${strength}`}>
        Password strength: <strong>{strength}</strong>
      </p>

      <ul className="requirements-list">
        {requirements.map((req, index) => (
          <li key={index} className={req.met ? 'met' : 'unmet'}>
            <span className="requirement-icon" aria-hidden="true">
              {req.met ? '✓' : '○'}
            </span>
            <span className="requirement-label">{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
