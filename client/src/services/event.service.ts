import api from './api';
import type { Event, EventCreateData, EventSession, ApiResponse } from '../types';

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

  // Get sessions for an event
  async getSessions(eventId: string): Promise<ApiResponse<EventSession[]>> {
    const response = await api.get<ApiResponse<EventSession[]>>(`/events/${eventId}/sessions`);
    return response.data;
  }

  // Add session to event (admin only)
  async addSession(eventId: string, sessionData: Partial<EventSession>): Promise<ApiResponse<EventSession>> {
    const response = await api.post<ApiResponse<EventSession>>(`/events/${eventId}/sessions`, sessionData);
    return response.data;
  }

  // Update session (admin only)
  async updateSession(eventId: string, sessionId: string, sessionData: Partial<EventSession>): Promise<ApiResponse<EventSession>> {
    const response = await api.put<ApiResponse<EventSession>>(`/events/${eventId}/sessions/${sessionId}`, sessionData);
    return response.data;
  }

  // Delete session (admin only)
  async deleteSession(eventId: string, sessionId: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/events/${eventId}/sessions/${sessionId}`);
    return response.data;
  }
}

export default new EventService();
