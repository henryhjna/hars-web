import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import eventService from '../services/event.service';
import pastEventsService from '../services/pastEvents.service';
import type { Event, EventPhoto, KeynoteSpeaker, Testimonial } from '../types';

type ViewTab = 'overview' | 'program' | 'speakers' | 'photos' | 'testimonials' | 'best-papers';

export default function PastEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [loading, setLoading] = useState(true);

  // Data for each tab
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [highlightPhotos, setHighlightPhotos] = useState<EventPhoto[]>([]);
  const [speakers, setSpeakers] = useState<KeynoteSpeaker[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventData();
      setSearchParams({ year: new Date(selectedEvent.event_date).getFullYear().toString() });
    }
  }, [selectedEvent]);

  const fetchPastEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getPastEvents();
      const events = response.data || [];
      setPastEvents(events);

      const yearParam = searchParams.get('year');
      if (yearParam && events.length > 0) {
        const eventForYear = events.find(e =>
          new Date(e.event_date).getFullYear().toString() === yearParam
        );
        setSelectedEvent(eventForYear || events[0]);
      } else if (events.length > 0) {
        setSelectedEvent(events[0]);
      }
    } catch (error) {
      console.error('Failed to fetch past events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventData = async () => {
    if (!selectedEvent) return;

    try {
      const [photosData, highlightPhotosData, speakersData, testimonialsData, featuredTestimonialsData] = await Promise.all([
        pastEventsService.getEventPhotos(selectedEvent.id),
        pastEventsService.getHighlightPhotos(selectedEvent.id),
        pastEventsService.getEventSpeakers(selectedEvent.id),
        pastEventsService.getEventTestimonials(selectedEvent.id),
        pastEventsService.getFeaturedTestimonials(selectedEvent.id),
      ]);

      setPhotos(photosData);
      setHighlightPhotos(highlightPhotosData);
      setSpeakers(speakersData);
      setTestimonials(testimonialsData);
      setFeaturedTestimonials(featuredTestimonialsData);
    } catch (error) {
      console.error('Failed to fetch event data:', error);
    }
  };

  const handleYearSelect = (event: Event) => {
    setSelectedEvent(event);
    setActiveTab('overview');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (pastEvents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Past Events</h1>
        <p className="mt-4 text-gray-600">No past events available yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Past Events</h1>
            <p className="text-xl">Explore our symposium archives and highlights</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Year Selection Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {pastEvents.map((event) => {
              const year = new Date(event.event_date).getFullYear();
              const isSelected = selectedEvent?.id === event.id;
              return (
                <button
                  key={event.id}
                  onClick={() => handleYearSelect(event)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${isSelected
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {year}
                </button>
              );
            })}
          </nav>
        </div>

        {selectedEvent && (
          <>
            {/* Event Title */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <p className="mt-2 text-gray-600">{selectedEvent.description}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(selectedEvent.event_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Location:</span> {selectedEvent.location}
                </div>
                {selectedEvent.venue_details && (
                  <div>
                    <span className="font-semibold">Venue:</span> {selectedEvent.venue_details}
                  </div>
                )}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white shadow rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  {[
                    { key: 'overview' as ViewTab, label: 'Overview', show: true },
                    { key: 'speakers' as ViewTab, label: `Speakers (${speakers.length})`, show: selectedEvent.show_keynote },
                    { key: 'photos' as ViewTab, label: `Photos (${photos.length})`, show: selectedEvent.show_photos },
                    { key: 'testimonials' as ViewTab, label: `Testimonials (${testimonials.length})`, show: selectedEvent.show_testimonials },
                  ].filter(tab => tab.show).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`
                        py-4 px-6 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === tab.key
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Highlight Stats */}
                    {selectedEvent.highlight_stats && Object.keys(selectedEvent.highlight_stats).length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Object.entries(selectedEvent.highlight_stats).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{String(value)}</div>
                            <div className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Highlight Photos */}
                    {highlightPhotos.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {highlightPhotos.slice(0, 6).map((photo) => (
                            <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden">
                              <img
                                src={photo.photo_url}
                                alt={photo.caption || 'Event photo'}
                                className="w-full h-full object-cover"
                              />
                              {photo.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                                  {photo.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Featured Testimonials */}
                    {featuredTestimonials.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">What Participants Said</h3>
                        <div className="space-y-4">
                          {featuredTestimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700 italic">"{testimonial.testimonial_text}"</p>
                              <p className="mt-2 text-sm text-gray-600">
                                — {testimonial.author_name}
                                {testimonial.author_affiliation && `, ${testimonial.author_affiliation}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Speakers Tab */}
                {activeTab === 'speakers' && (
                  <div className="space-y-6">
                    {speakers.length === 0 ? (
                      <p className="text-gray-600">No speaker information available.</p>
                    ) : (
                      speakers.map((speaker) => (
                        <div key={speaker.id} className="flex gap-6 bg-gray-50 p-6 rounded-lg">
                          {speaker.photo_url && (
                            <img
                              src={speaker.photo_url}
                              alt={speaker.name}
                              className="w-32 h-32 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">{speaker.name}</h3>
                            {speaker.title && (
                              <p className="text-sm text-gray-600">{speaker.title}</p>
                            )}
                            {speaker.affiliation && (
                              <p className="text-sm text-gray-600">{speaker.affiliation}</p>
                            )}
                            {speaker.topic && (
                              <p className="mt-2 text-sm font-medium text-gray-900">
                                Topic: {speaker.topic}
                              </p>
                            )}
                            {speaker.presentation_time && (
                              <p className="text-sm text-gray-600">Time: {speaker.presentation_time}</p>
                            )}
                            {speaker.bio && (
                              <p className="mt-2 text-gray-700">{speaker.bio}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Photos Tab */}
                {activeTab === 'photos' && (
                  <div>
                    {photos.length === 0 ? (
                      <p className="text-gray-600">No photos available.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden group">
                            <img
                              src={photo.photo_url}
                              alt={photo.caption || 'Event photo'}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            {photo.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                                {photo.caption}
                              </div>
                            )}
                            {photo.is_highlight && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                Highlight
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Testimonials Tab */}
                {activeTab === 'testimonials' && (
                  <div className="space-y-4">
                    {testimonials.length === 0 ? (
                      <p className="text-gray-600">No testimonials available.</p>
                    ) : (
                      testimonials.map((testimonial) => (
                        <div
                          key={testimonial.id}
                          className={`p-4 rounded-lg ${
                            testimonial.is_featured ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                          }`}
                        >
                          {testimonial.is_featured && (
                            <span className="inline-block bg-gradient-to-r from-primary-500 to-accent-500 text-white px-2 py-1 rounded text-xs font-semibold mb-2">
                              Featured
                            </span>
                          )}
                          <p className="text-gray-700 italic">"{testimonial.testimonial_text}"</p>
                          <p className="mt-2 text-sm text-gray-600">
                            — {testimonial.author_name}
                            {testimonial.author_affiliation && `, ${testimonial.author_affiliation}`}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
