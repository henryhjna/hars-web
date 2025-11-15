import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, BookOpen, Calendar, ArrowRight, Building2, Lightbulb, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import eventService from '../services/event.service';
import type { Event } from '../types';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNextEvent();
  }, []);

  const loadNextEvent = async () => {
    try {
      const response = await eventService.getUpcomingEvents();
      if (response.data && response.data.length > 0) {
        // Get the first upcoming event
        setNextEvent(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load upcoming event:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:py-28 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* University Badge */}
            <div className="mb-6 flex justify-center">
              <Badge variant="secondary" size="lg" rounded>
                <Building2 className="w-4 h-4 mr-2" />
                Hanyang University Business School
              </Badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hanyang Accounting
              <br />
              Research Symposium
            </h1>

            <p className="mt-6 text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Advancing accounting research through rigorous scholarship and innovative
              methodologies, with a distinctive focus on technology-driven insights
            </p>

            {/* Next Event Info */}
            <div className="mt-10 inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-accent-300" />
                <span className="text-sm font-semibold text-primary-200 uppercase tracking-wider">
                  Next Event
                </span>
              </div>
              {loading ? (
                <div className="text-2xl font-bold text-white mb-1">Loading...</div>
              ) : nextEvent ? (
                <>
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatDate(nextEvent.event_date)}
                  </div>
                  <div className="text-primary-200">
                    {nextEvent.venue || 'Hanyang University, Seoul, South Korea'}
                  </div>
                </>
              ) : (
                <div className="text-2xl font-bold text-white mb-1">TBD</div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/upcoming-events">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-xl">
                      View Event Details
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/my-submissions">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                      My Submissions
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/upcoming-events">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-xl">
                      View Event Details
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Paper Submission Deadline
              </div>
              <div className="text-2xl font-bold text-white">
                {loading ? 'Loading...' : formatDate(nextEvent?.submission_deadline)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Review Results
              </div>
              <div className="text-2xl font-bold text-white">
                {loading ? 'Loading...' : formatDate(nextEvent?.notification_date)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Symposium Date
              </div>
              <div className="text-2xl font-bold text-white">
                {loading ? 'Loading...' : formatDate(nextEvent?.event_date)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Scope */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" size="lg" rounded className="mb-4">
              Research Scope
            </Badge>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              Broad Topics, Tech-Forward Approach
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We welcome research across all areas of accounting, while maintaining our
              distinctive strength in technology-driven methodologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* All Accounting Topics */}
            <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-primary-50 to-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">All Accounting Research</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3 flex-shrink-0"></span>
                  Financial Reporting & Disclosure
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3 flex-shrink-0"></span>
                  Corporate Governance & ESG
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3 flex-shrink-0"></span>
                  Audit Quality & Regulation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3 flex-shrink-0"></span>
                  Capital Markets & Valuation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3 flex-shrink-0"></span>
                  Managerial & Cost Accounting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3 flex-shrink-0"></span>
                  Taxation & Public Policy
                </li>
              </ul>
            </Card>

            {/* Tech Strength */}
            <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-accent-50 to-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Tech-Driven Strength</h3>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Leveraging Hanyang University's excellence in computer science and engineering,
                we particularly encourage innovative research using:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-accent-500 mr-3 flex-shrink-0"></span>
                  AI & Machine Learning
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-accent-500 mr-3 flex-shrink-0"></span>
                  Large Language Models
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-accent-500 mr-3 flex-shrink-0"></span>
                  Big Data & Analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-accent-500 mr-3 flex-shrink-0"></span>
                  Alternative Data Sources
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Why HARS - Simple & Action-oriented */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              Why HARS?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                icon: FileText,
                title: 'Present Your Research',
                description: 'Share your work with scholars and receive valuable feedback',
              },
              {
                icon: Users,
                title: 'Build Connections',
                description: 'Network with leading researchers and practitioners',
              },
              {
                icon: Award,
                title: 'Earn Recognition',
                description: 'Best paper awards and publication opportunities',
              },
            ].map((feature) => (
              <Card key={feature.title} variant="elevated" padding="lg" hoverable className="bg-white">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Hosted by Hanyang University - Concise */}
      <div className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" size="lg" rounded className="mb-6">
            <Building2 className="w-4 h-4 mr-2" />
            Hosted by
          </Badge>
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-4">
            Hanyang University Business School
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Ranked #4 in South Korea, renowned for excellence in computer science,
            engineering, and technological innovation
          </p>
          <a
            href="https://www.hanyang.ac.kr/web/eng"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-accent-400 hover:text-accent-300 font-medium transition-colors text-lg"
          >
            Learn More About Hanyang University
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Past Events Highlight */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" size="lg" rounded className="mb-4">
              Previous Events
            </Badge>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              HARS Archive
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore presentations, papers, and highlights from previous symposiums
            </p>
          </div>

          <div className="text-center">
            <Link to="/past-events">
              <Button variant="primary" size="lg">
                View Past Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

          <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:py-24 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl mb-6">
              Join the HARS Community
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Create an account to submit papers, access symposium materials,
              and connect with leading researchers in accounting and finance
            </p>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="shadow-xl">
                Create Your Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
