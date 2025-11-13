import { useEffect, useState } from 'react';
import { Calendar, MapPin, Award, Users, BookOpen, Presentation } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import eventService from '../services/event.service';
import conferenceTopicService from '../services/conferenceTopic.service';
import type { Event, ConferenceTopic } from '../types';

export default function UpcomingEvents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [topics, setTopics] = useState<ConferenceTopic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch upcoming events
        const eventsResponse = await eventService.getUpcomingEvents();

        if (eventsResponse.success && eventsResponse.data && eventsResponse.data.length > 0) {
          const upcomingEvent = eventsResponse.data[0];
          setEvent(upcomingEvent);

          // Fetch conference topics for this event
          const topicsResponse = await conferenceTopicService.getByEventId(upcomingEvent.id);
          if (topicsResponse.success && topicsResponse.data) {
            // Sort by display_order
            const sortedTopics = topicsResponse.data.sort((a, b) => a.display_order - b.display_order);
            setTopics(sortedTopics);
          }
        } else {
          setEvent(null);
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date for important dates cards (shorter format)
  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get committee members from event content (dynamic from database)
  const academicCommittee = event?.event_content?.academic_committee || [];
  const organizingCommittee = event?.event_content?.organizing_committee || [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading event information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg mb-4">
            <p className="text-lg font-semibold mb-2">Error Loading Event</p>
            <p>{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No upcoming events state
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Calendar className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Upcoming Events</h1>
            <p className="text-lg text-gray-600 mb-8">
              There are currently no upcoming symposiums scheduled. Please check back later for announcements.
            </p>
            <div className="space-y-4">
              <p className="text-gray-700">
                In the meantime, you can explore our previous symposiums:
              </p>
              <Link to="/past-events">
                <Button variant="primary" size="lg">
                  View Past Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Build important dates array from DB data
  const importantDates = [
    {
      label: 'Paper Submission Deadline',
      date: formatShortDate(event.submission_end_date),
      icon: Calendar
    },
    event.notification_date && {
      label: 'Notification of Acceptance',
      date: formatShortDate(event.notification_date),
      icon: Calendar
    },
    {
      label: 'Conference Date',
      date: formatShortDate(event.event_date),
      icon: Calendar,
      highlight: true
    }
  ].filter(Boolean) as Array<{ label: string; date: string; icon: typeof Calendar; highlight?: boolean }>;

  // Get conference content from event_content or use defaults
  const conferenceDescription = event?.event_content?.overview || event.description || `
    Department of Accounting at Hanyang University Business School invites submissions for the ${event.title} to be held on ${formatDate(event.event_date)}, in Seoul, Korea.

    The symposium provides a premier platform for rigorous academic exchange among leading accounting scholars from around the world. Selected papers will be presented in concurrent sessions with designated discussants, allowing for in-depth scholarly dialogue. Exceptional papers may be designated as Featured Papers and presented in special morning sessions.

    The symposium will recognize outstanding research through Best Paper and Outstanding Paper Awards with cash prizes.
  `;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {event.title}
            </h1>
            <p className="text-xl md:text-2xl mb-6">{formatDate(event.event_date)}</p>
            {event.location && (
              <div className="flex items-center justify-center gap-2 text-lg mb-8">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
            )}
            <Link to="/submit-paper">
              <Button variant="gradient" size="lg">
                Submit Your Paper
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Important Dates</h2>
        <div className={`grid md:grid-cols-${importantDates.length} gap-4`}>
          {importantDates.map((item, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg text-center ${
                item.highlight
                  ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-lg scale-105'
                  : 'bg-white shadow-md hover:shadow-lg transition-shadow'
              }`}
            >
              <item.icon className={`h-8 w-8 mx-auto mb-3 ${item.highlight ? 'text-white' : 'text-primary-600'}`} />
              <p className={`text-sm font-semibold mb-2 ${item.highlight ? 'text-white' : 'text-gray-700'}`}>
                {item.label}
              </p>
              <p className={`text-lg font-bold ${item.highlight ? 'text-white' : 'text-primary-600'}`}>
                {item.date}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Conference Overview */}
      {event.show_overview && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Conference Overview</h2>
            <div className="prose prose-lg max-w-none">
              {conferenceDescription.split('\n').map((paragraph, index) =>
                paragraph.trim() && (
                  <p key={index} className="text-gray-700 text-lg leading-relaxed mb-4">
                    {paragraph.trim()}
                  </p>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* Research Topics */}
      {topics.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Research Topics</h2>
          </div>
          <p className="text-center text-gray-600 mb-8 text-lg">
            This year's symposium welcomes submissions on <strong>ALL TOPICS IN ACCOUNTING RESEARCH</strong>, including but not limited to:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-primary-600"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-2">{topic.topic_name}</h3>
                {topic.description && (
                  <p className="text-gray-600 text-sm">{topic.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Special Practitioner Sessions */}
      {event.show_practitioner_sessions && event?.event_content?.practitioner_sessions && (
        <section className="bg-accent-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Presentation className="h-8 w-8 text-accent-600" />
              <h2 className="text-3xl font-bold text-gray-900">Special Practitioner Sessions</h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="prose prose-lg max-w-none">
                {event.event_content.practitioner_sessions.split('\n').map((paragraph, index) =>
                  paragraph.trim() && (
                    <p key={index} className="text-gray-700 text-lg leading-relaxed mb-4">
                      {paragraph.trim()}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Submission Guidelines */}
      {event.show_submission_guidelines && event?.event_content?.submission_guidelines && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Submission Guidelines</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="prose prose-lg max-w-none">
              {event.event_content.submission_guidelines.split('\n').map((paragraph, index) =>
                paragraph.trim() && (
                  <p key={index} className="text-gray-700 text-lg leading-relaxed mb-4">
                    {paragraph.trim()}
                  </p>
                )
              )}
            </div>

            <div className="mt-8 text-center">
              <Link to="/submit-paper">
                <Button variant="gradient" size="lg">
                  Submit Paper Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Awards */}
      {event.show_awards && event?.event_content?.awards && (
        <section className="bg-gradient-to-br from-amber-50 to-yellow-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Award className="h-8 w-8 text-amber-600" />
              <h2 className="text-3xl font-bold text-gray-900">Awards</h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="prose prose-lg max-w-none">
                {event.event_content.awards.split('\n').map((paragraph, index) =>
                  paragraph.trim() && (
                    <p key={index} className="text-gray-700 text-lg leading-relaxed mb-4">
                      {paragraph.trim()}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Academic Committee */}
      {event.show_committees && academicCommittee.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Academic Committee</h2>
          </div>
          <p className="text-center text-gray-600 mb-8">(Listed alphabetically by last name)</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academicCommittee.map((member, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-600">{member.affiliation}</p>
                {member.area && <p className="text-xs text-primary-600 mt-1">({member.area})</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Organizing Committee */}
      {event.show_committees && organizingCommittee.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Conference Organizing Committee</h2>
            <p className="text-center text-gray-600 mb-8">(Chair listed first, others alphabetically by last name)</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {organizingCommittee.map((member, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg shadow-md text-center ${
                    member.role === 'Chair'
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white'
                      : 'bg-white'
                  }`}
                >
                  {member.role === 'Chair' && (
                    <div className="text-xs font-semibold mb-2 text-primary-100">CHAIR</div>
                  )}
                  <p className={`font-bold ${member.role === 'Chair' ? 'text-white' : 'text-gray-900'}`}>
                    {member.name}
                  </p>
                  <p className={`text-sm mt-1 ${member.role === 'Chair' ? 'text-primary-100' : 'text-gray-600'}`}>
                    {member.affiliation}
                  </p>
                  {member.role && member.role !== 'Chair' && (
                    <p className="text-xs text-gray-500 mt-1">{member.role}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Venue Information */}
      {event.show_venue && (event.event_content?.venue_info?.name || event.event_content?.venue_info?.address ||
        (event.event_content?.venue_info?.accessibility && event.event_content.venue_info.accessibility.length > 0) ||
        (event.event_content?.venue_info?.contact && event.event_content.venue_info.contact.length > 0)) && (
        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Venue Information</h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              {(event.event_content?.venue_info?.name || event.event_content?.venue_info?.address) && (
                <div className="text-center mb-8">
                  {event.event_content?.venue_info?.name && (
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {event.event_content.venue_info.name}
                    </h3>
                  )}
                  {event.event_content?.venue_info?.address && (
                    <div className="text-gray-600 text-lg whitespace-pre-line">
                      {event.event_content.venue_info.address}
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                {event.event_content?.venue_info?.accessibility &&
                 event.event_content.venue_info.accessibility.length > 0 && (
                  <div className="p-6 bg-primary-50 rounded-lg">
                    <h4 className="font-bold text-lg text-gray-900 mb-4">Accessibility</h4>
                    <ul className="space-y-2 text-gray-700">
                      {event.event_content.venue_info.accessibility.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {event.event_content?.venue_info?.contact &&
                 event.event_content.venue_info.contact.length > 0 && (
                  <div className="p-6 bg-accent-50 rounded-lg">
                    <h4 className="font-bold text-lg text-gray-900 mb-4">Contact Information</h4>
                    <ul className="space-y-2 text-gray-700">
                      {event.event_content.venue_info.contact.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Submit Your Research?</h2>
          <p className="text-xl mb-8">
            We look forward to receiving your submissions and welcoming you to Seoul in {new Date(event.event_date).getFullYear()}!
          </p>
          <Link to="/submit-paper">
            <Button variant="outline" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
              Submit Paper Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
