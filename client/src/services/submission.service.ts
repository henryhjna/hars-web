import api from './api';
import type { Submission, SubmissionCreateData, ApiResponse } from '../types';

class SubmissionService {
  // Get user's submissions
  async getMySubmissions(): Promise<ApiResponse<Submission[]>> {
    const response = await api.get<ApiResponse<Submission[]>>('/submissions/my-submissions');
    return response.data;
  }

  // Get submission by ID
  async getSubmissionById(id: string): Promise<ApiResponse<Submission>> {
    const response = await api.get<ApiResponse<Submission>>(`/submissions/${id}`);
    return response.data;
  }

  // Create submission with file upload
  async createSubmission(data: SubmissionCreateData): Promise<ApiResponse<Submission>> {
    const formData = new FormData();
    formData.append('event_id', data.event_id);
    formData.append('title', data.title);
    formData.append('abstract', data.abstract);
    formData.append('keywords', data.keywords.join(','));
    formData.append('corresponding_author', data.corresponding_author);
    if (data.co_authors) {
      formData.append('co_authors', data.co_authors);
    }
    formData.append('pdf', data.pdf);
    formData.append('status', 'submitted');

    const response = await api.post<ApiResponse<Submission>>('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Update submission
  async updateSubmission(
    id: string,
    data: Partial<SubmissionCreateData>
  ): Promise<ApiResponse<Submission>> {
    const formData = new FormData();

    if (data.title) formData.append('title', data.title);
    if (data.abstract) formData.append('abstract', data.abstract);
    if (data.keywords) formData.append('keywords', data.keywords.join(','));
    if (data.corresponding_author) formData.append('corresponding_author', data.corresponding_author);
    if (data.co_authors) formData.append('co_authors', data.co_authors);
    if (data.pdf) formData.append('pdf', data.pdf);

    const response = await api.put<ApiResponse<Submission>>(`/submissions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Delete submission
  async deleteSubmission(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/submissions/${id}`);
    return response.data;
  }

  // Admin: Get all submissions with pagination
  async getAllSubmissions(page: number = 1, limit: number = 20): Promise<any> {
    const response = await api.get<any>(`/submissions?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Admin: Get submissions by event
  async getEventSubmissions(eventId: string): Promise<ApiResponse<Submission[]>> {
    const response = await api.get<ApiResponse<Submission[]>>(`/submissions/event/${eventId}`);
    return response.data;
  }

  // Admin: Update submission status
  async updateSubmissionStatus(id: string, status: string): Promise<ApiResponse<Submission>> {
    const response = await api.patch<ApiResponse<Submission>>(`/submissions/${id}/status`, {
      status,
    });
    return response.data;
  }

  // Get PDF URL
  getPdfUrl(pdfUrl: string): string {
    // S3 URLs are returned as-is (already full HTTPS URLs)
    return pdfUrl;
  }
}

export default new SubmissionService();
