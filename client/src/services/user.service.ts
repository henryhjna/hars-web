import api from './api';
import type { User, ApiResponse, UserRole } from '../types';

class UserService {
  // Get current user profile
  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data;
  }

  // Update current user profile
  async updateMe(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>('/users/me', data);
    return response.data;
  }

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    const response = await api.put<ApiResponse<void>>('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  // Admin: Get all users
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data;
  }

  // Admin: Get user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  // Admin: Update user roles
  async updateUserRoles(id: string, roles: UserRole[]): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/roles`, { roles });
    return response.data;
  }
}

export default new UserService();
