import { Link } from 'react-router-dom';
import type { Event } from '../../../types';

interface BasicInfoTabProps {
  isNewEvent: boolean;
  basicForm: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    submission_start_date: string;
    submission_end_date: string;
    review_deadline: string;
    notification_date: string;
    program_announcement_date: string;
    registration_deadline: string;
    theme_color: string;
    banner_image_url: string;
    show_overview: boolean;
    show_practitioner_sessions: boolean;
    show_submission_guidelines: boolean;
    show_awards: boolean;
    show_committees: boolean;
    show_venue: boolean;
    show_keynote: boolean;
    show_photos: boolean;
    show_testimonials: boolean;
    status: Event['status'];
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BasicInfoTab({
  isNewEvent,
  basicForm,
  onInputChange,
  onSubmit,
}: BasicInfoTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Event Title *</label>
          <input
            type="text"
            name="title"
            value={basicForm.title}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={basicForm.description}
            onChange={onInputChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Event Date *</label>
          <input
            type="date"
            name="event_date"
            value={basicForm.event_date}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status *</label>
          <select
            name="status"
            value={basicForm.status}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={basicForm.location}
            onChange={onInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Submission Start Date *</label>
          <input
            type="date"
            name="submission_start_date"
            value={basicForm.submission_start_date}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Submission End Date *</label>
          <input
            type="date"
            name="submission_end_date"
            value={basicForm.submission_end_date}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Review Deadline</label>
          <input
            type="date"
            name="review_deadline"
            value={basicForm.review_deadline}
            onChange={onInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notification Date</label>
          <input
            type="date"
            name="notification_date"
            value={basicForm.notification_date}
            onChange={onInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Program Announcement Date</label>
          <input
            type="date"
            name="program_announcement_date"
            value={basicForm.program_announcement_date}
            onChange={onInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
          <input
            type="date"
            name="registration_deadline"
            value={basicForm.registration_deadline}
            onChange={onInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Link
          to="/admin/events"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isNewEvent ? 'Create Event' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
