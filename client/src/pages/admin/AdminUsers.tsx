import { useState, useEffect } from 'react';
import userService from '../../services/user.service';
import type { User, UserRole } from '../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoles = (user: User) => {
    setEditingUser(user);
    setSelectedRoles([...user.roles]);
  };

  const handleRoleToggle = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;

    try {
      setError('');
      setSuccess('');
      await userService.updateUserRoles(editingUser.id, selectedRoles);
      setSuccess('User roles updated successfully');
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update roles');
    }
  };

  const handleVerifyEmail = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to manually verify the email for ${userName}?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await userService.verifyUserEmail(userId);
      setSuccess('Email verified successfully');
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify email');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, userEmail: string) => {
    const confirmMessage = `Are you sure you want to delete this user?\n\nName: ${userName}\nEmail: ${userEmail}\n\nThis action cannot be undone!`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await userService.deleteUser(userId);
      setSuccess('User deleted successfully');
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'reviewer':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
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

      {/* Users List - Card View */}
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div className="flex-1 mb-3 md:mb-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-gray-500 break-words">{user.email}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
                  user.is_email_verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user.is_email_verified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex justify-between md:justify-start items-start">
                <span className="text-sm text-gray-600 md:mr-2">Affiliation:</span>
                <span className="text-sm text-gray-900 text-right md:text-left flex-1 break-words">
                  {user.affiliation || '-'}
                </span>
              </div>
              <div className="flex justify-between md:justify-start items-center">
                <span className="text-sm text-gray-600 md:mr-2">Roles:</span>
                <div className="flex flex-wrap gap-1 justify-end md:justify-start">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        role
                      )}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between md:justify-start items-center">
                <span className="text-sm text-gray-600 md:mr-2">Joined:</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={() => handleEditRoles(user)}
                className="w-full md:w-auto px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
              >
                Edit Roles
              </button>
              {!user.is_email_verified && (
                <button
                  onClick={() => handleVerifyEmail(user.id, `${user.first_name} ${user.last_name}`)}
                  className="w-full md:w-auto px-4 py-2 text-sm text-green-600 bg-green-50 rounded hover:bg-green-100"
                >
                  Verify Email
                </button>
              )}
              <button
                onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`, user.email)}
                className="w-full md:w-auto px-4 py-2 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
              >
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.roles.includes('admin')).length}
            </p>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.roles.includes('reviewer')).length}
            </p>
            <p className="text-sm text-gray-600">Reviewers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.is_email_verified).length}
            </p>
            <p className="text-sm text-gray-600">Verified</p>
          </div>
        </div>
      </div>

      {/* Edit Roles Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit User Roles</h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingUser.first_name} {editingUser.last_name} ({editingUser.email})
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Roles:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes('user')}
                      onChange={() => handleRoleToggle('user')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-900">User</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Basic user permissions)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes('reviewer')}
                      onChange={() => handleRoleToggle('reviewer')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-900">Reviewer</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Can review submissions)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes('admin')}
                      onChange={() => handleRoleToggle('admin')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-900">Admin</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Full system access)
                    </span>
                  </label>
                </div>
              </div>

              {selectedRoles.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Warning: User must have at least one role
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setSelectedRoles([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={selectedRoles.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
