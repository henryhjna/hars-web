import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon, FileText, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Badge from './ui/Badge';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserInitials = () => {
    if (!user) return '';
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
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
              <div className="hidden lg:ml-8 lg:flex lg:space-x-8">
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
              <div className="hidden lg:flex lg:items-center lg:space-x-4">
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

                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                      >
                        {user?.photo_url ? (
                          <img
                            src={user.photo_url}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center border-2 border-gray-200">
                            <span className="text-xs font-bold text-white">{getUserInitials()}</span>
                          </div>
                        )}
                        <span>{user?.first_name} {user?.last_name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <Link
                            to="/my-page"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <UserIcon className="w-4 h-4 text-gray-500" />
                            My Profile
                          </Link>
                          <Link
                            to="/my-submissions"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FileText className="w-4 h-4 text-gray-500" />
                            My Submissions
                          </Link>
                          <Link
                            to="/my-page/change-password"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Settings className="w-4 h-4 text-gray-500" />
                            Change Password
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
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
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
          <div className="lg:hidden">
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
                    <div className="flex items-center gap-3">
                      {user?.photo_url ? (
                        <img
                          src={user.photo_url}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center border-2 border-gray-200">
                          <span className="text-sm font-bold text-white">{getUserInitials()}</span>
                        </div>
                      )}
                      <div>
                        <div className="text-base font-medium text-gray-800">
                          {user?.first_name} {user?.last_name}
                        </div>
                        <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/my-page"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <UserIcon className="w-5 h-5" />
                    My Profile
                  </Link>
                  <Link
                    to="/my-submissions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <FileText className="w-5 h-5" />
                    My Submissions
                  </Link>
                  <Link
                    to="/my-page/change-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <Settings className="w-5 h-5" />
                    Change Password
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
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
                  {(user?.roles.includes('reviewer') || user?.roles.includes('admin')) && (
                    <div className="border-t border-gray-200 my-2"></div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
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
