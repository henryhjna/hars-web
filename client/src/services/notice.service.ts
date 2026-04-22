import api from './api';
import type { SiteNotice, NoticeSeverity, ApiResponse } from '../types';

export interface NoticePayload {
  title: string;
  body: string;
  severity: NoticeSeverity;
  is_active: boolean;
}

class NoticeService {
  async getActive(): Promise<ApiResponse<SiteNotice | null>> {
    const response = await api.get<ApiResponse<SiteNotice | null>>('/notices/active');
    return response.data;
  }

  async getAll(): Promise<ApiResponse<SiteNotice[]>> {
    const response = await api.get<ApiResponse<SiteNotice[]>>('/notices');
    return response.data;
  }

  async create(payload: NoticePayload): Promise<ApiResponse<SiteNotice>> {
    const response = await api.post<ApiResponse<SiteNotice>>('/notices', payload);
    return response.data;
  }

  async update(id: string, payload: Partial<NoticePayload>): Promise<ApiResponse<SiteNotice>> {
    const response = await api.put<ApiResponse<SiteNotice>>(`/notices/${id}`, payload);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/notices/${id}`);
    return response.data;
  }
}

export default new NoticeService();
