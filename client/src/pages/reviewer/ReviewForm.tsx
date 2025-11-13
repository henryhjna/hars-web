import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reviewService from '../../services/review.service';
import submissionService from '../../services/submission.service';
import type { Review, Submission, ReviewSubmitData, ReviewRecommendation } from '../../types';

export default function ReviewForm() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<ReviewSubmitData>({
    originality_score: undefined,
    methodology_score: undefined,
    clarity_score: undefined,
    contribution_score: undefined,
    strengths: '',
    weaknesses: '',
    comments_to_authors: '',
    comments_to_committee: '',
    recommendation: undefined,
    is_completed: false,
  });

  useEffect(() => {
    if (submissionId) {
      loadData();
    }
  }, [submissionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load submission
      const subResponse = await submissionService.getSubmissionById(submissionId!);
      setSubmission(subResponse.data || null);

      // Load existing review
      const reviewResponse = await reviewService.getMyReviewForSubmission(submissionId!);
      if (reviewResponse.data) {
        setReview(reviewResponse.data);
        setFormData({
          originality_score: reviewResponse.data.originality_score,
          methodology_score: reviewResponse.data.methodology_score,
          clarity_score: reviewResponse.data.clarity_score,
          contribution_score: reviewResponse.data.contribution_score,
          strengths: reviewResponse.data.strengths || '',
          weaknesses: reviewResponse.data.weaknesses || '',
          comments_to_authors: reviewResponse.data.comments_to_authors || '',
          comments_to_committee: reviewResponse.data.comments_to_committee || '',
          recommendation: reviewResponse.data.recommendation,
          is_completed: reviewResponse.data.is_completed,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (field: string, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecommendationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, recommendation: e.target.value as ReviewRecommendation }));
  };

  const handleSaveDraft = async () => {
    await handleSubmit(false);
  };

  const handleSubmitReview = async () => {
    await handleSubmit(true);
  };

  const handleSubmit = async (isCompleted: boolean) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const submitData = {
        ...formData,
        is_completed: isCompleted,
      };

      const response = await reviewService.submitReview(submissionId!, submitData);

      if (response.success) {
        setSuccess(response.message || 'Review saved successfully');
        if (isCompleted) {
          setTimeout(() => {
            navigate('/reviewer');
          }, 2000);
        } else {
          loadData(); // Reload to get updated data
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  const viewPdf = () => {
    if (submission?.pdf_url) {
      const fullUrl = submissionService.getPdfUrl(submission.pdf_url);
      window.open(fullUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 mb-4">Submission not found</p>
          <button
            onClick={() => navigate('/reviewer')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isReadOnly = review?.is_completed || false;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate('/reviewer')}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Review Submission</h1>
          </div>
          {isReadOnly && (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
              Review Completed
            </span>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            {success}
          </div>
        )}

        {/* Submission Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission Details</h2>
          <div className="space-y-3">
            <div>
              <strong className="text-gray-700">Title:</strong>
              <p className="text-gray-900 mt-1">{submission.title}</p>
            </div>
            <div>
              <strong className="text-gray-700">Abstract:</strong>
              <p className="text-gray-900 mt-1">{submission.abstract}</p>
            </div>
            <div>
              <strong className="text-gray-700">Keywords:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {submission.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong className="text-gray-700">Corresponding Author:</strong>
              <p className="text-gray-900 mt-1">{submission.corresponding_author}</p>
            </div>
            {submission.co_authors && (
              <div>
                <strong className="text-gray-700">Co-authors:</strong>
                <p className="text-gray-900 mt-1">{submission.co_authors}</p>
              </div>
            )}
            <div>
              <button
                onClick={viewPdf}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                View PDF
              </button>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Form</h2>

          <form className="space-y-6">
            {/* Scoring Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Evaluation Criteria (1-5 scale)
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'originality_score', label: 'Originality' },
                  { key: 'methodology_score', label: 'Methodology' },
                  { key: 'clarity_score', label: 'Clarity' },
                  { key: 'contribution_score', label: 'Contribution' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => handleScoreChange(key, score)}
                          className={`w-12 h-12 rounded-lg font-semibold transition-colors ${
                            formData[key as keyof ReviewSubmitData] === score
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } ${isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Feedback */}
            <div>
              <label htmlFor="strengths" className="block text-sm font-medium text-gray-700">
                Strengths
              </label>
              <textarea
                id="strengths"
                name="strengths"
                value={formData.strengths}
                onChange={handleTextChange}
                disabled={isReadOnly}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="weaknesses" className="block text-sm font-medium text-gray-700">
                Weaknesses
              </label>
              <textarea
                id="weaknesses"
                name="weaknesses"
                value={formData.weaknesses}
                onChange={handleTextChange}
                disabled={isReadOnly}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="comments_to_authors"
                className="block text-sm font-medium text-gray-700"
              >
                Comments to Authors
              </label>
              <textarea
                id="comments_to_authors"
                name="comments_to_authors"
                value={formData.comments_to_authors}
                onChange={handleTextChange}
                disabled={isReadOnly}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="comments_to_committee"
                className="block text-sm font-medium text-gray-700"
              >
                Comments to Committee (Confidential)
              </label>
              <textarea
                id="comments_to_committee"
                name="comments_to_committee"
                value={formData.comments_to_committee}
                onChange={handleTextChange}
                disabled={isReadOnly}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Recommendation */}
            <div>
              <label htmlFor="recommendation" className="block text-sm font-medium text-gray-700">
                Recommendation
              </label>
              <select
                id="recommendation"
                value={formData.recommendation || ''}
                onChange={handleRecommendationChange}
                disabled={isReadOnly}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Select Recommendation --</option>
                <option value="accept">Accept</option>
                <option value="minor_revision">Minor Revision</option>
                <option value="major_revision">Major Revision</option>
                <option value="reject">Reject</option>
              </select>
            </div>

            {/* Action Buttons */}
            {!isReadOnly && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/reviewer')}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
