import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const PREFIX_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.'];
const ACADEMIC_TITLE_OPTIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Ph.D. Candidate',
  'Adjunct Professor',
  'Lecturer',
  'Research Fellow',
  'Postdoctoral Researcher',
  'Other',
];

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    preferred_name: '',
    prefix: '',
    academic_title: '',
    affiliation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        preferred_name: formData.preferred_name || undefined,
        prefix: formData.prefix || undefined,
        academic_title: formData.academic_title || undefined,
        affiliation: formData.affiliation || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Registration successful!
              </h3>
              <p className="text-base text-gray-600">
                Please check your email to verify your account. You will be
                redirected to the login page...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-base text-gray-600">
            Join Hanyang Accounting Research Symposium
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-3 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger-800">{error}</p>
              </div>
            )}

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Required Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name *"
                    name="first_name"
                    type="text"
                    required
                    fullWidth
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                  />
                  <Input
                    label="Last Name *"
                    name="last_name"
                    type="text"
                    required
                    fullWidth
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </div>

                <Input
                  label="Affiliation *"
                  name="affiliation"
                  type="text"
                  required
                  fullWidth
                  value={formData.affiliation}
                  onChange={handleChange}
                  placeholder="University or Organization"
                />

                <Input
                  label="Email address *"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  fullWidth
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@university.edu"
                />

                <Input
                  label="Password *"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  fullWidth
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  helperText="Must be at least 8 characters with uppercase, lowercase, and a number"
                />

                <Input
                  label="Confirm Password *"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  fullWidth
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Optional Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Preferred Name"
                  name="preferred_name"
                  type="text"
                  fullWidth
                  value={formData.preferred_name}
                  onChange={handleChange}
                  placeholder="How you'd like to be addressed"
                  helperText="e.g., Johnny, J. Doe"
                />

                <div>
                  <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 mb-1">
                    Prefix
                  </label>
                  <select
                    id="prefix"
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select prefix...</option>
                    {PREFIX_OPTIONS.map((prefix) => (
                      <option key={prefix} value={prefix}>
                        {prefix}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="academic_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Title
                  </label>
                  <select
                    id="academic_title"
                    name="academic_title"
                    value={formData.academic_title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select academic title...</option>
                    {ACADEMIC_TITLE_OPTIONS.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
