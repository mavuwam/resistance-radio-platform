import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="logo-section">
          <img src="/logo.jpeg" alt="Resistance Radio Logo" className="logo" />
          <h1>Resistance Radio</h1>
          <p className="subtitle">Admin Portal</p>
        </div>

        <div className="form-section">
          <h2>Reset Password</h2>
          <ForgotPasswordForm />
          
          <div className="back-to-login">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
