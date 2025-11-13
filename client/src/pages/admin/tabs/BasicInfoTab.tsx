import { Link } from 'react-router-dom';
import type { Event } from '../../../types';

interface BasicInfoTabProps {
  isNewEvent: boolean;
  basicForm: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    venue_details: string;
    submission_start_date: string;
    submission_end_date: string;
    review_deadline: string;
    notification_date: string;
    program_announcement_date: string;
    registration_deadline: string;
    theme_color: string;
    banner_image_url: string;
    show_keynote: boolean;
    show_program: boolean;
    show_testimonials: boolean;
    show_photos: boolean;
    show_best_paper: boolean;
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
          <label className="block text-sm font-medium text-gray-700">Venue Details</label>
          <input
            type="text"
            name="venue_details"
            value={basicForm.venue_details}
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Banner Image URL</label>
          <input
            type="text"
            name="banner_image_url"
            value={basicForm.banner_image_url}
            onChange={onInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="https://example.com/banner.jpg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">Display Options</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'show_keynote', label: 'Show Keynote Speakers' },
              { name: 'show_program', label: 'Show Program' },
              { name: 'show_testimonials', label: 'Show Testimonials' },
              { name: 'show_photos', label: 'Show Photos' },
              { name: 'show_best_paper', label: 'Show Best Paper' },
            ].map((option) => (
              <div key={option.name} className="flex items-center">
                <input
                  type="checkbox"
                  name={option.name}
                  checked={basicForm[option.name as keyof typeof basicForm] as boolean}
                  onChange={onInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">{option.label}</label>
              </div>
            ))}
          </div>
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
