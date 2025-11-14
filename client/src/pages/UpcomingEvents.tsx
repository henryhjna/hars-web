import { useEffect, useState } from 'react';
import { Calendar, MapPin, Award, Users, BookOpen, Presentation, ArrowUpDown } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import eventService from '../services/event.service';
import conferenceTopicService from '../services/conferenceTopic.service';
import type { Event, ConferenceTopic, CommitteeMember, EventSession } from '../types';

export default function UpcomingEvents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [topics, setTopics] = useState<ConferenceTopic[]>([]);
  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [academicSort, setAcademicSort] = useState<'name' | 'affiliation' | 'area'>('name');
  const [organizingSort, setOrganizingSort] = useState<'name' | 'affiliation' | 'role'>('name');

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

          // Fetch conference topics and sessions for this event
          const [topicsResponse, sessionsResponse] = await Promise.all([
            conferenceTopicService.getByEventId(upcomingEvent.id),
            eventService.getSessions(upcomingEvent.id),
          ]);

          if (topicsResponse.success && topicsResponse.data) {
            // Sort by display_order
            const sortedTopics = topicsResponse.data.sort((a, b) => a.display_order - b.display_order);
            setTopics(sortedTopics);
          }

          if (sessionsResponse.success && sessionsResponse.data) {
            setSessions(sessionsResponse.data);
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

  // Sort committee members
  const sortedAcademicCommittee = [...academicCommittee].sort((a, b) => {
    const aVal = a[academicSort] || '';
    const bVal = b[academicSort] || '';
    return aVal.localeCompare(bVal);
  });

  const sortedOrganizingCommittee = [...organizingCommittee].sort((a, b) => {
    // Chair always first
    if (a.role === 'Chair') return -1;
    if (b.role === 'Chair') return 1;

    const aVal = a[organizingSort] || '';
    const bVal = b[organizingSort] || '';
    return aVal.localeCompare(bVal);
  });

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
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Important Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
        </div>
      </section>

      {/* Conference Overview */}
      {event.show_overview && (
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Conference Overview</h2>
            <div className="prose prose-lg max-w-none">
              {conferenceDescription.split('\n').map((paragraph, index) =>
                paragraph.trim() && (
                  <p key={index} className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                    {paragraph.trim()}
                  </p>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* Special Practitioner Sessions */}
      {event.show_practitioner_sessions && event?.event_content?.practitioner_sessions && (
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Presentation className="h-8 w-8 text-accent-600" />
              <h2 className="text-3xl font-bold text-gray-900">Special Practitioner Sessions</h2>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
              <div className="prose prose-lg max-w-none">
                {event.event_content.practitioner_sessions.split('\n').map((paragraph, index) =>
                  paragraph.trim() && (
                    <p key={index} className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
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
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Submission Guidelines</h2>
            <div className="prose prose-lg max-w-none">
              {event.event_content.submission_guidelines.split('\n').map((paragraph, index) =>
                paragraph.trim() && (
                  <p key={index} className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                    {paragraph.trim()}
                  </p>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* Awards */}
      {event.show_awards && event?.event_content?.awards && (
        <section className="bg-gradient-to-br from-amber-50 to-yellow-50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Award className="h-8 w-8 text-amber-600" />
              <h2 className="text-3xl font-bold text-gray-900">Awards</h2>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
              <div className="prose prose-lg max-w-none">
                {event.event_content.awards.split('\n').map((paragraph, index) =>
                  paragraph.trim() && (
                    <p key={index} className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                      {paragraph.trim()}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Program Schedule */}
      {event.show_program && sessions.length > 0 && (
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Calendar className="h-8 w-8 text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-900">Program Schedule</h2>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {sessions.map((session) => (
                <div key={session.id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary-500 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">{session.session_title}</h3>
                    {session.session_type && (
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full self-start">
                        {session.session_type}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {session.session_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(session.session_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    )}
                    {(session.start_time || session.end_time) && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Time:</span>
                        <span>
                          {session.start_time && session.start_time.substring(0, 5)}
                          {session.start_time && session.end_time && ' - '}
                          {session.end_time && session.end_time.substring(0, 5)}
                        </span>
                      </div>
                    )}
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{session.location}</span>
                      </div>
                    )}
                  </div>

                  {session.description && (
                    <p className="mt-4 text-gray-700 whitespace-pre-line">{session.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Academic Committee */}
      {event.show_committees && academicCommittee.length > 0 && (
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Academic Committee</h2>
          </div>

          {/* Mobile: Card View */}
          <div className="md:hidden space-y-4">
            {sortedAcademicCommittee.map((member, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                <p className="font-semibold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-600">{member.affiliation}</p>
                {member.area && <p className="text-xs text-primary-600 mt-1">({member.area})</p>}
              </div>
            ))}
          </div>

          {/* Desktop: Table View with Sorting */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => setAcademicSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => setAcademicSort('affiliation')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Affiliation
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => setAcademicSort('area')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Research Area
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAcademicCommittee.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.affiliation}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-600">
                      {member.area || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      )}

      {/* Organizing Committee */}
      {event.show_committees && organizingCommittee.length > 0 && (
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Conference Organizing Committee</h2>

            {/* Mobile: Card View */}
            <div className="md:hidden space-y-4">
              {sortedOrganizingCommittee.map((member, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg shadow-md ${
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

            {/* Desktop: Table View with Sorting */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => setOrganizingSort('name')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th
                      onClick={() => setOrganizingSort('affiliation')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Affiliation
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th
                      onClick={() => setOrganizingSort('role')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        Role
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedOrganizingCommittee.map((member, index) => (
                    <tr
                      key={index}
                      className={member.role === 'Chair' ? 'bg-primary-50 hover:bg-primary-100' : 'hover:bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                        {member.role === 'Chair' && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-primary-600 text-white rounded">
                            CHAIR
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.affiliation}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.role || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Venue Information */}
      {event.show_venue && (event.event_content?.venue_info?.name || event.event_content?.venue_info?.address ||
        (event.event_content?.venue_info?.accessibility && event.event_content.venue_info.accessibility.length > 0) ||
        (event.event_content?.venue_info?.contact && event.event_content.venue_info.contact.length > 0)) && (
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Venue Information</h2>

            {(event.event_content?.venue_info?.name || event.event_content?.venue_info?.address) && (
              <div className="text-center mb-8">
                {event.event_content?.venue_info?.name && (
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {event.event_content.venue_info.name}
                  </h3>
                )}
                {event.event_content?.venue_info?.address && (
                  <div className="text-base md:text-lg text-gray-600 whitespace-pre-line">
                    {event.event_content.venue_info.address}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              {event.event_content?.venue_info?.accessibility &&
               event.event_content.venue_info.accessibility.length > 0 && (
                <div className="p-6 bg-primary-50 rounded-lg">
                  <h4 className="font-bold text-lg text-gray-900 mb-4">Accessibility</h4>
                  <ul className="space-y-2 text-base text-gray-700">
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
                  <ul className="space-y-2 text-base text-gray-700">
                    {event.event_content.venue_info.contact.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Submit Your Research?</h2>
          <p className="text-lg md:text-xl mb-8">
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
