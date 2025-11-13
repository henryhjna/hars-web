import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/review.service';
import submissionService from '../../services/submission.service';
import type { ReviewAssignment } from '../../types';

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reviewService.getMyAssignments();
      setAssignments(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string, reviewCompleted?: boolean) => {
    if (reviewCompleted) {
      return 'bg-green-100 text-green-800';
    }
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string, reviewCompleted?: boolean) => {
    if (reviewCompleted) return 'Completed';
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const viewPdf = (pdfUrl: string) => {
    const fullUrl = submissionService.getPdfUrl(pdfUrl);
    window.open(fullUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  const pendingAssignments = assignments.filter(
    (a) => !a.review_completed && a.status !== 'completed'
  );
  const completedAssignments = assignments.filter(
    (a) => a.review_completed || a.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reviewer Dashboard</h1>
          <p className="mt-2 text-gray-600">Review assigned submissions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{assignments.length}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {pendingAssignments.length}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {completedAssignments.length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Pending Assignments */}
        {pendingAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Reviews</h2>
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.submission_title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            assignment.status,
                            assignment.review_completed
                          )}`}
                        >
                          {formatStatus(assignment.status, assignment.review_completed)}
                        </span>
                        {assignment.due_date && isOverdue(assignment.due_date) && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {assignment.submission_abstract}
                      </p>

                      <div className="text-sm text-gray-500 space-y-1">
                        {assignment.event_title && (
                          <p>
                            <strong>Event:</strong> {assignment.event_title}
                          </p>
                        )}
                        <p>
                          <strong>Assigned:</strong>{' '}
                          {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                        {assignment.due_date && (
                          <p>
                            <strong>Due Date:</strong>{' '}
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {assignment.pdf_url && (
                        <button
                          onClick={() => viewPdf(assignment.pdf_url!)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          View PDF
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/review/${assignment.submission_id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Start Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Assignments */}
        {completedAssignments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Reviews</h2>
            <div className="space-y-4">
              {completedAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.submission_title}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                        {assignment.review_score && (
                          <span className="text-sm text-gray-600">
                            Score: {Number(assignment.review_score).toFixed(2)}/5
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-500 space-y-1">
                        {assignment.event_title && (
                          <p>
                            <strong>Event:</strong> {assignment.event_title}
                          </p>
                        )}
                        <p>
                          <strong>Completed:</strong>{' '}
                          {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {assignment.pdf_url && (
                        <button
                          onClick={() => viewPdf(assignment.pdf_url!)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          View PDF
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/review/${assignment.submission_id}`)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        View Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {assignments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
            <p className="text-gray-600">
              You haven't been assigned any submissions to review yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
