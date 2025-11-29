import api, { ApiResponse, PaginatedResponse } from './api';

export interface Post {
  id: string;
  villageId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  images: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface CreatePostDto {
  content: string;
  images?: string[];
  tags?: string[];
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

export const postService = {
  async getPosts(
    villageId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Post>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Post>>>(
      `/villages/${villageId}/posts`,
      { params: { page, pageSize } }
    );
    return response.data.data;
  },

  async getById(id: string): Promise<Post> {
    const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data.data;
  },

  async create(villageId: string, data: CreatePostDto): Promise<Post> {
    const response = await api.post<ApiResponse<Post>>(
      `/villages/${villageId}/posts`,
      data
    );
    return response.data.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(`/posts/${id}`);
    return response.data.data;
  },

  async like(id: string): Promise<{ liked: boolean }> {
    const response = await api.post<ApiResponse<{ liked: boolean }>>(`/posts/${id}/like`);
    return response.data.data;
  },

  async unlike(id: string): Promise<{ liked: boolean }> {
    const response = await api.delete<ApiResponse<{ liked: boolean }>>(`/posts/${id}/like`);
    return response.data.data;
  },

  async getComments(postId: string): Promise<Comment[]> {
    const response = await api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`);
    return response.data.data;
  },

  async createComment(postId: string, data: CreateCommentDto): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>(
      `/posts/${postId}/comments`,
      data
    );
    return response.data.data;
  },
};
