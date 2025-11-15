import api from './api';
import type { FacultyMember, CreateFacultyInput, UpdateFacultyInput, ApiResponse } from '../types';

class FacultyService {
  // Get all faculty members
  async getAll(activeOnly: boolean = false): Promise<ApiResponse<FacultyMember[]>> {
    const response = await api.get(`/faculty${activeOnly ? '?active=true' : ''}`);
    return response.data;
  }

  // Get single faculty member
  async getById(id: string): Promise<ApiResponse<FacultyMember>> {
    const response = await api.get(`/faculty/${id}`);
    return response.data;
  }

  // Create faculty member (admin only)
  async create(data: CreateFacultyInput): Promise<ApiResponse<FacultyMember>> {
    const response = await api.post('/faculty', data);
    return response.data;
  }

  // Update faculty member (admin only)
  async update(id: string, data: UpdateFacultyInput): Promise<ApiResponse<FacultyMember>> {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data;
  }

  // Delete faculty member (admin only)
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/faculty/${id}`);
    return response.data;
  }
}

export default new FacultyService();
