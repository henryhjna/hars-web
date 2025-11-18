import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Train, Bus, Car, Plane } from 'lucide-react';
import eventService from '../services/event.service';
import pastEventsService from '../services/pastEvents.service';
import type { Event, EventPhoto, EventSession, Testimonial } from '../types';

type ViewTab = 'overview' | 'program' | 'photos' | 'highlights';

export default function PastEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [loading, setLoading] = useState(true);

  // Data for each tab
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [highlightPhotos, setHighlightPhotos] = useState<EventPhoto[]>([]);
  const [sessions, setSessions] = useState<EventSession[]>([]);
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
      const [photosData, highlightPhotosData, sessionsResponse, testimonialsData, featuredTestimonialsData] = await Promise.all([
        pastEventsService.getEventPhotos(selectedEvent.id),
        pastEventsService.getHighlightPhotos(selectedEvent.id),
        eventService.getSessions(selectedEvent.id),
        pastEventsService.getEventTestimonials(selectedEvent.id),
        pastEventsService.getFeaturedTestimonials(selectedEvent.id),
      ]);

      setPhotos(photosData);
      setHighlightPhotos(highlightPhotosData);
      setSessions(sessionsResponse.success && sessionsResponse.data ? sessionsResponse.data : []);
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
            {/* Content Tabs */}
            <div className="bg-white shadow rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap">
                  {[
                    { key: 'overview' as ViewTab, label: 'Overview', show: true },
                    { key: 'program' as ViewTab, label: `Program (${sessions.length})`, show: selectedEvent.show_program && sessions.length > 0 },
                    { key: 'photos' as ViewTab, label: `Photos (${photos.length})`, show: selectedEvent.show_photos && photos.length > 0 },
                    { key: 'highlights' as ViewTab, label: 'Highlights', show: (highlightPhotos.length > 0 || featuredTestimonials.length > 0 || (selectedEvent.highlight_stats && Object.keys(selectedEvent.highlight_stats).length > 0)) },
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
                  <div className="space-y-8">
                    {/* Event Title & Date */}
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
                      <p className="text-lg text-gray-600">
                        {new Date(selectedEvent.event_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Venue Information */}
                    {(selectedEvent.location || selectedEvent.event_content?.venue_info) && (
                      <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Venue Information</h3>
                          {selectedEvent.event_content?.venue_info?.name && (
                            <p className="text-lg font-semibold text-gray-900 mb-2">
                              {selectedEvent.event_content.venue_info.name}
                            </p>
                          )}
                          {selectedEvent.location && (
                            <p className="text-gray-700 mb-2">{selectedEvent.location}</p>
                          )}
                          {selectedEvent.event_content?.venue_info?.address && (
                            <p className="text-gray-600 whitespace-pre-line">
                              {selectedEvent.event_content.venue_info.address}
                            </p>
                          )}
                        </div>

                        {/* How to Get Here - Card Grid */}
                        {selectedEvent.event_content?.venue_info?.accessibility && (
                          <div className="border-t pt-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">How to Get Here</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Subway Card */}
                              {selectedEvent.event_content.venue_info.accessibility.subway && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Train className="h-6 w-6 text-blue-600" />
                                    <h5 className="font-semibold text-gray-900">Subway</h5>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-line">
                                    {selectedEvent.event_content.venue_info.accessibility.subway}
                                  </div>
                                </div>
                              )}

                              {/* Bus Card */}
                              {selectedEvent.event_content.venue_info.accessibility.bus && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Bus className="h-6 w-6 text-green-600" />
                                    <h5 className="font-semibold text-gray-900">Bus</h5>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-line">
                                    {selectedEvent.event_content.venue_info.accessibility.bus}
                                  </div>
                                </div>
                              )}

                              {/* Car & Parking Card */}
                              {selectedEvent.event_content.venue_info.accessibility.car && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Car className="h-6 w-6 text-purple-600" />
                                    <h5 className="font-semibold text-gray-900">Car & Parking</h5>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-line">
                                    {selectedEvent.event_content.venue_info.accessibility.car}
                                  </div>
                                </div>
                              )}

                              {/* Airport Card */}
                              {selectedEvent.event_content.venue_info.accessibility.airport && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Plane className="h-6 w-6 text-orange-600" />
                                    <h5 className="font-semibold text-gray-900">From Incheon Airport</h5>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-line">
                                    {selectedEvent.event_content.venue_info.accessibility.airport}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contact Information */}
                        {selectedEvent.event_content?.venue_info?.contact && (
                          <div className="border-t pt-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h4>
                            <div className="text-gray-700 whitespace-pre-line">
                              {selectedEvent.event_content.venue_info.contact}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Overview / Description */}
                    {(selectedEvent.description || selectedEvent.event_content?.overview) && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Overview</h3>
                        <div className="prose max-w-none text-gray-700">
                          {selectedEvent.event_content?.overview ? (
                            selectedEvent.event_content.overview.split('\n').map((paragraph, idx) =>
                              paragraph.trim() && <p key={idx} className="mb-4">{paragraph.trim()}</p>
                            )
                          ) : (
                            <p>{selectedEvent.description}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Academic Committee */}
                    {selectedEvent.show_committees && selectedEvent.event_content?.academic_committee && selectedEvent.event_content.academic_committee.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Committee</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedEvent.event_content.academic_committee.map((member, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-semibold text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.affiliation}</p>
                              {member.area && <p className="text-xs text-primary-600 mt-1">({member.area})</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Organizing Committee */}
                    {selectedEvent.show_committees && selectedEvent.event_content?.organizing_committee && selectedEvent.event_content.organizing_committee.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Organizing Committee</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedEvent.event_content.organizing_committee.map((member, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg ${
                                member.role === 'Chair'
                                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {member.role === 'Chair' && (
                                <span className="text-xs font-semibold mb-1 block text-primary-100">CHAIR</span>
                              )}
                              <p className={`font-semibold ${member.role === 'Chair' ? 'text-white' : 'text-gray-900'}`}>
                                {member.name}
                              </p>
                              <p className={`text-sm ${member.role === 'Chair' ? 'text-white opacity-90' : 'text-gray-600'}`}>
                                {member.affiliation}
                              </p>
                              {member.role && member.role !== 'Chair' && (
                                <p className="text-xs text-gray-500 mt-1">{member.role}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Program Tab - Event Schedule */}
                {activeTab === 'program' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Program Schedule</h3>
                    {sessions.length === 0 ? (
                      <p className="text-gray-600">No program information available.</p>
                    ) : (
                      <div className="space-y-4">
                        {sessions.map((session) => (
                          <div key={session.id} className="bg-gray-50 p-6 rounded-lg border-l-4 border-primary-500">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{session.session_title}</h4>
                              {session.session_type && (
                                <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                                  {session.session_type}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              {session.session_date && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Date:</span>
                                  <span>{new Date(session.session_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}</span>
                                </div>
                              )}
                              {(session.start_time || session.end_time) && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Time:</span>
                                  <span>
                                    {session.start_time && session.start_time.substring(0, 5)}
                                    {session.start_time && session.end_time && ' - '}
                                    {session.end_time && session.end_time.substring(0, 5)}
                                  </span>
                                </div>
                              )}
                              {session.location && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Location:</span>
                                  <span>{session.location}</span>
                                </div>
                              )}
                            </div>

                            {session.description && (
                              <p className="text-gray-700 whitespace-pre-line">{session.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
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

                {/* Highlights Tab */}
                {activeTab === 'highlights' && (
                  <div className="space-y-8">
                    {/* Highlight Stats */}
                    {selectedEvent.highlight_stats && Object.keys(selectedEvent.highlight_stats).length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Event Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(selectedEvent.highlight_stats).map(([key, value]) => (
                            <div key={key} className="bg-gradient-to-br from-primary-50 to-accent-50 p-6 rounded-lg text-center">
                              <div className="text-3xl font-bold text-primary-600">{String(value)}</div>
                              <div className="text-sm text-gray-700 capitalize mt-2">{key.replace(/_/g, ' ')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Highlight Photos */}
                    {highlightPhotos.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Event Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {highlightPhotos.map((photo) => (
                            <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden group">
                              <img
                                src={photo.photo_url}
                                alt={photo.caption || 'Event highlight'}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              {photo.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
                                  <p className="text-sm font-medium">{photo.caption}</p>
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
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">What Participants Said</h3>
                        <div className="space-y-4">
                          {featuredTestimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-gradient-to-br from-primary-50 to-accent-50 p-6 rounded-lg border-l-4 border-primary-500">
                              <p className="text-gray-800 italic text-lg leading-relaxed">"{testimonial.testimonial_text}"</p>
                              <p className="mt-4 text-sm font-semibold text-gray-700">
                                — {testimonial.author_name}
                                {testimonial.author_affiliation && <span className="font-normal">, {testimonial.author_affiliation}</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {!selectedEvent.highlight_stats && highlightPhotos.length === 0 && featuredTestimonials.length === 0 && (
                      <p className="text-gray-600 text-center py-8">No highlights available.</p>
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
