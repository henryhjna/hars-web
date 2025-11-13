import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Badge from './ui/Badge';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/images/2023-1.png"
                  alt="Hanyang University School of Business"
                  className="h-10"
                />
                <span className="text-xl font-bold text-primary-600 hidden sm:inline">
                  HARS
                </span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                >
                  Home
                </Link>
                <Link
                  to="/upcoming-events"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Upcoming Events
                </Link>
                <Link
                  to="/past-events"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Past Events
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  About
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                {isAuthenticated ? (
                  <>
                    {user?.roles.includes('reviewer') && (
                      <Link to="/reviewer">
                        <Badge variant="accent" size="sm" rounded>
                          Reviewer Dashboard
                        </Badge>
                      </Link>
                    )}
                    {user?.roles.includes('admin') && (
                      <Link to="/admin">
                        <Badge variant="gradient" size="sm" rounded>
                          Admin Panel
                        </Badge>
                      </Link>
                    )}
                    <Link
                      to="/my-submissions"
                      className="text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      My Submissions
                    </Link>
                    <span className="text-sm text-gray-700">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-primary-500 text-base font-medium text-primary-700 bg-primary-50"
              >
                Home
              </Link>
              <Link
                to="/upcoming-events"
                onClick={() => setMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                Upcoming Events
              </Link>
              <Link
                to="/past-events"
                onClick={() => setMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                Past Events
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                About
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <div className="px-4 pb-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                  <Link
                    to="/my-submissions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    My Submissions
                  </Link>
                  {user?.roles.includes('reviewer') && (
                    <Link
                      to="/reviewer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Reviewer Dashboard
                    </Link>
                  )}
                  {user?.roles.includes('admin') && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="px-4 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Hanyang Accounting Research
            Symposium. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
