import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import eventService from '../services/event.service';
import registrationService from '../services/registration.service';
import type { Event } from '../types';
import { formatLocalDate, parseLocalDate } from '../utils/dateUtils';

export default function EventRegister() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setError('Missing event id');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const response = await eventService.getEventById(eventId);
        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setError('Event not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  const registrationStatus = (e: Event | null): { ok: boolean; message: string } => {
    if (!e) return { ok: false, message: 'Event not loaded' };
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDay = parseLocalDate(e.event_date);
    if (today > eventDay) {
      return { ok: false, message: 'This event has already occurred.' };
    }
    if (e.registration_deadline) {
      const deadline = new Date(e.registration_deadline);
      if (now > deadline) {
        return {
          ok: false,
          message: `Registration deadline passed (${formatLocalDate(e.registration_deadline)})`,
        };
      }
      return {
        ok: true,
        message: `Registration deadline: ${formatLocalDate(e.registration_deadline)}`,
      };
    }
    return { ok: true, message: 'Registration is open.' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setError('');
    setSubmitting(true);
    try {
      await registrationService.createRegistration({
        event_id: event.id,
        lunch,
        dinner,
      });
      navigate('/my-registrations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-gray-600">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  const status = registrationStatus(event);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Register for Event</h1>
      <p className="text-gray-600 mb-6">{event.title}</p>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-2 text-sm text-gray-700">
          <div><strong>Date:</strong> {formatLocalDate(event.event_date)}</div>
          {event.location && <div><strong>Location:</strong> {event.location}</div>}
          <div className={status.ok ? 'text-blue-700' : 'text-red-700'}>
            {status.message}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Meals</p>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={lunch}
              onChange={(e) => setLunch(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
            />
            <span className="text-sm text-gray-900">I will attend the lunch</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={dinner}
              onChange={(e) => setDinner(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
            />
            <span className="text-sm text-gray-900">I will attend the dinner</span>
          </label>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={!status.ok || submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
