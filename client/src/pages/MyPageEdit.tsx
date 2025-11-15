import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/user.service';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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

export default function MyPageEdit() {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    first_name: authUser?.first_name || '',
    last_name: authUser?.last_name || '',
    preferred_name: authUser?.preferred_name || '',
    prefix: authUser?.prefix || '',
    academic_title: authUser?.academic_title || '',
    affiliation: authUser?.affiliation || '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(authUser?.photo_url || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Photo size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Photo must be JPEG, PNG, or WebP');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    try {
      setUploadingPhoto(true);
      const response = await userService.deletePhoto();
      if (response.success && response.data) {
        updateUser(response.data);
        setPhotoPreview('');
        setPhotoFile(null);
        setSuccess('Profile photo deleted successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return;
    }

    try {
      setLoading(true);

      // Upload photo first if selected
      if (photoFile) {
        setUploadingPhoto(true);
        const photoResponse = await userService.uploadPhoto(photoFile);
        if (photoResponse.success && photoResponse.data) {
          updateUser(photoResponse.data.user);
          setPhotoPreview(photoResponse.data.photo_url);
          setPhotoFile(null);
        }
        setUploadingPhoto(false);
      }

      // Prepare update data (remove empty strings)
      const updateData: any = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        preferred_name: formData.preferred_name.trim() || null,
        prefix: formData.prefix || null,
        academic_title: formData.academic_title || null,
        affiliation: formData.affiliation.trim() || null,
      };

      const response = await userService.updateMe(updateData);

      if (response.success && response.data) {
        setSuccess('Profile updated successfully!');
        // Update auth context
        updateUser(response.data);
        // Redirect after 1 second
        setTimeout(() => {
          navigate('/my-page');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/my-page');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-2 text-gray-600">Update your personal and academic information</p>
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

            {/* Profile Photo Section */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h3>
              <div className="flex items-center gap-6">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  {formData.photo_url ? (
                    <img
                      src={formData.photo_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center border-4 border-primary-100">
                      <span className="text-3xl font-bold text-white">
                        {getInitials(formData.first_name, formData.last_name)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Photo URL Input */}
                <div className="flex-1">
                  <Input
                    name="photo_url"
                    label="Photo URL"
                    type="url"
                    value={formData.photo_url}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    helperText="Enter a URL to your profile photo (S3 upload coming soon)"
                    fullWidth
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="prefix"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Prefix
                    </label>
                    <select
                      id="prefix"
                      name="prefix"
                      value={formData.prefix}
                      onChange={handleChange}
                      className="block w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400"
                    >
                      <option value="">None</option>
                      {PREFIX_OPTIONS.map((prefix) => (
                        <option key={prefix} value={prefix}>
                          {prefix}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      name="first_name"
                      label="First Name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      fullWidth
                    />
                  </div>
                </div>

                <Input
                  name="last_name"
                  label="Last Name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  name="preferred_name"
                  label="Preferred Name"
                  type="text"
                  value={formData.preferred_name}
                  onChange={handleChange}
                  placeholder="Optional - how you'd like to be addressed"
                  helperText="If different from your legal name"
                  fullWidth
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
              <div className="space-y-4">
                <Input
                  name="affiliation"
                  label="Affiliation"
                  type="text"
                  value={formData.affiliation}
                  onChange={handleChange}
                  placeholder="e.g., Hanyang University"
                  helperText="Your institution or organization"
                  fullWidth
                />

                <div>
                  <label
                    htmlFor="academic_title"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Academic Title
                  </label>
                  <select
                    id="academic_title"
                    name="academic_title"
                    value={formData.academic_title}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400"
                  >
                    <option value="">Select a title (optional)</option>
                    {ACADEMIC_TITLE_OPTIONS.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>
        </form>

        {/* Help Text */}
        <Card variant="default" className="mt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Profile Photo Upload</h4>
              <p className="text-sm text-gray-600">
                Currently, you can provide a URL to your profile photo. Direct file upload to S3
                will be available soon. You can use services like Imgur or your institution's
                website to host your photo.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
