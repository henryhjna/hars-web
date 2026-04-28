import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import registrationService from '../services/registration.service';
import type { Registration } from '../types';
import { formatLocalDate } from '../utils/dateUtils';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await registrationService.getMyRegistrations();
      setRegistrations(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      setError('');
      await registrationService.cancelRegistration(id);
      setSuccess('Registration cancelled');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel registration');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-600">Loading registrations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Registrations</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">{success}</div>
      )}

      {registrations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">You have no registrations yet.</p>
          <Link to="/upcoming-events" className="text-blue-600 hover:text-blue-800">
            Browse upcoming events
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{r.event_title}</h3>
                  {r.event_date && (
                    <p className="text-sm text-gray-600">{formatLocalDate(r.event_date)}</p>
                  )}
                  <div className="text-sm text-gray-700 mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${r.status === 'registered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {r.status}
                    </span>
                    Lunch: {r.lunch ? 'Yes' : 'No'} · Dinner: {r.dinner ? 'Yes' : 'No'}
                  </div>
                </div>
                {r.status === 'registered' && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
