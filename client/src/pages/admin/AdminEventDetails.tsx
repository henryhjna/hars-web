import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventService from '../../services/event.service';
import pastEventsService from '../../services/pastEvents.service';
import type { Event, EventPhoto, KeynoteSpeaker, Testimonial, EventContent, CommitteeMember, EventSession } from '../../types';

// Import tab components
import BasicInfoTab from './tabs/BasicInfoTab';
import ContentTab from './tabs/ContentTab';
import ProgramTab from './tabs/ProgramTab';
import MediaTab from './tabs/MediaTab';
import DisplayTab from './tabs/DisplayTab';

type ContentTab = 'basic' | 'content' | 'program' | 'media' | 'display';

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
  const [sessions, setSessions] = useState<EventSession[]>([]);

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

  // Event content form
  const [contentForm, setContentForm] = useState<EventContent>({
    overview: '',
    practitioner_sessions: '',
    submission_guidelines: '',
    awards: '',
    academic_committee: [],
    organizing_committee: [],
  });

  // Basic event info form
  const [basicForm, setBasicForm] = useState<{
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
  }>({
    title: '',
    description: '',
    event_date: '',
    location: '',
    submission_start_date: '',
    submission_end_date: '',
    review_deadline: '',
    notification_date: '',
    program_announcement_date: '',
    registration_deadline: '',
    theme_color: '#3B82F6',
    banner_image_url: '',
    show_overview: true,
    show_practitioner_sessions: true,
    show_submission_guidelines: true,
    show_awards: true,
    show_committees: true,
    show_venue: true,
    show_keynote: true,
    show_photos: true,
    show_testimonials: true,
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
        submission_start_date: eventData.submission_start_date.split('T')[0],
        submission_end_date: eventData.submission_end_date.split('T')[0],
        review_deadline: eventData.review_deadline?.split('T')[0] || '',
        notification_date: eventData.notification_date?.split('T')[0] || '',
        program_announcement_date: eventData.program_announcement_date?.split('T')[0] || '',
        registration_deadline: eventData.registration_deadline?.split('T')[0] || '',
        theme_color: eventData.theme_color,
        banner_image_url: eventData.banner_image_url || '',
        show_overview: eventData.show_overview,
        show_practitioner_sessions: eventData.show_practitioner_sessions,
        show_submission_guidelines: eventData.show_submission_guidelines,
        show_awards: eventData.show_awards,
        show_committees: eventData.show_committees,
        show_venue: eventData.show_venue,
        show_keynote: eventData.show_keynote,
        show_photos: eventData.show_photos,
        show_testimonials: eventData.show_testimonials,
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

      // Initialize content form with existing content
      if (eventData.event_content) {
        setContentForm({
          overview: eventData.event_content.overview || '',
          practitioner_sessions: eventData.event_content.practitioner_sessions || '',
          submission_guidelines: eventData.event_content.submission_guidelines || '',
          awards: eventData.event_content.awards || '',
          academic_committee: eventData.event_content.academic_committee || [],
          organizing_committee: eventData.event_content.organizing_committee || [],
          venue_info: eventData.event_content.venue_info || undefined,
        });
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
      const [photosData, speakersData, testimonialsData, sessionsResponse] = await Promise.all([
        pastEventsService.getEventPhotos(eventId),
        pastEventsService.getEventSpeakers(eventId),
        pastEventsService.getEventTestimonials(eventId),
        eventService.getSessions(eventId),
      ]);

      setPhotos(photosData);
      setSpeakers(speakersData);
      setTestimonials(testimonialsData);
      if (sessionsResponse.success && sessionsResponse.data) {
        setSessions(sessionsResponse.data);
      }
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

  const handleBannerUploaded = (url: string) => {
    setBasicForm({ ...basicForm, banner_image_url: url });
    if (event) {
      setEvent({ ...event, banner_image_url: url });
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

  // Event content handlers
  const handleSaveEventContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await eventService.updateEvent(eventId!, { event_content: contentForm });
      setSuccess('Event content updated successfully');
      await loadEvent();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update event content');
    }
  };

  const handleContentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCommitteeMember = (type: 'academic_committee' | 'organizing_committee') => {
    const member: CommitteeMember = {
      name: '',
      affiliation: '',
      area: type === 'academic_committee' ? '' : undefined,
      role: type === 'organizing_committee' ? '' : undefined,
    };

    setContentForm((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), member],
    }));
  };

  const handleUpdateCommitteeMember = (
    type: 'academic_committee' | 'organizing_committee',
    index: number,
    field: keyof CommitteeMember,
    value: string
  ) => {
    setContentForm((prev) => {
      const committee = [...(prev[type] || [])];
      committee[index] = { ...committee[index], [field]: value };
      return { ...prev, [type]: committee };
    });
  };

  const handleRemoveCommitteeMember = (
    type: 'academic_committee' | 'organizing_committee',
    index: number
  ) => {
    setContentForm((prev) => ({
      ...prev,
      [type]: (prev[type] || []).filter((_, i) => i !== index),
    }));
  };

  const handleContentFormChange = (updates: Partial<EventContent>) => {
    setContentForm((prev) => ({ ...prev, ...updates }));
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
              { key: 'content' as ContentTab, label: 'Content & Venue', hide: isNewEvent },
              { key: 'media' as ContentTab, label: `Media, People & Stats (${photos.length + speakers.length + testimonials.length})`, hide: isNewEvent },
              { key: 'display' as ContentTab, label: 'Display Settings', hide: isNewEvent },
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
            <BasicInfoTab
              isNewEvent={isNewEvent}
              basicForm={basicForm}
              onInputChange={handleBasicInputChange}
              onSubmit={handleSaveBasicInfo}
            />
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <ContentTab
              contentForm={contentForm}
              onInputChange={handleContentInputChange}
              onAddCommitteeMember={handleAddCommitteeMember}
              onUpdateCommitteeMember={handleUpdateCommitteeMember}
              onRemoveCommitteeMember={handleRemoveCommitteeMember}
              onSubmit={handleSaveEventContent}
              onContentFormChange={handleContentFormChange}
            />
          )}

          {/* Media Tab */}
          {activeTab === 'media' && event && (
            <MediaTab
              event={event}
              photos={photos}
              speakers={speakers}
              testimonials={testimonials}
              onAddPhoto={() => setShowPhotoModal(true)}
              onDeletePhoto={handleDeletePhoto}
              onAddSpeaker={() => setShowSpeakerModal(true)}
              onDeleteSpeaker={handleDeleteSpeaker}
              onAddTestimonial={() => setShowTestimonialModal(true)}
              onDeleteTestimonial={handleDeleteTestimonial}
              onEditStats={() => setShowStatsModal(true)}
            />
          )}

          {/* Display Tab */}
          {activeTab === 'display' && event && (
            <DisplayTab
              event={event}
              basicForm={basicForm}
              onInputChange={handleBasicInputChange}
              onSubmit={handleSaveBasicInfo}
              onBannerUploaded={handleBannerUploaded}
            />
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
