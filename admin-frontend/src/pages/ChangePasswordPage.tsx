import ChangePasswordForm from '../components/ChangePasswordForm';
import './ChangePasswordPage.css';

export default function ChangePasswordPage() {
  return (
    <div className="change-password-page">
      <div className="page-header">
        <h1>Change Password</h1>
        <p>Update your admin account password</p>
      </div>

      <div className="page-content">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
