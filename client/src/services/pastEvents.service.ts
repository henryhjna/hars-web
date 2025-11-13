import api from './api';
import type {
  ApiResponse,
  EventPhoto,
  EventPhotoCreateData,
  KeynoteSpeaker,
  KeynoteSpeakerCreateData,
  Testimonial,
  TestimonialCreateData,
} from '../types';

class PastEventsService {
  // Event Photos
  async getEventPhotos(eventId: string): Promise<EventPhoto[]> {
    const response = await api.get<ApiResponse<EventPhoto[]>>(
      `/photos/event/${eventId}`
    );
    return response.data.data || [];
  }

  async getHighlightPhotos(eventId: string): Promise<EventPhoto[]> {
    const response = await api.get<ApiResponse<EventPhoto[]>>(
      `/photos/event/${eventId}/highlights`
    );
    return response.data.data || [];
  }

  async createEventPhoto(
    eventId: string,
    data: Omit<EventPhotoCreateData, 'event_id'>
  ): Promise<EventPhoto> {
    const response = await api.post<ApiResponse<EventPhoto>>('/photos', {
      ...data,
      event_id: eventId,
    });
    return response.data.data!;
  }

  async updateEventPhoto(
    id: string,
    data: Partial<EventPhotoCreateData>
  ): Promise<EventPhoto> {
    const response = await api.put<ApiResponse<EventPhoto>>(`/photos/${id}`, data);
    return response.data.data!;
  }

  async deleteEventPhoto(id: string): Promise<void> {
    await api.delete(`/photos/${id}`);
  }

  // Keynote Speakers
  async getEventSpeakers(eventId: string): Promise<KeynoteSpeaker[]> {
    const response = await api.get<ApiResponse<KeynoteSpeaker[]>>(
      `/speakers/event/${eventId}`
    );
    return response.data.data || [];
  }

  async createEventSpeaker(
    eventId: string,
    data: Omit<KeynoteSpeakerCreateData, 'event_id'>
  ): Promise<KeynoteSpeaker> {
    const response = await api.post<ApiResponse<KeynoteSpeaker>>('/speakers', {
      ...data,
      event_id: eventId,
    });
    return response.data.data!;
  }

  async updateEventSpeaker(
    id: string,
    data: Partial<KeynoteSpeakerCreateData>
  ): Promise<KeynoteSpeaker> {
    const response = await api.put<ApiResponse<KeynoteSpeaker>>(
      `/speakers/${id}`,
      data
    );
    return response.data.data!;
  }

  async deleteEventSpeaker(id: string): Promise<void> {
    await api.delete(`/speakers/${id}`);
  }

  // Testimonials
  async getEventTestimonials(eventId: string): Promise<Testimonial[]> {
    const response = await api.get<ApiResponse<Testimonial[]>>(
      `/testimonials/event/${eventId}`
    );
    return response.data.data || [];
  }

  async getFeaturedTestimonials(eventId: string): Promise<Testimonial[]> {
    const response = await api.get<ApiResponse<Testimonial[]>>(
      `/testimonials/event/${eventId}/featured`
    );
    return response.data.data || [];
  }

  async createEventTestimonial(
    eventId: string,
    data: Omit<TestimonialCreateData, 'event_id'>
  ): Promise<Testimonial> {
    const response = await api.post<ApiResponse<Testimonial>>('/testimonials', {
      ...data,
      event_id: eventId,
    });
    return response.data.data!;
  }

  async updateEventTestimonial(
    id: string,
    data: Partial<TestimonialCreateData>
  ): Promise<Testimonial> {
    const response = await api.put<ApiResponse<Testimonial>>(
      `/testimonials/${id}`,
      data
    );
    return response.data.data!;
  }

  async deleteEventTestimonial(id: string): Promise<void> {
    await api.delete(`/testimonials/${id}`);
  }
}

export default new PastEventsService();
