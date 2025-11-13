import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventService from '../../services/event.service';
import pastEventsService from '../../services/pastEvents.service';
import type { Event, EventPhoto, KeynoteSpeaker, Testimonial } from '../../types';

type ContentTab = 'basic' | 'photos' | 'speakers' | 'testimonials' | 'stats';

export default function AdminEventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const isNewEvent = eventId === 'new';
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<ContentTab>('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data for each tab
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [speakers, setSpeakers] = useState<KeynoteSpeaker[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Form states
  const [photoForm, setPhotoForm] = useState({
    photo_file: null as File | null,
    caption: '',
    is_highlight: false,
    photo_order: 0,
  });

  const [speakerForm, setSpeakerForm] = useState({
    name: '',
    title: '',
    affiliation: '',
    bio: '',
    photo_url: '',
    topic: '',
    presentation_time: '',
    display_order: 0,
  });

  const [testimonialForm, setTestimonialForm] = useState({
    author_name: '',
    author_affiliation: '',
    testimonial_text: '',
    is_featured: false,
  });

  const [statsForm, setStatsForm] = useState<Record<string, string>>({});

  // Basic event info form
  const [basicForm, setBasicForm] = useState<{
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
  }>({
    title: '',
    description: '',
    event_date: '',
    location: '',
    venue_details: '',
    submission_start_date: '',
    submission_end_date: '',
    review_deadline: '',
    notification_date: '',
    program_announcement_date: '',
    registration_deadline: '',
    theme_color: '#3B82F6',
    banner_image_url: '',
    show_keynote: true,
    show_program: true,
    show_testimonials: true,
    show_photos: true,
    show_best_paper: true,
    status: 'upcoming',
  });

  useEffect(() => {
    if (eventId && !isNewEvent) {
      loadEvent();
      loadEventData();
    } else if (isNewEvent) {
      setLoading(false);
    }
  }, [eventId, isNewEvent]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(eventId!);
      const eventData = response.data;
      setEvent(eventData);

      // Initialize basic form with existing event data
      setBasicForm({
        title: eventData.title,
        description: eventData.description || '',
        event_date: eventData.event_date.split('T')[0],
        location: eventData.location || '',
        venue_details: eventData.venue_details || '',
        submission_start_date: eventData.submission_start_date.split('T')[0],
        submission_end_date: eventData.submission_end_date.split('T')[0],
        review_deadline: eventData.review_deadline?.split('T')[0] || '',
        notification_date: eventData.notification_date?.split('T')[0] || '',
        program_announcement_date: eventData.program_announcement_date?.split('T')[0] || '',
        registration_deadline: eventData.registration_deadline?.split('T')[0] || '',
        theme_color: eventData.theme_color,
        banner_image_url: eventData.banner_image_url || '',
        show_keynote: eventData.show_keynote,
        show_program: eventData.show_program,
        show_testimonials: eventData.show_testimonials,
        show_photos: eventData.show_photos,
        show_best_paper: eventData.show_best_paper,
        status: eventData.status,
      });

      // Initialize stats form with existing stats
      if (eventData.highlight_stats) {
        const statsObj: Record<string, string> = {};
        Object.entries(eventData.highlight_stats).forEach(([key, value]) => {
          statsObj[key] = String(value);
        });
        setStatsForm(statsObj);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async () => {
    if (!eventId) return;

    try {
      const [photosData, speakersData, testimonialsData] = await Promise.all([
        pastEventsService.getEventPhotos(eventId),
        pastEventsService.getEventSpeakers(eventId),
        pastEventsService.getEventTestimonials(eventId),
      ]);

      setPhotos(photosData);
      setSpeakers(speakersData);
      setTestimonials(testimonialsData);
    } catch (err) {
      console.error('Failed to load event data:', err);
    }
  };

  // Photo handlers
  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!photoForm.photo_file) {
      setError('Please select a photo file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('event_id', eventId!);
      formData.append('photo', photoForm.photo_file);
      formData.append('caption', photoForm.caption);
      formData.append('is_highlight', photoForm.is_highlight.toString());
      formData.append('photo_order', photoForm.photo_order.toString());

      await pastEventsService.createEventPhoto(eventId!, formData);
      setSuccess('Photo added successfully');
      setShowPhotoModal(false);
      resetPhotoForm();
      await loadEventData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add photo');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await pastEventsService.deleteEventPhoto(photoId);
      setSuccess('Photo deleted successfully');
      await loadEventData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  const resetPhotoForm = () => {
    setPhotoForm({
      photo_file: null,
      caption: '',
      is_highlight: false,
      photo_order: 0,
    });
  };

  // Speaker handlers
  const handleCreateSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await pastEventsService.createEventSpeaker(eventId!, speakerForm);
      setSuccess('Speaker added successfully');
      setShowSpeakerModal(false);
      resetSpeakerForm();
      await loadEventData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add speaker');
    }
  };

  const handleDeleteSpeaker = async (speakerId: string) => {
    if (!confirm('Are you sure you want to delete this speaker?')) return;

    try {
      await pastEventsService.deleteEventSpeaker(speakerId);
      setSuccess('Speaker deleted successfully');
      await loadEventData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete speaker');
    }
  };

  const resetSpeakerForm = () => {
    setSpeakerForm({
      name: '',
      title: '',
      affiliation: '',
      bio: '',
      photo_url: '',
      topic: '',
      presentation_time: '',
      display_order: 0,
    });
  };

  // Testimonial handlers
  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await pastEventsService.createEventTestimonial(eventId!, testimonialForm);
      setSuccess('Testimonial added successfully');
      setShowTestimonialModal(false);
      resetTestimonialForm();
      await loadEventData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add testimonial');
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await pastEventsService.deleteEventTestimonial(testimonialId);
      setSuccess('Testimonial deleted successfully');
      await loadEventData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete testimonial');
    }
  };

  const resetTestimonialForm = () => {
    setTestimonialForm({
      author_name: '',
      author_affiliation: '',
      testimonial_text: '',
      is_featured: false,
    });
  };

  // Basic info handlers
  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isNewEvent) {
        const response = await eventService.createEvent(basicForm);
        setSuccess('Event created successfully');
        // Redirect to the new event's edit page
        window.location.href = `/admin/events/${response.data.id}`;
      } else {
        await eventService.updateEvent(eventId!, basicForm);
        setSuccess('Event updated successfully');
        await loadEvent();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleBasicInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setBasicForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setBasicForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Stats handlers
  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Convert string values to numbers where appropriate
      const highlight_stats: Record<string, any> = {};
      Object.entries(statsForm).forEach(([key, value]) => {
        // Try to parse as number, otherwise keep as string
        const numValue = Number(value);
        highlight_stats[key] = isNaN(numValue) ? value : numValue;
      });

      await eventService.updateEvent(eventId!, { highlight_stats });
      setSuccess('Statistics updated successfully');
      setShowStatsModal(false);
      await loadEvent();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update statistics');
    }
  };

  const addStatField = () => {
    const key = prompt('Enter statistic name (e.g., "participants", "papers"):');
    if (key && !statsForm[key]) {
      setStatsForm({ ...statsForm, [key]: '' });
    }
  };

  const removeStatField = (key: string) => {
    const newStats = { ...statsForm };
    delete newStats[key];
    setStatsForm(newStats);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event && !isNewEvent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found</p>
        <Link to="/admin/events" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/events" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Events
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isNewEvent ? 'Create New Event' : event?.title || 'Loading...'}
        </h1>
        {!isNewEvent && event && (
          <>
            <p className="text-gray-600 mt-2">{event.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              {new Date(event.event_date).toLocaleDateString()} • {event.location}
            </div>
          </>
        )}
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

      {/* Content Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { key: 'basic' as ContentTab, label: 'Basic Info' },
              { key: 'photos' as ContentTab, label: `Photos (${photos.length})`, hide: isNewEvent },
              { key: 'speakers' as ContentTab, label: `Speakers (${speakers.length})`, hide: isNewEvent },
              { key: 'testimonials' as ContentTab, label: `Testimonials (${testimonials.length})`, hide: isNewEvent },
              { key: 'stats' as ContentTab, label: 'Highlight Stats', hide: isNewEvent },
            ].filter(tab => !tab.hide).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <form onSubmit={handleSaveBasicInfo} className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={basicForm.title}
                    onChange={handleBasicInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={basicForm.description}
                    onChange={handleBasicInputChange}
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
                    onChange={handleBasicInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status *</label>
                  <select
                    name="status"
                    value={basicForm.status}
                    onChange={handleBasicInputChange}
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
                    onChange={handleBasicInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue Details</label>
                  <input
                    type="text"
                    name="venue_details"
                    value={basicForm.venue_details}
                    onChange={handleBasicInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Submission Start Date *</label>
                  <input
                    type="date"
                    name="submission_start_date"
                    value={basicForm.submission_start_date}
                    onChange={handleBasicInputChange}
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
                    onChange={handleBasicInputChange}
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
                    onChange={handleBasicInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notification Date</label>
                  <input
                    type="date"
                    name="notification_date"
                    value={basicForm.notification_date}
                    onChange={handleBasicInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Program Announcement Date</label>
                  <input
                    type="date"
                    name="program_announcement_date"
                    value={basicForm.program_announcement_date}
                    onChange={handleBasicInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
                  <input
                    type="date"
                    name="registration_deadline"
                    value={basicForm.registration_deadline}
                    onChange={handleBasicInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Banner Image URL</label>
                  <input
                    type="text"
                    name="banner_image_url"
                    value={basicForm.banner_image_url}
                    onChange={handleBasicInputChange}
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
                          onChange={handleBasicInputChange}
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
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Event Photos</h2>
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Photo
                </button>
              </div>

              {photos.length === 0 ? (
                <p className="text-gray-600">No photos yet. Add your first photo!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || 'Event photo'}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {photo.is_highlight && (
                        <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Highlight
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      {photo.caption && (
                        <p className="mt-2 text-sm text-gray-600">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Speakers Tab */}
          {activeTab === 'speakers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Keynote Speakers</h2>
                <button
                  onClick={() => setShowSpeakerModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Speaker
                </button>
              </div>

              {speakers.length === 0 ? (
                <p className="text-gray-600">No speakers yet. Add your first speaker!</p>
              ) : (
                <div className="space-y-4">
                  {speakers.map((speaker) => (
                    <div key={speaker.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
                      {speaker.photo_url && (
                        <img
                          src={speaker.photo_url}
                          alt={speaker.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{speaker.name}</h3>
                        {speaker.title && <p className="text-sm text-gray-600">{speaker.title}</p>}
                        {speaker.affiliation && (
                          <p className="text-sm text-gray-600">{speaker.affiliation}</p>
                        )}
                        {speaker.topic && (
                          <p className="mt-2 text-sm font-medium">
                            Topic: {speaker.topic}
                          </p>
                        )}
                        {speaker.presentation_time && (
                          <p className="text-sm text-gray-600">Time: {speaker.presentation_time}</p>
                        )}
                        {speaker.bio && <p className="mt-2 text-sm text-gray-700">{speaker.bio}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteSpeaker(speaker.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 self-start"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Testimonials</h2>
                <button
                  onClick={() => setShowTestimonialModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Testimonial
                </button>
              </div>

              {testimonials.length === 0 ? (
                <p className="text-gray-600">No testimonials yet. Add your first testimonial!</p>
              ) : (
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className={`border rounded-lg p-4 ${
                        testimonial.is_featured ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {testimonial.is_featured && (
                        <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold mb-2">
                          Featured
                        </span>
                      )}
                      <p className="text-gray-700 italic">"{testimonial.testimonial_text}"</p>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          — {testimonial.author_name}
                          {testimonial.author_affiliation && `, ${testimonial.author_affiliation}`}
                        </p>
                        <button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Highlight Statistics</h2>
                <button
                  onClick={() => setShowStatsModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Statistics
                </button>
              </div>

              {event.highlight_stats && Object.keys(event.highlight_stats).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(event.highlight_stats).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900">{String(value)}</div>
                      <div className="text-sm text-gray-600 capitalize mt-1">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No statistics yet. Click "Edit Statistics" to add some!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Photo</h2>
            </div>
            <form onSubmit={handleCreatePhoto} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Photo File *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert('File size must be less than 2MB');
                        e.target.value = '';
                        return;
                      }
                      setPhotoForm({ ...photoForm, photo_file: file });
                    }
                  }}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">Max size: 2MB. Formats: JPEG, PNG, WebP</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Caption</label>
                <input
                  type="text"
                  value={photoForm.caption}
                  onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  value={photoForm.photo_order}
                  onChange={(e) =>
                    setPhotoForm({ ...photoForm, photo_order: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={photoForm.is_highlight}
                  onChange={(e) => setPhotoForm({ ...photoForm, is_highlight: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Mark as Highlight</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoModal(false);
                    resetPhotoForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Speaker Modal */}
      {showSpeakerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Speaker</h2>
            </div>
            <form onSubmit={handleCreateSpeaker} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  value={speakerForm.name}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={speakerForm.title}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Professor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Affiliation</label>
                <input
                  type="text"
                  value={speakerForm.affiliation}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, affiliation: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Hanyang University"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Photo URL</label>
                <input
                  type="url"
                  value={speakerForm.photo_url}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, photo_url: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Presentation Topic
                </label>
                <input
                  type="text"
                  value={speakerForm.topic}
                  onChange={(e) =>
                    setSpeakerForm({ ...speakerForm, topic: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Presentation Time
                </label>
                <input
                  type="text"
                  value={speakerForm.presentation_time}
                  onChange={(e) =>
                    setSpeakerForm({ ...speakerForm, presentation_time: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 10:00 AM - 11:00 AM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={speakerForm.bio}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, bio: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Order</label>
                <input
                  type="number"
                  value={speakerForm.display_order}
                  onChange={(e) =>
                    setSpeakerForm({ ...speakerForm, display_order: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSpeakerModal(false);
                    resetSpeakerForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Speaker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Testimonial</h2>
            </div>
            <form onSubmit={handleCreateTestimonial} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Author Name *</label>
                <input
                  type="text"
                  value={testimonialForm.author_name}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, author_name: e.target.value })
                  }
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Author Affiliation
                </label>
                <input
                  type="text"
                  value={testimonialForm.author_affiliation}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, author_affiliation: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Testimonial *</label>
                <textarea
                  value={testimonialForm.testimonial_text}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, testimonial_text: e.target.value })
                  }
                  required
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={testimonialForm.is_featured}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, is_featured: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Mark as Featured</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTestimonialModal(false);
                    resetTestimonialForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Highlight Statistics</h2>
            </div>
            <form onSubmit={handleUpdateStats} className="p-6 space-y-4">
              {Object.entries(statsForm).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setStatsForm({ ...statsForm, [key]: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStatField(key)}
                    className="mt-6 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addStatField}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                + Add Statistic
              </button>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStatsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Statistics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
