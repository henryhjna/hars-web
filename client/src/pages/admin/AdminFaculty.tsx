import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
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
    bio: '',
    research_interests: [],
    publications: [],
    display_order: 0,
    is_active: true,
  });

  const [researchInterestInput, setResearchInterestInput] = useState('');
  const [publicationInput, setPublicationInput] = useState('');

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
      bio: '',
      research_interests: [],
      publications: [],
      display_order: 0,
      is_active: true,
    });
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
      bio: member.bio || '',
      research_interests: member.research_interests || [],
      publications: member.publications || [],
      display_order: member.display_order,
      is_active: member.is_active,
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (editingFaculty) {
        await facultyService.update(editingFaculty.id, formData);
        setSuccess('Faculty member updated successfully');
      } else {
        await facultyService.create(formData as CreateFacultyInput);
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

  const addPublication = () => {
    if (publicationInput.trim()) {
      setFormData({
        ...formData,
        publications: [...(formData.publications || []), publicationInput.trim()],
      });
      setPublicationInput('');
    }
  };

  const removePublication = (index: number) => {
    const updated = [...(formData.publications || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, publications: updated });
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
                    Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
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

              {/* Publications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publications
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={publicationInput}
                    onChange={(e) => setPublicationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPublication())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add publication..."
                  />
                  <Button type="button" onClick={addPublication} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.publications?.map((pub, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1 text-sm text-gray-700">{pub}</span>
                      <button
                        type="button"
                        onClick={() => removePublication(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
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
