import { Link } from 'react-router-dom';
import { FileText, Users, BookOpen, Sparkles, ArrowRight, Calendar, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="gradient" size="md" rounded className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Research Platform
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hanyang Accounting
              <br />
              <span className="bg-gradient-to-r from-accent-300 to-white bg-clip-text text-transparent">
                Research Symposium
              </span>
            </h1>

            <p className="mt-6 text-xl text-primary-100 max-w-3xl mx-auto">
              Join the premier academic symposium for accounting research. Submit your
              papers, attend presentations, and connect with leading researchers in the
              field.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/upcoming-events">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      View Events
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
                  <Link to="/register">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/upcoming-events">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                      View Events
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: 'Papers Published', value: '200+' },
                { label: 'Researchers', value: '500+' },
                { label: 'Universities', value: '50+' },
                { label: 'Countries', value: '15+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-primary-200 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" size="lg" rounded className="mb-4">
              Why Choose HARS?
            </Badge>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Everything you need for
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                cutting-edge research
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              The Hanyang Accounting Research Symposium brings together academics,
              researchers, and practitioners.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: 'Submit Papers',
                description: 'Share your research with the accounting community. Submit papers to upcoming symposiums with our streamlined process.',
                color: 'from-primary-500 to-primary-600',
              },
              {
                icon: Users,
                title: 'Network',
                description: 'Connect with fellow researchers, faculty, and industry professionals from around the world.',
                color: 'from-accent-500 to-accent-600',
              },
              {
                icon: BookOpen,
                title: 'Learn & Grow',
                description: 'Attend presentations and workshops on cutting-edge accounting research and AI applications.',
                color: 'from-primary-600 to-accent-500',
              },
              {
                icon: Award,
                title: 'Get Recognition',
                description: 'Best paper awards and featured presentations showcase outstanding research contributions.',
                color: 'from-accent-600 to-primary-600',
              },
              {
                icon: Calendar,
                title: 'Flexible Events',
                description: 'Multiple symposiums throughout the year with hybrid in-person and virtual attendance options.',
                color: 'from-primary-500 to-accent-500',
              },
              {
                icon: TrendingUp,
                title: 'Career Growth',
                description: 'Boost your academic profile and discover collaboration opportunities with leading institutions.',
                color: 'from-accent-500 to-primary-500',
              },
            ].map((feature) => (
              <Card key={feature.title} variant="elevated" padding="lg" hoverable>
                <div className={`inline-flex items-center justify-center p-3 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section with Gradient */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

          <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:py-24 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Create an account to submit papers and participate in upcoming events.
              Join hundreds of researchers advancing accounting knowledge.
            </p>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="shadow-xl">
                Sign up for free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="mt-6 text-sm text-primary-200">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
