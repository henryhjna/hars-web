import api from './api';
import type { Event, EventCreateData, ApiResponse } from '../types';

class EventService {
  // Get all events
  async getAllEvents(): Promise<ApiResponse<Event[]>> {
    const response = await api.get<ApiResponse<Event[]>>('/events');
    return response.data;
  }

  // Get upcoming events
  async getUpcomingEvents(): Promise<ApiResponse<Event[]>> {
    const response = await api.get<ApiResponse<Event[]>>('/events/upcoming');
    return response.data;
  }

  // Get past events
  async getPastEvents(): Promise<ApiResponse<Event[]>> {
    const response = await api.get<ApiResponse<Event[]>>('/events/past');
    return response.data;
  }

  // Get event by ID
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    const response = await api.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data;
  }

  // Create event (admin only)
  async createEvent(eventData: EventCreateData): Promise<ApiResponse<Event>> {
    const response = await api.post<ApiResponse<Event>>('/events', eventData);
    return response.data;
  }

  // Update event (admin only)
  async updateEvent(id: string, eventData: Partial<EventCreateData>): Promise<ApiResponse<Event>> {
    const response = await api.put<ApiResponse<Event>>(`/events/${id}`, eventData);
    return response.data;
  }

  // Delete event (admin only)
  async deleteEvent(id: string, hardDelete = false): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/events/${id}?hard=${hardDelete}`);
    return response.data;
  }
}

export default new EventService();
