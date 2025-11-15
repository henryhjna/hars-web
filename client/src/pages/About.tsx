import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import facultyService from '../services/faculty.service';
import type { FacultyMember } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function About() {
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
              hosted by the Department of Accounting at Hanyang University Business School,
              a leading institution in South Korea.
            </p>
            <p>
              Launched in 2024, HARS serves as a platform for scholars, practitioners, and
              policymakers to exchange cutting-edge ideas, foster collaborations, and explore
              transformative technological trends in accounting and finance.
            </p>
          </div>

          {/* Mission */}
          <div className="mt-12 bg-primary-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <ul className="space-y-4">
              {[
                'Showcase high-quality academic research and its real-world implications',
                'Foster collaboration between academia, industry, and regulatory bodies',
                'Highlight the role of emerging technologies in reshaping accounting and finance',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-lg text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Research Focus */}
        <div className="mb-20 bg-gray-50 rounded-2xl p-8 sm:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Research Focus Areas
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-center">
              HARS emphasizes the intersection of accounting research and emerging technologies
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Machine Learning & Artificial Intelligence',
                'Large Language Models (LLMs)',
                'Alternative Data Analytics',
                'Big Data & Computational Methods',
                'Corporate Governance & ESG',
                'Financial Reporting & Disclosure',
                'Audit Quality & Technology',
                'Fintech & Digital Finance',
              ].map((topic, idx) => (
                <div key={idx} className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-600 mr-3"></div>
                  <span className="text-gray-700 font-medium">{topic}</span>
                </div>
              ))}
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

                    <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-4">
                      {member.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={`mailto:${member.email}`} className="hover:text-primary-600">
                            {member.email}
                          </a>
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

        {/* Contact Information */}
        <div className="max-w-4xl mx-auto">
          <Card variant="elevated" padding="lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">General Inquiries</h3>
                <p className="text-gray-600">
                  For questions about the symposium, paper submissions, or registration:
                </p>
                <a
                  href="mailto:info@hanyanghars.com"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mt-2"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  info@hanyanghars.com
                </a>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Technical Support</h3>
                <p className="text-gray-600">
                  For website or submission system issues:
                </p>
                <a
                  href="mailto:noreply@hanyanghars.com"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mt-2"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  noreply@hanyanghars.com
                </a>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>Hanyang University Business School</p>
                    <p>222 Wangsimni-ro, Seongdong-gu</p>
                    <p>Seoul 04763, South Korea</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
