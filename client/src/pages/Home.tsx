import { Link } from 'react-router-dom';
import { FileText, Users, BookOpen, Calendar, ArrowRight, Building2, Lightbulb, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Home() {
  const { isAuthenticated } = useAuth();

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
              An annual academic conference fostering collaboration between scholars,
              practitioners, and policymakers to explore transformative trends in
              accounting and finance
            </p>

            {/* Next Event Info */}
            <div className="mt-10 inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-accent-300" />
                <span className="text-sm font-semibold text-primary-200 uppercase tracking-wider">
                  Next Event
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                June 15, 2025
              </div>
              <div className="text-primary-200">
                Hanyang University, Seoul, South Korea
              </div>
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
              <div className="text-2xl font-bold text-white">April 30, 2025</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Review Results
              </div>
              <div className="text-2xl font-bold text-white">May 31, 2025</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Symposium Date
              </div>
              <div className="text-2xl font-bold text-white">June 15, 2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* About HARS Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="primary" size="lg" rounded className="mb-4">
              About HARS
            </Badge>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              What is HARS?
            </h2>
          </div>

          <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed space-y-6">
            <p>
              The Hanyang Accounting Research Symposium (HARS) is an annual academic conference
              hosted by the Department of Accounting at Hanyang University Business School,
              a leading institution in South Korea.
            </p>
            <p>
              Launched in 2024, HARS serves as a platform for scholars, practitioners, and
              policymakers to exchange cutting-edge ideas, foster collaborations, and explore
              transformative technological trends in accounting and finance.
            </p>

            <div className="bg-primary-50 rounded-xl p-8 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  <span>Showcase high-quality academic research and its real-world implications</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  <span>Foster collaboration between academia, industry, and regulatory bodies</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  <span>Highlight the role of emerging technologies in reshaping accounting and finance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* New Technologies Focus */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="accent" size="lg" rounded className="mb-4">
              <Lightbulb className="w-4 h-4 mr-2" />
              Research Focus
            </Badge>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              Emerging Technologies in Accounting
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The rapid advancement of technology is transforming accounting and finance,
              creating new opportunities and challenges for researchers and practitioners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card variant="elevated" padding="lg" className="bg-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Key Technologies</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3"></span>
                  Machine Learning & Artificial Intelligence
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3"></span>
                  Large Language Models (LLMs)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3"></span>
                  Alternative Data Analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3"></span>
                  Big Data & Computational Methods
                </li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="bg-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Research Impact</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                By exploring opportunities and addressing challenges presented by technological
                innovations, we collectively shape a future where technology drives better
                decisions, greater efficiency, and more equitable financial systems.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              Why Participate in HARS?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you are an academic, practitioner, or policymaker,
              HARS offers an invaluable opportunity to engage with thought leaders
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                title: 'Showcase Research',
                description: 'Present high-quality academic research and explore real-world implications with peers',
                color: 'from-primary-500 to-primary-600',
              },
              {
                icon: Users,
                title: 'Network & Collaborate',
                description: 'Connect with leading scholars, practitioners, and policymakers across Asia',
                color: 'from-accent-500 to-accent-600',
              },
              {
                icon: Lightbulb,
                title: 'Explore Innovation',
                description: 'Learn about emerging technologies reshaping accounting and finance practices',
                color: 'from-primary-600 to-accent-500',
              },
              {
                icon: Award,
                title: 'Gain Recognition',
                description: 'Best paper awards and publication opportunities for outstanding contributions',
                color: 'from-accent-600 to-primary-600',
              },
            ].map((feature) => (
              <Card key={feature.title} variant="elevated" padding="lg" hoverable>
                <div className={`inline-flex items-center justify-center p-3 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* About Hanyang University */}
      <div className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" size="lg" rounded className="mb-4">
              <Building2 className="w-4 h-4 mr-2" />
              About Our Institution
            </Badge>
            <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
              Hanyang University
            </h2>
          </div>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-lg">
              Established in 1939 at the heart of Seoul, Hanyang University is a premier
              institution ranked 4th among universities in South Korea (2023).
            </p>
            <p>
              Hanyang University is renowned for its outstanding programs in computer science
              and engineering, consistently ranked among the best in South Korea. The university
              has been at the forefront of research in artificial intelligence, machine learning,
              and big data analytics—critical to the technological advancements reshaping
              accounting and finance.
            </p>
            <p>
              This expertise ensures that HARS participants benefit from the latest innovations
              and insights in computational methods, fostering groundbreaking interdisciplinary research.
            </p>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <a
                href="https://www.hanyang.ac.kr/web/eng"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-accent-400 hover:text-accent-300 font-medium transition-colors"
              >
                Visit Hanyang University Website
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
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
