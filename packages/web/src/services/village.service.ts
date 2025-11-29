import api, { ApiResponse, PaginatedResponse } from './api';

export interface Village {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  coverImage?: string;
  icon?: string;
  currencyName: string;
  currencySymbol: string;
  isPrivate: boolean;
  isSemiPrivate: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  myMembership?: {
    role: string;
    nickname?: string;
    joinedAt: string;
  };
}

export interface CreateVillageDto {
  name: string;
  description?: string;
  category: string;
  currencyName?: string;
  currencySymbol?: string;
  visibility?: 'public' | 'private';
}

export interface JoinVillageDto {
  inviteCode?: string;
}

export interface VillageStats {
  memberCount: number;
  postCount: number;
  eventCount: number;
}

export const villageService = {
  async getAll(page = 1, pageSize = 20): Promise<PaginatedResponse<Village>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Village>>>('/villages', {
      params: { page, pageSize },
    });
    return response.data.data;
  },

  async getById(id: string): Promise<Village> {
    const response = await api.get<ApiResponse<Village>>(`/villages/${id}`);
    return response.data.data;
  },

  async getBySlug(slug: string): Promise<Village> {
    const response = await api.get<ApiResponse<Village>>(`/villages/slug/${slug}`);
    return response.data.data;
  },

  async create(data: CreateVillageDto): Promise<Village> {
    const response = await api.post<ApiResponse<Village>>('/villages', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateVillageDto>): Promise<Village> {
    const response = await api.patch<ApiResponse<Village>>(`/villages/${id}`, data);
    return response.data.data;
  },

  async join(id: string, data?: JoinVillageDto): Promise<{ success: boolean }> {
    const response = await api.post<ApiResponse<{ success: boolean }>>(`/villages/${id}/join`, data || {});
    return response.data.data;
  },

  async leave(id: string): Promise<{ success: boolean }> {
    const response = await api.post<ApiResponse<{ success: boolean }>>(`/villages/${id}/leave`);
    return response.data.data;
  },

  async regenerateInviteCode(id: string): Promise<{ inviteCode: string }> {
    const response = await api.post<ApiResponse<{ inviteCode: string }>>(`/villages/${id}/regenerate-code`);
    return response.data.data;
  },

  async getStats(id: string): Promise<VillageStats> {
    const response = await api.get<ApiResponse<VillageStats>>(`/villages/${id}/stats`);
    return response.data.data;
  },

  async getMyVillages(): Promise<Village[]> {
    const response = await api.get<ApiResponse<Village[]>>('/users/me/villages');
    return response.data.data;
  },
};
