import api, { ApiResponse, PaginatedResponse } from './api';

export interface Event {
  id: string;
  villageId: string;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  title: string;
  description?: string;
  coverImage?: string;
  type: 'Online' | 'Offline';
  location: string;
  startTime: string;
  endTime?: string;
  attendeeCount: number;
  status: 'pending' | 'approved' | 'rejected';
  myRsvp?: 'going' | 'interested' | 'not_going' | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  coverImage?: string;
  type: 'Online' | 'Offline';
  location: string;
  startTime: string;
  endTime?: string;
}

export interface RsvpDto {
  status: 'going' | 'interested' | 'not_going';
  name?: string;
  phone?: string;
  note?: string;
}

export interface Attendee {
  id: string;
  name: string;
  avatar?: string;
  rsvpAt: string;
  // Only visible to organizer/admin
  registrationName?: string;
  phone?: string;
  note?: string;
}

export interface AttendeesResponse {
  items: Attendee[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  canSeeDetails: boolean;
}

export const eventService = {
  async getEvents(
    villageId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Event>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Event>>>(
      `/villages/${villageId}/events`,
      { params: { page, pageSize } }
    );
    return response.data.data;
  },

  async getById(id: string): Promise<Event> {
    const response = await api.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data.data;
  },

  async create(villageId: string, data: CreateEventDto): Promise<Event> {
    const response = await api.post<ApiResponse<Event>>(
      `/villages/${villageId}/events`,
      data
    );
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateEventDto>): Promise<Event> {
    const response = await api.patch<ApiResponse<Event>>(`/events/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(
      `/events/${id}`
    );
    return response.data.data;
  },

  async rsvp(id: string, data: RsvpDto): Promise<{ status: string }> {
    const response = await api.post<ApiResponse<{ status: string }>>(
      `/events/${id}/rsvp`,
      data
    );
    return response.data.data;
  },

  async approve(id: string): Promise<{ success: boolean; status: string }> {
    const response = await api.post<ApiResponse<{ success: boolean; status: string }>>(
      `/events/${id}/approve`
    );
    return response.data.data;
  },

  async reject(id: string): Promise<{ success: boolean; status: string }> {
    const response = await api.post<ApiResponse<{ success: boolean; status: string }>>(
      `/events/${id}/reject`
    );
    return response.data.data;
  },

  async getAttendees(id: string, page = 1, pageSize = 20): Promise<AttendeesResponse> {
    const response = await api.get<ApiResponse<AttendeesResponse>>(
      `/events/${id}/attendees`,
      { params: { page, pageSize } }
    );
    return response.data.data;
  },
};
