import { Link } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPasswordForm';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="logo-section">
          <img src="/logo.jpeg" alt="Resistance Radio Logo" className="logo" />
          <h1>Resistance Radio</h1>
          <p className="subtitle">Admin Portal</p>
        </div>

        <div className="form-section">
          <h2>Set New Password</h2>
          <ResetPasswordForm />
          
          <div className="back-to-login">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
