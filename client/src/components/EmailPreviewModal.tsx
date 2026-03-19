import React, { useState, useEffect, useRef } from 'react';
import submissionService from '../services/submission.service';

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
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [previewTo, setPreviewTo] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load preview from server whenever comments change (debounced)
  useEffect(() => {
    if (!isOpen || !submission) return;

    const timer = setTimeout(() => {
      loadPreview();
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, submission?.id, decision, comments]);

  const loadPreview = async () => {
    try {
      setPreviewLoading(true);
      const response = await submissionService.previewDecisionEmail(
        submission.id,
        decision,
        comments || undefined
      );
      if (response.data) {
        setPreviewHtml(response.data.html);
        setPreviewSubject(response.data.subject);
        setPreviewTo(response.data.to);
      }
    } catch (err) {
      console.error('Failed to load email preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Write HTML to iframe when preview changes
  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml]);

  if (!isOpen) return null;

  const isAccepted = decision === 'accepted';

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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
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

        {/* Email Metadata */}
        <div className="px-6 py-3">
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">
              <strong>To:</strong> {previewTo || submission.email || 'Loading...'}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Subject:</strong> {previewSubject || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Email Preview - rendered from server HTML */}
        <div className="px-6 py-2">
          <div className="border border-gray-200 rounded-lg overflow-hidden relative" style={{ minHeight: '400px' }}>
            {previewLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              title="Email Preview"
              className="w-full border-0"
              style={{ height: '500px' }}
              sandbox="allow-same-origin"
            />
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
            These comments will be included in the email. The preview above updates automatically.
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
