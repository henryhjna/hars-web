import { useEffect, useState } from 'react';
import eventService from '../services/event.service';
import type { Event } from '../types';

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getUpcomingEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError(response.error || 'Failed to load events');
      }
    } catch (err) {
      setError('An error occurred while loading events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="text-gray-600">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>

      {events.length === 0 ? (
        <div className="mt-8">
          <p className="text-gray-600">No upcoming events at this time.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white shadow-sm rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>

                  {event.description && (
                    <p className="mt-2 text-gray-600">{event.description}</p>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-32">Event Date:</span>
                      <span className="text-gray-600">{formatDate(event.event_date)}</span>
                    </div>

                    {event.location && (
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 w-32">Location:</span>
                        <span className="text-gray-600">{event.location}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-32">Submission Deadline:</span>
                      <span className="text-gray-600">
                        {formatDate(event.submission_end_date)}
                      </span>
                    </div>

                    {event.notification_date && (
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 w-32">Notification Date:</span>
                        <span className="text-gray-600">
                          {formatDate(event.notification_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${event.theme_color}20`,
                      color: event.theme_color,
                    }}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
