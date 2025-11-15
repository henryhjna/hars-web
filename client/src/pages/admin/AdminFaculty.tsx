import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import facultyService from '../../services/faculty.service';
import type { FacultyMember, CreateFacultyInput, UpdateFacultyInput } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);

  const [formData, setFormData] = useState<CreateFacultyInput | UpdateFacultyInput>({
    name: '',
    title: '',
    email: '',
    phone: '',
    office_location: '',
    photo_url: '',
    profile_url: '',
    bio: '',
    research_interests: [],
    display_order: 0,
    is_active: true,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [researchInterestInput, setResearchInterestInput] = useState('');

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await facultyService.getAll(false);
      setFaculty(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load faculty members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      title: '',
      email: '',
      phone: '',
      office_location: '',
      photo_url: '',
      profile_url: '',
      bio: '',
      research_interests: [],
      display_order: 0,
      is_active: true,
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setShowModal(true);
  };

  const handleEdit = (member: FacultyMember) => {
    setEditingFaculty(member);
    setFormData({
      name: member.name,
      title: member.title,
      email: member.email || '',
      phone: member.phone || '',
      office_location: member.office_location || '',
      photo_url: member.photo_url || '',
      profile_url: member.profile_url || '',
      bio: member.bio || '',
      research_interests: member.research_interests || [],
      display_order: member.display_order,
      is_active: member.is_active,
    });
    setPhotoPreview(member.photo_url || '');
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      setError('');
      setSuccess('');
      await facultyService.delete(id);
      setSuccess('Faculty member deleted successfully');
      await loadFaculty();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete faculty member');
    }
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
    if (editingFaculty && editingFaculty.photo_url) {
      if (!confirm('Are you sure you want to delete this photo?')) {
        return;
      }

      try {
        setUploadingPhoto(true);
        const response = await facultyService.deletePhoto(editingFaculty.id);
        if (response.success && response.data) {
          setPhotoPreview('');
          setPhotoFile(null);
          setFormData({ ...formData, photo_url: '' });
          setSuccess('Photo deleted successfully');
          await loadFaculty();
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete photo');
      } finally {
        setUploadingPhoto(false);
      }
    } else {
      // Just clear preview for new faculty or if no photo exists
      setPhotoPreview('');
      setPhotoFile(null);
      setFormData({ ...formData, photo_url: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      // Upload photo first if selected
      let photoUrl = formData.photo_url;
      if (photoFile && editingFaculty) {
        setUploadingPhoto(true);
        const photoResponse = await facultyService.uploadPhoto(editingFaculty.id, photoFile);
        if (photoResponse.success && photoResponse.data) {
          photoUrl = photoResponse.data.photo_url;
        }
        setUploadingPhoto(false);
        setPhotoFile(null);
      }

      const submitData = {
        ...formData,
        photo_url: photoUrl,
      };

      if (editingFaculty) {
        await facultyService.update(editingFaculty.id, submitData);
        setSuccess('Faculty member updated successfully');
      } else {
        const createdMember = await facultyService.create(submitData as CreateFacultyInput);
        // If photo was selected for new member, upload it now
        if (photoFile && createdMember.data) {
          setUploadingPhoto(true);
          await facultyService.uploadPhoto(createdMember.data.id, photoFile);
          setUploadingPhoto(false);
        }
        setSuccess('Faculty member created successfully');
      }

      setShowModal(false);
      await loadFaculty();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save faculty member');
    }
  };

  const addResearchInterest = () => {
    if (researchInterestInput.trim()) {
      setFormData({
        ...formData,
        research_interests: [...(formData.research_interests || []), researchInterestInput.trim()],
      });
      setResearchInterestInput('');
    }
  };

  const removeResearchInterest = (index: number) => {
    const updated = [...(formData.research_interests || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, research_interests: updated });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading faculty members...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Faculty</h1>
        <Button onClick={handleCreate} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Faculty Member
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {success}
        </div>
      )}

      {/* Faculty List */}
      <div className="grid grid-cols-1 gap-6">
        {faculty.map((member) => (
          <Card key={member.id} variant="elevated" padding="lg">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                {/* Photo */}
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">
                      {getInitials(member.name)}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    {!member.is_active && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{member.title}</p>
                  {member.email && (
                    <p className="text-sm text-gray-500">Email: {member.email}</p>
                  )}
                  {member.phone && (
                    <p className="text-sm text-gray-500">Phone: {member.phone}</p>
                  )}
                  {member.office_location && (
                    <p className="text-sm text-gray-500">Office: {member.office_location}</p>
                  )}
                  {member.bio && (
                    <p className="mt-3 text-gray-700 line-clamp-2">{member.bio}</p>
                  )}
                  {member.research_interests && member.research_interests.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Research Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {member.research_interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button onClick={() => handleEdit(member)} variant="outline" size="sm">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleDelete(member.id)} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {faculty.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No faculty members found. Click "Add Faculty Member" to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingFaculty ? 'Edit Faculty Member' : 'Add Faculty Member'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Profile Photo Section */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h3>
                <div className="flex items-center gap-6">
                  {/* Photo Preview */}
                  <div className="flex-shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center border-4 border-primary-100">
                        <span className="text-3xl font-bold text-white">
                          {formData.name ? getInitials(formData.name) : '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Photo Upload Controls */}
                  <div className="flex-1">
                    <div className="flex gap-3 mb-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingPhoto}
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.parentElement?.querySelector('input');
                            input?.click();
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                        </Button>
                      </label>
                      {photoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePhotoDelete}
                          disabled={uploadingPhoto}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      JPEG, PNG, or WebP. Max size 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={formData.office_location}
                    onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.profile_url}
                    onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/faculty/profile"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    External URL to detailed faculty profile page
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief biography..."
                />
              </div>

              {/* Research Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Research Interests
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={researchInterestInput}
                    onChange={(e) => setResearchInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResearchInterest())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add research interest..."
                  />
                  <Button type="button" onClick={addResearchInterest} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.research_interests?.map((interest, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeResearchInterest(idx)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={uploadingPhoto}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingFaculty ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
