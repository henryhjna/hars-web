import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import submissionService from '../services/submission.service';
import type { Submission } from '../types';

export default function MySubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionService.getMySubmissions();
      if (response.success && response.data) {
        setSubmissions(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      setDeleteError('');
      setDeleteSuccess('');
      const response = await submissionService.deleteSubmission(id);
      if (response.success) {
        setDeleteSuccess('Submission deleted successfully');
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete submission');
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

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadSubmissions}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">My Submissions</h2>
          <button
            onClick={() => navigate('/submit-paper')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit New Paper
          </button>
        </div>

        {deleteError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {deleteError}
          </div>
        )}

        {deleteSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            {deleteSuccess}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't submitted any papers yet.</p>
            <button
              onClick={() => navigate('/submit-paper')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Your First Paper
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {submission.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          submission.status
                        )}`}
                      >
                        {formatStatus(submission.status)}
                      </span>
                    </div>

                    {submission.event_title && (
                      <p className="text-sm text-gray-600 mb-2">
                        Event: {submission.event_title}
                        {submission.event_date &&
                          ` - ${new Date(submission.event_date).toLocaleDateString()}`}
                      </p>
                    )}

                    <p className="text-gray-700 mb-3 line-clamp-2">{submission.abstract}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {submission.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Corresponding Author:</strong> {submission.corresponding_author}
                      </p>
                      {submission.co_authors && (
                        <p>
                          <strong>Co-authors:</strong> {submission.co_authors}
                        </p>
                      )}
                      <p>
                        <strong>Submitted:</strong>{' '}
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                      {submission.pdf_size && (
                        <p>
                          <strong>File Size:</strong>{' '}
                          {(submission.pdf_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => viewPdf(submission.pdf_url)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      View PDF
                    </button>
                    {submission.status === 'draft' || submission.status === 'submitted' ? (
                      <>
                        <button
                          onClick={() => navigate(`/edit-submission/${submission.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(`/submission/${submission.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
