import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import facultyService from '../services/faculty.service';
import type { FacultyMember } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

export default function About() {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const response = await facultyService.getAll(true); // Only active faculty
      setFaculty(response.data || []);
    } catch (error) {
      console.error('Failed to load faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              About HARS
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-3xl mx-auto">
              Fostering excellence in accounting research and advancing knowledge
              in the field through collaboration and innovation
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
        {/* About HARS */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            The Hanyang Accounting Research Symposium
          </h2>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>
              The Hanyang Accounting Research Symposium (HARS) is an annual academic conference
              hosted by the Department of Accounting at Hanyang University Business School.
              Launched in 2024, HARS has quickly established itself as a premier venue for
              accounting research in Asia.
            </p>
            <p>
              We welcome submissions across <strong>all areas of accounting research</strong>,
              from traditional topics like financial reporting and auditing to contemporary
              issues in ESG, governance, and capital markets. Our distinctive strength lies in
              fostering <strong>technology-driven methodologies</strong>—leveraging Hanyang
              University's world-class capabilities in computer science, AI, and data analytics
              to advance accounting scholarship.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide a collaborative platform where rigorous accounting research meets
                innovative methodologies, fostering meaningful dialogue among academics,
                practitioners, and policymakers.
              </p>
            </div>
            <div className="bg-accent-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become Asia's leading symposium for accounting research that bridges
                traditional scholarship with cutting-edge technological innovation.
              </p>
            </div>
          </div>

          {/* What Makes HARS Unique */}
          <div className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">What Makes HARS Unique</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Broad Scope, Deep Expertise</h4>
                  <p className="text-gray-700">
                    All accounting topics are welcome, while our technology-driven strength
                    provides unique research opportunities
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Interdisciplinary Collaboration</h4>
                  <p className="text-gray-700">
                    Access to world-class computer science and engineering faculty enables
                    groundbreaking methodological innovation
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Practitioner Engagement</h4>
                  <p className="text-gray-700">
                    Special sessions connecting academic research with real-world practice
                    and policy implications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Seoul? Section */}
        <section className="mb-20">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Seoul?
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              The Korean Wave—from BTS to Parasite, from Korean BBQ to K-Beauty—has
              transformed Seoul into one of the world's most exciting cultural destinations.
              For international scholars, Seoul offers far more than trending phenomena:
              it represents a unique convergence of ancient wisdom and future-forward thinking.
            </p>
          </div>

          {/* Section 1: Academic Excellence + Modern Image */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Academic Excellence Meets Innovation
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Seoul is home to prestigious universities like Seoul National University,
                KAIST, and Hanyang University, consistently ranked among Asia's top research
                institutions. The city's thriving startup ecosystem, supported by robust
                government R&D funding, makes it an ideal hub for scholars exploring the
                intersection of technology, business, and society.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/images/seoul/seoul-modern.jpg"
                alt="Modern Seoul - Dongdaemun Design Plaza"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Section 2: Culture + Palace Image */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div className="order-1">
              <img
                src="/images/seoul/seoul-palace.jpg"
                alt="Gyeongbokgung Palace - Traditional Korean Architecture"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="order-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                A City of Contrasts
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Walk through 600-year-old palaces in the morning, attend a symposium in a
                state-of-the-art conference center in the afternoon, and enjoy Michelin-starred
                dining at night. Seoul seamlessly blends UNESCO World Heritage sites with
                gleaming skyscrapers, traditional tea ceremonies with high-speed internet cafes.
              </p>
            </div>
          </div>

          {/* Section 3: Infrastructure + Skyline Image */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                World-Class Infrastructure
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ranked #1 globally for public transportation, Seoul offers unparalleled
                convenience and safety. With ultra-fast WiFi everywhere, English signage
                in major areas, and Incheon International Airport serving direct flights
                from 50+ countries, Seoul is as accessible as it is exciting.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/images/seoul/seoul-skyline.jpg"
                alt="Seoul Skyline at Night"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Section 4: Hospitality (Full-width) */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 sm:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Experience Korean Hospitality
            </h3>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto text-center mb-6">
              From humble street food stalls to luxury hotels, Seoul welcomes visitors
              with legendary Korean hospitality (<em>jeong</em>). Affordable yet sophisticated,
              vibrant yet orderly, Seoul promises an academic conference experience like no other.
            </p>
            <p className="text-xl font-semibold text-primary-600 text-center">
              Join us in Seoul—where scholarship meets soul-searching.
            </p>
          </div>
        </section>

        {/* Research Topics */}
        <div className="mb-20 bg-gray-50 rounded-2xl p-8 sm:p-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Welcome Research Topics
            </h2>
            <p className="text-lg text-gray-600 mb-10 text-center max-w-3xl mx-auto">
              We invite submissions across the full spectrum of accounting research.
              While all topics are welcome, we particularly encourage innovative
              methodologies and technology-driven approaches.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Traditional Core */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Traditional Core
                </h3>
                <ul className="space-y-3">
                  {[
                    'Financial Reporting',
                    'Audit & Assurance',
                    'Managerial Accounting',
                    'Taxation',
                    'Capital Markets',
                  ].map((topic, idx) => (
                    <li key={idx} className="flex items-start text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mr-3 mt-2 flex-shrink-0"></span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Contemporary Issues */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Contemporary Issues
                </h3>
                <ul className="space-y-3">
                  {[
                    'Corporate Governance',
                    'ESG & Sustainability',
                    'Regulation & Policy',
                    'Fintech & Blockchain',
                    'International Accounting',
                  ].map((topic, idx) => (
                    <li key={idx} className="flex items-start text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mr-3 mt-2 flex-shrink-0"></span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Tech-Driven Methods */}
              <div className="bg-gradient-to-br from-accent-50 to-white rounded-xl p-6 shadow-md border-2 border-accent-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-accent-200">
                  Tech-Driven Methods
                </h3>
                <ul className="space-y-3">
                  {[
                    'AI & Machine Learning',
                    'Large Language Models',
                    'Big Data Analytics',
                    'Alternative Data',
                    'Computational Methods',
                  ].map((topic, idx) => (
                    <li key={idx} className="flex items-start text-gray-900 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-600 mr-3 mt-2 flex-shrink-0"></span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Faculty Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Our Faculty
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the distinguished faculty members organizing and supporting HARS
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading faculty...</p>
              </div>
            </div>
          ) : faculty.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Faculty information will be available soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faculty.map((member) => (
                <Card key={member.id} variant="elevated" padding="none" hoverable>
                  <div className="p-6">
                    {member.photo_url && (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                    )}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 text-center mb-4 font-medium">
                      {member.title}
                    </p>

                    {member.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {member.bio}
                      </p>
                    )}

                    {member.research_interests && member.research_interests.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Research Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {member.research_interests.slice(0, 3).map((interest, idx) => (
                            <Badge key={idx} variant="primary" size="sm">
                              {interest}
                            </Badge>
                          ))}
                          {member.research_interests.length > 3 && (
                            <Badge variant="primary" size="sm">
                              +{member.research_interests.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact info - only visible to logged-in users */}
                    {user && (member.email || member.phone || member.office_location) && (
                      <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-4">
                        {member.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <button
                              onClick={() => {
                                const email = member.email!;
                                window.location.href = `mailto:${email}`;
                              }}
                              className="hover:text-primary-600 text-left"
                              title="Click to send email"
                            >
                              {member.email}
                            </button>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        {member.office_location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{member.office_location}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Profile URL Link */}
                    {member.profile_url && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <a
                          href={member.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Full Profile
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* About Hanyang University */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 sm:p-12 mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-6">
              Hanyang University Business School
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
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
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
