import { useState } from 'react';
import eventService from '../../../services/event.service';
import type { EventSession } from '../../../types';

interface ProgramTabProps {
  eventId: string;
  sessions: EventSession[];
  onReload: () => void;
}

export default function ProgramTab({
  eventId,
  sessions,
  onReload,
}: ProgramTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<EventSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<EventSession>>({
    session_title: '',
    session_type: '',
    session_date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    session_order: 0,
  });

  const handleAdd = () => {
    setEditingSession(null);
    setError('');
    setFormData({
      session_title: '',
      session_type: '',
      session_date: '',
      start_time: '',
      end_time: '',
      location: '',
      description: '',
      session_order: sessions.length,
    });
    setShowModal(true);
  };

  const handleEdit = (session: EventSession) => {
    setEditingSession(session);
    setError('');
    setFormData({
      session_title: session.session_title,
      session_type: session.session_type || '',
      session_date: session.session_date?.split('T')[0] || '',
      start_time: session.start_time || '',
      end_time: session.end_time || '',
      location: session.location || '',
      description: session.description || '',
      session_order: session.session_order || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingSession) {
        await eventService.updateSession(eventId, editingSession.id, formData);
      } else {
        await eventService.addSession(eventId, formData);
      }
      setShowModal(false);
      onReload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    setLoading(true);
    try {
      await eventService.deleteSession(eventId, sessionId);
      onReload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Program Schedule</h2>
          <p className="text-gray-600 mt-1">Manage event sessions and schedule</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500">No sessions added yet. Click "Add Session" to create your first session.</p>
        </button>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.session_date && new Date(session.session_date).toLocaleDateString()}
                    {session.start_time && (
                      <div className="text-gray-500">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{session.session_title}</div>
                    {session.description && (
                      <div className="text-gray-500 text-xs mt-1 line-clamp-2">{session.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.session_type || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.location || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(session)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {editingSession ? 'Edit Session' : 'Add New Session'}
              </h3>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    value={formData.session_title}
                    onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Type
                    </label>
                    <select
                      value={formData.session_type}
                      onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select type...</option>
                      <option value="Keynote">Keynote</option>
                      <option value="Panel">Panel Discussion</option>
                      <option value="Paper Presentation">Paper Presentation</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Break">Break</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Reception">Reception</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Room 301"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.session_date}
                      onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Optional session description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.session_order}
                    onChange={(e) => setFormData({ ...formData, session_order: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (editingSession ? 'Update Session' : 'Add Session')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
