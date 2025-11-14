import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/event.service';
import submissionService from '../services/submission.service';
import type { Event } from '../types';

export default function SubmitPaper() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState({
    event_id: '',
    title: '',
    abstract: '',
    keywords: '',
    corresponding_author: '',
    co_authors: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState('');

  // Check if submission is open for selected event
  const isSubmissionOpen = (event: Event | null): boolean => {
    if (!event) return false;
    const now = new Date();
    const startDate = new Date(event.submission_start_date);
    const endDate = new Date(event.submission_end_date);
    return now >= startDate && now <= endDate;
  };

  const getSubmissionStatus = (event: Event | null): { message: string; type: 'info' | 'warning' | 'error' } => {
    if (!event) return { message: '', type: 'info' };

    const now = new Date();
    const startDate = new Date(event.submission_start_date);
    const endDate = new Date(event.submission_end_date);

    if (now < startDate) {
      return {
        message: `Submission will open on ${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        type: 'warning'
      };
    }

    if (now > endDate) {
      return {
        message: `Submission deadline has passed (${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})`,
        type: 'error'
      };
    }

    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      message: `Submission is open! Deadline: ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (${daysLeft} days left)`,
      type: 'info'
    };
  };

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getUpcomingEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = e.target.value;
    setFormData((prev) => ({ ...prev, event_id: eventId }));
    const selected = events.find((ev) => ev.id === eventId) || null;
    setSelectedEvent(selected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPdfError('');

    if (!file) {
      setPdfFile(null);
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file');
      setPdfFile(null);
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setPdfError('File size must be less than 10MB');
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.event_id) {
      setError('Please select an event');
      return;
    }

    if (!pdfFile) {
      setError('Please upload a PDF file');
      return;
    }

    try {
      setSubmitting(true);

      const keywordsArray = formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const response = await submissionService.createSubmission({
        event_id: formData.event_id,
        title: formData.title,
        abstract: formData.abstract,
        keywords: keywordsArray,
        corresponding_author: formData.corresponding_author,
        co_authors: formData.co_authors || undefined,
        pdf: pdfFile,
      });

      if (response.success) {
        setSuccess('Paper submitted successfully!');
        setTimeout(() => {
          navigate('/my-submissions');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit paper');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Upcoming Events</h2>
            <p className="text-gray-600 mb-6">
              There are currently no events accepting submissions.
            </p>
            <button
              onClick={() => navigate('/events')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View All Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Paper</h2>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Selection */}
            <div>
              <label htmlFor="event_id" className="block text-sm font-medium text-gray-700">
                Select Event *
              </label>
              <select
                id="event_id"
                name="event_id"
                value={formData.event_id}
                onChange={handleEventChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select an Event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {new Date(event.event_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {selectedEvent && (
                <div
                  className={`mt-2 p-3 rounded-md ${
                    getSubmissionStatus(selectedEvent).type === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : getSubmissionStatus(selectedEvent).type === 'warning'
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {getSubmissionStatus(selectedEvent).message}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Paper Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Abstract */}
            <div>
              <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
                Abstract *
              </label>
              <textarea
                id="abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleInputChange}
                required
                rows={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Keywords */}
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                Keywords *
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                required
                placeholder="Separate keywords with commas (e.g., accounting, research, finance)"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Corresponding Author */}
            <div>
              <label
                htmlFor="corresponding_author"
                className="block text-sm font-medium text-gray-700"
              >
                Corresponding Author *
              </label>
              <input
                type="text"
                id="corresponding_author"
                name="corresponding_author"
                value={formData.corresponding_author}
                onChange={handleInputChange}
                required
                placeholder="Full name and email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Co-authors */}
            <div>
              <label htmlFor="co_authors" className="block text-sm font-medium text-gray-700">
                Co-authors (Optional)
              </label>
              <input
                type="text"
                id="co_authors"
                name="co_authors"
                value={formData.co_authors}
                onChange={handleInputChange}
                placeholder="Full names, separated by commas"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* PDF Upload */}
            <div>
              <label htmlFor="pdf" className="block text-sm font-medium text-gray-700">
                Upload PDF *
              </label>
              <input
                type="file"
                id="pdf"
                name="pdf"
                accept=".pdf"
                onChange={handleFileChange}
                required
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {pdfError && <p className="mt-1 text-sm text-red-600">{pdfError}</p>}
              {pdfFile && (
                <p className="mt-1 text-sm text-gray-600">
                  Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 10MB. Only PDF files are accepted.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/events')}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isSubmissionOpen(selectedEvent)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Paper'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
