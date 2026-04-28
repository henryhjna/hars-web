import { useEffect, useState } from 'react';
import registrationService from '../../services/registration.service';
import eventService from '../../services/event.service';
import LoadingState from '../../components/admin/LoadingState';
import MessageBanners from '../../components/admin/MessageBanners';
import PaginationFooter from '../../components/admin/PaginationFooter';
import ViewModeToggle from '../../components/admin/ViewModeToggle';
import StatsCardRow from '../../components/admin/StatsCardRow';
import { useResponsiveViewMode } from '../../hooks/useResponsiveViewMode';
import type { Event, Registration, RegistrationStatus } from '../../types';

interface RegStats {
  total: number;
  registered: number;
  cancelled: number;
  lunch?: number;
  dinner?: number;
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<RegStats>({ total: 0, registered: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [viewMode, setViewMode] = useResponsiveViewMode();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const limit = 20;

  const [editing, setEditing] = useState<Registration | null>(null);
  const [editStatus, setEditStatus] = useState<RegistrationStatus>('registered');
  const [editLunch, setEditLunch] = useState(false);
  const [editDinner, setEditDinner] = useState(false);

  useEffect(() => {
    void loadData();
  }, [currentPage, selectedEvent, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const filters: { eventId?: string; status?: string } = {};
      if (selectedEvent !== 'all') filters.eventId = selectedEvent;
      if (selectedStatus !== 'all') filters.status = selectedStatus;

      const statsPromise = selectedEvent === 'all'
        ? registrationService.getOverallStats()
        : registrationService.getEventStats(selectedEvent);

      const [regsResponse, eventsResponse, statsResponse] = await Promise.all([
        registrationService.getAllRegistrations(currentPage, limit, filters),
        eventService.getAllEvents(),
        statsPromise,
      ]);

      setRegistrations(regsResponse.data || []);
      setTotalPages(regsResponse.pagination.totalPages);
      setTotalRegistrations(regsResponse.pagination.total);
      setEvents(eventsResponse.data || []);
      if (statsResponse.data) setStats(statsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type: 'event' | 'status', value: string) => {
    setCurrentPage(1);
    if (type === 'event') setSelectedEvent(value);
    else setSelectedStatus(value);
  };

  const openEdit = (r: Registration) => {
    setEditing(r);
    setEditStatus(r.status);
    setEditLunch(r.lunch);
    setEditDinner(r.dinner);
  };

  const closeEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      setError('');
      await registrationService.updateRegistration(editing.id, {
        status: editStatus,
        lunch: editLunch,
        dinner: editDinner,
      });
      setSuccess('Registration updated');
      closeEdit();
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleResend = async (r: Registration) => {
    try {
      setError('');
      await registrationService.resendConfirmation(r.id);
      setSuccess('Confirmation email sent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
    }
  };

  const handleDelete = async (r: Registration) => {
    if (!window.confirm(`Delete registration for ${r.first_name} ${r.last_name}? This is irreversible.`)) return;
    try {
      setError('');
      await registrationService.deleteRegistration(r.id);
      setSuccess('Registration deleted');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleExportCsv = async () => {
    if (selectedEvent === 'all') {
      setError('Choose a specific event to export');
      return;
    }
    const evt = events.find((e) => e.id === selectedEvent);
    if (!evt) return;
    try {
      await registrationService.downloadEventCsv(evt.id, evt.title);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download CSV');
    }
  };

  const statusBadge = (status: RegistrationStatus) =>
    status === 'registered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700';

  if (loading) {
    return <LoadingState label="Loading registrations..." />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Registrations</h1>
        <div className="flex items-center gap-2">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleExportCsv}
            disabled={selectedEvent === 'all'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={selectedEvent === 'all' ? 'Select a specific event to enable CSV export' : 'Export CSV'}
          >
            Export CSV
          </button>
        </div>
      </div>

      <MessageBanners error={error} success={success} />

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => handleFilterChange('event', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="registered">Registered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No registrations found</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lunch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dinner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{r.first_name} {r.last_name}</div>
                      <div className="text-sm text-gray-500">{r.email}</div>
                      {r.affiliation && <div className="text-xs text-gray-500">{r.affiliation}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{r.event_title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.lunch ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.dinner ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-900" title="Edit">Edit</button>
                        <button onClick={() => handleResend(r)} className="text-purple-600 hover:text-purple-900" title="Resend confirmation">Resend</button>
                        <button onClick={() => handleDelete(r)} className="text-red-600 hover:text-red-900" title="Delete">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{r.first_name} {r.last_name}</h3>
                  <p className="text-sm text-gray-500">{r.email}</p>
                  {r.affiliation && <p className="text-xs text-gray-500">{r.affiliation}</p>}
                  <p className="text-sm text-gray-700 mt-1">{r.event_title}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${statusBadge(r.status)}`}>
                  {r.status}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-3">
                Lunch: {r.lunch ? 'Yes' : 'No'} · Dinner: {r.dinner ? 'Yes' : 'No'} · Registered: {new Date(r.created_at).toLocaleDateString()}
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                <button onClick={() => openEdit(r)} className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Edit</button>
                <button onClick={() => handleResend(r)} className="flex-1 px-3 py-2 text-sm text-purple-600 bg-purple-50 rounded hover:bg-purple-100">Resend</button>
                <button onClick={() => handleDelete(r)} className="flex-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationFooter
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalRegistrations}
        itemLabel="registrations"
        onPageChange={setCurrentPage}
      />

      <StatsCardRow
        stats={
          selectedEvent === 'all'
            ? [
                { label: 'Total', value: stats.total },
                { label: 'Registered', value: stats.registered, color: 'text-green-600' },
                { label: 'Cancelled', value: stats.cancelled, color: 'text-gray-600' },
              ]
            : [
                { label: 'Registered', value: stats.registered, color: 'text-green-600' },
                { label: 'Cancelled', value: stats.cancelled, color: 'text-gray-600' },
                { label: 'Lunch', value: stats.lunch ?? 0, color: 'text-blue-600' },
                { label: 'Dinner', value: stats.dinner ?? 0, color: 'text-blue-600' },
              ]
        }
      />

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Registration</h2>
              <p className="text-sm text-gray-600 mt-1">{editing.first_name} {editing.last_name}</p>
              <p className="text-xs text-gray-500">{editing.event_title}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as RegistrationStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="registered">Registered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editLunch}
                  onChange={(e) => setEditLunch(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-900">Attending lunch</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editDinner}
                  onChange={(e) => setEditDinner(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-900">Attending dinner</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
