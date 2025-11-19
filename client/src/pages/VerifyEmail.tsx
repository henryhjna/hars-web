import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth.service';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing. Please check your email link.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Email verification failed. The link may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h1>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">You will be redirected to the login page in a few seconds...</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Register Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
