import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building2, GraduationCap, Edit2, FileText, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/user.service';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function MyPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return '';
    const prefix = user.prefix ? `${user.prefix} ` : '';
    const name = user.preferred_name || `${user.first_name} ${user.last_name}`;
    return `${prefix}${name}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card variant="elevated" className="text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={loadUserProfile}>Try Again</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Manage your personal information and account settings</p>
        </div>

        {/* Profile Card */}
        <Card variant="elevated" className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={getFullName()}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center border-4 border-primary-100">
                  <span className="text-3xl font-bold text-white">
                    {getInitials(user.first_name, user.last_name)}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{getFullName()}</h2>
                  <p className="text-gray-600 mt-1">{user.email}</p>
                  {user.academic_title && (
                    <p className="text-gray-600 mt-1">{user.academic_title}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/my-page/edit')}
                    variant="primary"
                    size="md"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Roles */}
              <div className="mt-4 flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge
                    key={role}
                    variant={
                      role === 'admin'
                        ? 'gradient'
                        : role === 'reviewer'
                        ? 'accent'
                        : 'primary'
                    }
                    size="sm"
                    rounded
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card variant="default">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Legal Name</label>
                <p className="text-gray-900 mt-1">
                  {user.first_name} {user.last_name}
                </p>
              </div>

              {user.preferred_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Preferred Name</label>
                  <p className="text-gray-900 mt-1">{user.preferred_name}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{user.email}</p>
                  {user.is_email_verified && (
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          <Card variant="default">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
            </div>

            <div className="space-y-4">
              {user.affiliation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Affiliation</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{user.affiliation}</p>
                  </div>
                </div>
              )}

              {user.academic_title && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Academic Title</label>
                  <p className="text-gray-900 mt-1">{user.academic_title}</p>
                </div>
              )}

              {!user.affiliation && !user.academic_title && (
                <p className="text-gray-500 text-sm italic">
                  No academic information provided. Click "Edit Profile" to add details.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card variant="default" hoverable onClick={() => navigate('/my-submissions')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Submissions</h3>
                <p className="text-sm text-gray-600">View and manage your paper submissions</p>
              </div>
            </div>
          </Card>

          <Card variant="default" hoverable onClick={() => navigate('/my-page/change-password')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-100 rounded-lg">
                <Lock className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Details */}
        <Card variant="default" className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-500">Account Created</label>
              <p className="text-gray-900 mt-1">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <label className="text-gray-500">User ID</label>
              <p className="text-gray-900 mt-1 font-mono text-xs">{user.id}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
