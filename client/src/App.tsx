import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import ReviewerRoute from './components/ReviewerRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import UpcomingEvents from './pages/UpcomingEvents';
import PastEvents from './pages/PastEvents';
import SubmitPaper from './pages/SubmitPaper';
import MySubmissions from './pages/MySubmissions';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventDetails from './pages/admin/AdminEventDetails';
import AdminUsers from './pages/admin/AdminUsers';
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard';
import ReviewForm from './pages/reviewer/ReviewForm';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// Public Route component (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/upcoming-events" element={<Layout><UpcomingEvents /></Layout>} />
      <Route path="/past-events" element={<Layout><PastEvents /></Layout>} />

      {/* Auth routes (redirect if already logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes (require authentication) */}
      <Route
        path="/submit-paper"
        element={
          <ProtectedRoute>
            <Layout><SubmitPaper /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-submissions"
        element={
          <ProtectedRoute>
            <Layout><MySubmissions /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Reviewer routes (require reviewer role) */}
      <Route
        path="/reviewer"
        element={
          <ReviewerRoute>
            <Layout><ReviewerDashboard /></Layout>
          </ReviewerRoute>
        }
      />
      <Route
        path="/review/:submissionId"
        element={
          <ReviewerRoute>
            <Layout><ReviewForm /></Layout>
          </ReviewerRoute>
        }
      />

      {/* Admin routes (require admin role) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/submissions"
        element={
          <AdminRoute>
            <AdminLayout><AdminSubmissions /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <AdminRoute>
            <AdminLayout><AdminEvents /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/events/:eventId"
        element={
          <AdminRoute>
            <AdminLayout><AdminEventDetails /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout><AdminUsers /></AdminLayout>
          </AdminRoute>
        }
      />
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
