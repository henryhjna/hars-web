import api from './api';
import type {
  Registration,
  RegistrationCreateData,
  RegistrationStatus,
  ApiResponse,
  PaginatedResponse,
} from '../types';

class RegistrationService {
  async createRegistration(data: RegistrationCreateData): Promise<ApiResponse<Registration>> {
    const response = await api.post<ApiResponse<Registration>>('/registrations', data);
    return response.data;
  }

  async getMyRegistrations(): Promise<ApiResponse<Registration[]>> {
    const response = await api.get<ApiResponse<Registration[]>>('/registrations/my-registrations');
    return response.data;
  }

  async getRegistrationById(id: string): Promise<ApiResponse<Registration>> {
    const response = await api.get<ApiResponse<Registration>>(`/registrations/${id}`);
    return response.data;
  }

  async cancelRegistration(id: string): Promise<ApiResponse<Registration>> {
    const response = await api.post<ApiResponse<Registration>>(`/registrations/${id}/cancel`);
    return response.data;
  }

  // Admin
  async getAllRegistrations(
    page: number = 1,
    limit: number = 20,
    filters?: { eventId?: string; status?: string }
  ): Promise<PaginatedResponse<Registration>> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (filters?.eventId) params.append('eventId', filters.eventId);
    if (filters?.status) params.append('status', filters.status);
    const response = await api.get<PaginatedResponse<Registration>>(
      `/registrations?${params.toString()}`
    );
    return response.data;
  }

  async getEventRegistrations(eventId: string): Promise<ApiResponse<Registration[]>> {
    const response = await api.get<ApiResponse<Registration[]>>(
      `/registrations/event/${eventId}`
    );
    return response.data;
  }

  async getOverallStats(): Promise<
    ApiResponse<{ total: number; registered: number; cancelled: number }>
  > {
    const response = await api.get<
      ApiResponse<{ total: number; registered: number; cancelled: number }>
    >('/registrations/stats/overall');
    return response.data;
  }

  async getEventStats(eventId: string): Promise<
    ApiResponse<{ total: number; registered: number; cancelled: number; lunch: number; dinner: number }>
  > {
    const response = await api.get<
      ApiResponse<{ total: number; registered: number; cancelled: number; lunch: number; dinner: number }>
    >(`/registrations/event/${eventId}/stats`);
    return response.data;
  }

  async updateRegistration(
    id: string,
    data: { status?: RegistrationStatus; lunch?: boolean; dinner?: boolean }
  ): Promise<ApiResponse<Registration>> {
    const response = await api.patch<ApiResponse<Registration>>(`/registrations/${id}`, data);
    return response.data;
  }

  async deleteRegistration(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/registrations/${id}`);
    return response.data;
  }

  async resendConfirmation(id: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(
      `/registrations/${id}/resend-confirmation`
    );
    return response.data;
  }

  async downloadEventCsv(eventId: string, eventTitle: string): Promise<void> {
    const response = await api.get(`/registrations/event/${eventId}/csv`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safe = eventTitle.replace(/[^a-z0-9]+/gi, '_');
    link.setAttribute('download', `registrations_${safe}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new RegistrationService();
