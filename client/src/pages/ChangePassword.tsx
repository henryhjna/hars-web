import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import userService from '../services/user.service';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!formData.newPassword) {
      setError('New password is required');
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);

      const response = await userService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (response.success) {
        setSuccess('Password changed successfully! Redirecting...');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/my-page');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 2) return { strength: 'Weak', color: 'text-red-600' };
    if (score <= 4) return { strength: 'Medium', color: 'text-yellow-600' };
    return { strength: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-page')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Lock className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          </div>
          <p className="text-gray-600">Update your account password to keep your account secure</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card variant="elevated">
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}

            {/* Current Password */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  name="currentPassword"
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {/* New Password */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.newPassword && (
                <p className={`mt-2 text-sm font-medium ${passwordStrength.color}`}>
                  Password Strength: {passwordStrength.strength}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Password Requirements:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span
                    className={
                      formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {formData.newPassword.length >= 8 ? '✓' : '○'}
                  </span>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'}
                  </span>
                  At least one uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {/[a-z]/.test(formData.newPassword) ? '✓' : '○'}
                  </span>
                  At least one lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {/[0-9]/.test(formData.newPassword) ? '✓' : '○'}
                  </span>
                  At least one number
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /[!@#$%^&*]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {/[!@#$%^&*]/.test(formData.newPassword) ? '✓' : '○'}
                  </span>
                  At least one special character (!@#$%^&*)
                </li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/my-page')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
