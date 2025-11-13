import api from './api';
import type { ConferenceTopic, ApiResponse } from '../types';

class ConferenceTopicService {
  // Get all active conference topics
  async getAllActive(): Promise<ApiResponse<ConferenceTopic[]>> {
    const response = await api.get<ApiResponse<ConferenceTopic[]>>('/conference-topics/active');
    return response.data;
  }

  // Get conference topics by event ID
  async getByEventId(eventId: string): Promise<ApiResponse<ConferenceTopic[]>> {
    const response = await api.get<ApiResponse<ConferenceTopic[]>>(`/conference-topics/event/${eventId}`);
    return response.data;
  }

  // Create conference topic (admin only)
  async create(topicData: Omit<ConferenceTopic, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ConferenceTopic>> {
    const response = await api.post<ApiResponse<ConferenceTopic>>('/conference-topics', topicData);
    return response.data;
  }

  // Update conference topic (admin only)
  async update(id: string, topicData: Partial<ConferenceTopic>): Promise<ApiResponse<ConferenceTopic>> {
    const response = await api.put<ApiResponse<ConferenceTopic>>(`/conference-topics/${id}`, topicData);
    return response.data;
  }

  // Delete conference topic (admin only)
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/conference-topics/${id}`);
    return response.data;
  }
}

export default new ConferenceTopicService();
