import api, { ApiResponse, PaginatedResponse } from './api';

export interface Member {
  id: string;
  role: string;
  nickname?: string;
  localAvatar?: string;
  bio?: string;
  status?: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    globalId: string;
    email?: string;
    phone?: string;
    location?: string;
    socials?: Record<string, string>;
  };
  privacy?: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showSocials: boolean;
  };
}

export interface UpdateMembershipDto {
  nickname?: string;
  bio?: string;
  status?: string;
  privacy?: {
    showEmail?: boolean;
    showPhone?: boolean;
    showLocation?: boolean;
    showSocials?: boolean;
  };
}

export interface UpdateRoleDto {
  role: 'chief' | 'core_member' | 'villager';
}

export const membershipService = {
  async getMembers(
    villageId: string,
    page = 1,
    pageSize = 20,
    role?: string
  ): Promise<PaginatedResponse<Member>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Member>>>(
      `/villages/${villageId}/members`,
      { params: { page, pageSize, role } }
    );
    return response.data.data;
  },

  async getMember(villageId: string, userId: string): Promise<Member> {
    const response = await api.get<ApiResponse<Member>>(
      `/villages/${villageId}/members/${userId}`
    );
    return response.data.data;
  },

  async updateMyProfile(villageId: string, data: UpdateMembershipDto): Promise<Member> {
    const response = await api.patch<ApiResponse<Member>>(
      `/villages/${villageId}/members/me`,
      data
    );
    return response.data.data;
  },

  async updateMemberRole(
    villageId: string,
    userId: string,
    data: UpdateRoleDto
  ): Promise<Member> {
    const response = await api.patch<ApiResponse<Member>>(
      `/villages/${villageId}/members/${userId}/role`,
      data
    );
    return response.data.data;
  },

  async removeMember(villageId: string, userId: string): Promise<{ success: boolean }> {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(
      `/villages/${villageId}/members/${userId}`
    );
    return response.data.data;
  },
};
