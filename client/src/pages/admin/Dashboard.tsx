import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/event.service';
import submissionService from '../../services/submission.service';
import type { Event, Submission } from '../../types';

interface Stats {
  totalEvents: number;
  upcomingEvents: number;
  totalSubmissions: number;
  pendingReview: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalSubmissions: 0,
    pendingReview: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load events
      const eventsResponse = await eventService.getAllEvents();
      const events = eventsResponse.data || [];

      // Load submissions (admin endpoint - we'll need to add this)
      // For now, we'll just show a placeholder
      const totalEvents = events.length;
      const upcomingEvents = events.filter((e: Event) => e.status === 'upcoming').length;

      setStats({
        totalEvents,
        upcomingEvents,
        totalSubmissions: 0, // TODO: Add admin endpoint
        pendingReview: 0, // TODO: Add admin endpoint
      });

      setRecentSubmissions([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.upcomingEvents}</p>
            </div>
            <div className="text-4xl">🔜</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSubmissions}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingReview}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/events"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-3xl mr-4">➕</span>
            <div>
              <p className="font-medium text-gray-900">Create Event</p>
              <p className="text-sm text-gray-500">Add a new symposium event</p>
            </div>
          </Link>

          <Link
            to="/admin/submissions"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-3xl mr-4">📋</span>
            <div>
              <p className="font-medium text-gray-900">View Submissions</p>
              <p className="text-sm text-gray-500">Manage all submissions</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-3xl mr-4">👥</span>
            <div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">View and manage users</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Submissions</h2>
        </div>
        <div className="p-6">
          {recentSubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent submissions</p>
          ) : (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{submission.title}</p>
                    <p className="text-sm text-gray-500">
                      {submission.event_title} • {submission.corresponding_author}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {submission.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
