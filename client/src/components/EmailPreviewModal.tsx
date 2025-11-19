import React, { useState } from 'react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (comments?: string) => Promise<void>;
  submission: any;
  decision: 'accepted' | 'rejected';
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  onSend,
  submission,
  decision,
}) => {
  const [comments, setComments] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAccepted = decision === 'accepted';
  const gradientColor = isAccepted
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #64748b 0%, #475569 100%)';

  const handleSend = async () => {
    setIsSending(true);
    setError(null);

    try {
      await onSend(comments || undefined);
      setComments('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Preview Decision Email - {isAccepted ? 'Accepted' : 'Rejected'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSending}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Email Preview */}
        <div className="px-6 py-4">
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">
              <strong>To:</strong> {submission.email || 'Author Email'}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Subject:</strong> Decision on Your Submission - {submission.title}
            </div>
          </div>

          {/* Email Content Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div style={{ background: gradientColor }} className="text-white px-8 py-12 text-center">
              <h1 className="text-3xl font-bold mb-4">
                {isAccepted ? 'Congratulations!' : 'Submission Decision'}
              </h1>
              <p className="text-lg opacity-90">
                Your submission to the Hanyang Accounting Research Symposium
              </p>
            </div>

            <div className="px-8 py-6 bg-white">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">Dear {submission.first_name || 'Author'},</p>
                <p className="text-gray-700 mb-4">
                  {isAccepted
                    ? "We are pleased to inform you that your submission has been accepted for presentation at the Hanyang Accounting Research Symposium."
                    : "Thank you for your submission to the Hanyang Accounting Research Symposium. After careful review, we regret to inform you that we are unable to accept your submission for this year's symposium."
                  }
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Submission Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-24">Title:</span>
                    <span className="text-gray-900 flex-1">{submission.title}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">Status:</span>
                    <span className={`font-semibold ${isAccepted ? 'text-green-600' : 'text-gray-600'}`}>
                      {isAccepted ? 'Accepted' : 'Not Accepted'}
                    </span>
                  </div>
                </div>
              </div>

              {comments && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Additional Comments</h4>
                  <p className="text-blue-800 whitespace-pre-wrap">{comments}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {isAccepted ? (
                    <>
                      <li>You will receive further information about the presentation schedule</li>
                      <li>Please confirm your attendance by replying to this email</li>
                      <li>Prepare your presentation according to the symposium guidelines</li>
                    </>
                  ) : (
                    <>
                      <li>We encourage you to consider submitting to future symposiums</li>
                      <li>Your work is valuable and we appreciate your interest</li>
                      <li>Feel free to contact us if you have any questions</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-6 text-center text-sm text-gray-600">
              <p>Hanyang Accounting Research Symposium</p>
              <p>www.hanyanghars.com</p>
            </div>
          </div>
        </div>

        {/* Comments Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            id="comments"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional comments or instructions for the author..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={isSending}
          />
          <p className="mt-1 text-sm text-gray-500">
            These comments will be included in the email sent to the author.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-2">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${
              isAccepted
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {isSending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewModal;
