import { useState, useEffect } from 'react';
import submissionService from '../../services/submission.service';
import eventService from '../../services/event.service';
import reviewService from '../../services/review.service';
import userService from '../../services/user.service';
import type { Submission, Event, SubmissionStatus, User, ReviewAssignment, Review } from '../../types';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Reviewer assignment modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // View reviews modal state
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Use admin endpoint to get ALL submissions
      const [submissionsResponse, eventsResponse, usersResponse] = await Promise.all([
        submissionService.getAllSubmissions(),
        eventService.getAllEvents(),
        userService.getAllUsers(),
      ]);

      setSubmissions(submissionsResponse.data || []);
      setEvents(eventsResponse.data || []);

      // Filter users with reviewer role
      const reviewerUsers = (usersResponse.data || []).filter((user: User) =>
        user.roles.includes('reviewer')
      );
      setReviewers(reviewerUsers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: SubmissionStatus) => {
    try {
      setError('');
      setSuccess('');

      // Update submission status
      await submissionService.updateSubmissionStatus(submissionId, newStatus);
      setSuccess('Status updated successfully');

      // Reload data
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openAssignModal = async (submission: Submission) => {
    setSelectedSubmission(submission);
    setAssignModalOpen(true);
    setSelectedReviewer('');
    setDueDate('');

    // Load existing assignments
    try {
      setAssignmentsLoading(true);
      const response = await reviewService.getSubmissionAssignments(submission.id);
      setAssignments(response.data || []);
    } catch (err: any) {
      console.error('Failed to load assignments:', err);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedSubmission || !selectedReviewer) {
      setError('Please select a reviewer');
      return;
    }

    try {
      setError('');
      setSuccess('');

      await reviewService.assignReviewer(selectedSubmission.id, selectedReviewer, dueDate || undefined);
      setSuccess('Reviewer assigned successfully');

      // Reload assignments
      const response = await reviewService.getSubmissionAssignments(selectedSubmission.id);
      setAssignments(response.data || []);

      setSelectedReviewer('');
      setDueDate('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign reviewer');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this reviewer assignment?')) {
      return;
    }

    try {
      setError('');
      await reviewService.removeReviewerAssignment(assignmentId);
      setSuccess('Reviewer assignment removed');

      // Reload assignments
      if (selectedSubmission) {
        const response = await reviewService.getSubmissionAssignments(selectedSubmission.id);
        setAssignments(response.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove assignment');
    }
  };

  const openReviewsModal = async (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewsModalOpen(true);

    try {
      setReviewsLoading(true);
      const response = await reviewService.getSubmissionReviews(submission.id);
      setReviews(response.data?.reviews || []);
      setReviewStats(response.data?.stats || null);
    } catch (err: any) {
      console.error('Failed to load reviews:', err);
      setReviews([]);
      setReviewStats(null);
    } finally {
      setReviewsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewPdf = (pdfUrl: string) => {
    const fullUrl = submissionService.getPdfUrl(pdfUrl);
    window.open(fullUrl, '_blank');
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesEvent = selectedEvent === 'all' || submission.event_id === selectedEvent;
    const matchesStatus = selectedStatus === 'all' || submission.status === selectedStatus;
    return matchesEvent && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Submissions</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Event
            </label>
            <select
              id="event-filter"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="revision_requested">Revision Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No submissions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{submission.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {submission.abstract}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.event_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.corresponding_author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={submission.status}
                      onChange={(e) =>
                        handleStatusChange(submission.id, e.target.value as SubmissionStatus)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        submission.status
                      )} border-0 cursor-pointer`}
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="revision_requested">Revision Requested</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => viewPdf(submission.pdf_url)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View PDF
                      </button>
                      <button
                        onClick={() => openReviewsModal(submission)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        View Reviews
                      </button>
                      <button
                        onClick={() => openAssignModal(submission)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Assign Reviewer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600">
          Showing {filteredSubmissions.length} of {submissions.length} submissions
        </p>
      </div>

      {/* View Reviews Modal */}
      {reviewsModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedSubmission.title}</p>
              </div>
              <button
                onClick={() => setReviewsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews submitted yet</p>
              </div>
            ) : (
              <>
                {/* Review Statistics */}
                {reviewStats && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">{reviewStats.total_reviews}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{reviewStats.completed_reviews}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {reviewStats.avg_score ? parseFloat(reviewStats.avg_score).toFixed(2) : 'N/A'}/5
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Recommendations</p>
                        <p className="text-xs text-gray-700">
                          Accept: {reviewStats.accept_count} | Reject: {reviewStats.reject_count}
                          <br />
                          Minor Rev: {reviewStats.minor_revision_count} | Major Rev: {reviewStats.major_revision_count}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">Reviewer #{index + 1}</h4>
                          <p className="text-sm text-gray-600">{review.reviewer_name || 'Anonymous'}</p>
                        </div>
                        <div className="text-right">
                          {review.is_completed ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Completed
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              In Progress
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-600">Originality</p>
                          <p className="text-lg font-bold text-gray-900">{review.originality_score || '-'}/5</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-600">Methodology</p>
                          <p className="text-lg font-bold text-gray-900">{review.methodology_score || '-'}/5</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-600">Clarity</p>
                          <p className="text-lg font-bold text-gray-900">{review.clarity_score || '-'}/5</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-600">Contribution</p>
                          <p className="text-lg font-bold text-gray-900">{review.contribution_score || '-'}/5</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <p className="text-xs text-blue-600">Overall</p>
                          <p className="text-lg font-bold text-blue-900">
                            {review.overall_score ? Number(review.overall_score).toFixed(2) : '-'}/5
                          </p>
                        </div>
                      </div>

                      {/* Recommendation */}
                      {review.recommendation && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                            review.recommendation === 'accept' ? 'bg-green-100 text-green-800' :
                            review.recommendation === 'reject' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {review.recommendation.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Comments */}
                      <div className="space-y-3">
                        {review.strengths && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Strengths:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{review.strengths}</p>
                          </div>
                        )}
                        {review.weaknesses && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Weaknesses:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{review.weaknesses}</p>
                          </div>
                        )}
                        {review.comments_to_authors && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Comments to Authors:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{review.comments_to_authors}</p>
                          </div>
                        )}
                        {review.comments_to_committee && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Comments to Committee (Confidential):</p>
                            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">{review.comments_to_committee}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setReviewsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Reviewer Modal */}
      {assignModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Assign Reviewers</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedSubmission.title}</p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Assignments */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Assignments</h3>
              {assignmentsLoading ? (
                <p className="text-gray-500">Loading assignments...</p>
              ) : assignments.length === 0 ? (
                <p className="text-gray-500">No reviewers assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{assignment.reviewer_name}</p>
                        <p className="text-sm text-gray-600">{assignment.reviewer_email}</p>
                        {assignment.due_date && (
                          <p className="text-xs text-gray-500">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        )}
                        {assignment.review_completed && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Review Completed
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Assignment */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Reviewer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Reviewer
                  </label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Reviewer --</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.first_name} {reviewer.last_name} ({reviewer.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAssignReviewer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Assign Reviewer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
