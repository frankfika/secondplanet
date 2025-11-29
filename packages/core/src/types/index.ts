// ============================================
// Global Village - Shared Type Definitions
// ============================================

// --- User ---
export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  avatar?: string;
  globalId: string;
  location?: string;
  socials?: UserSocials;
  createdAt: string;
  updatedAt: string;
}

export interface UserSocials {
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface UserProfile {
  id: string;
  global: {
    name: string;
    email?: string;
    avatar?: string;
    globalId: string;
  };
  local: Record<string, LocalProfile>;
}

// --- Village ---
export interface Village {
  id: string;
  name: string;
  slug: string;
  category: VillageCategory;
  description: string;
  announcement?: string;
  coverImage: string;
  icon: string;
  currency: VillageCurrency;
  visibility: 'public' | 'private';
  inviteCode?: string;
  memberCount: number;
  onlineCount?: number;
  constitution?: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type VillageCategory = 'Interest' | 'Professional' | 'Region' | 'Lifestyle';

export interface VillageCurrency {
  name: string;
  symbol: string;
}

export interface CreateVillageDto {
  name: string;
  category: VillageCategory;
  description?: string;
  currencyName?: string;
  currencySymbol?: string;
  visibility?: 'public' | 'private';
}

export interface UpdateVillageDto {
  name?: string;
  description?: string;
  announcement?: string;
  coverImage?: string;
  icon?: string;
  visibility?: 'public' | 'private';
  constitution?: string[];
}

// --- Membership ---
export interface Membership {
  id: string;
  userId: string;
  villageId: string;
  nickname: string;
  bio: string;
  localAvatar?: string;
  status?: string;
  role: MemberRole;
  privacy: PrivacySettings;
  balance: number;
  joinedAt: string;
  updatedAt: string;
}

export type MemberRole = 'chief' | 'core_member' | 'villager';

export interface LocalProfile {
  nickname: string;
  bio: string;
  avatar?: string;
  role: MemberRole;
  joinedAt: string;
  privacy: PrivacySettings;
}

export interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showSocials: boolean;
}

export interface UpdateLocalProfileDto {
  nickname?: string;
  bio?: string;
  status?: string;
  privacy?: Partial<PrivacySettings>;
}

// --- Member (for display) ---
export interface Member {
  id: string;
  userId: string;
  name: string;
  nickname: string;
  avatar?: string;
  role: MemberRole;
  status?: string;
  joinedAt: string;
  // Privacy-controlled fields
  email?: string;
  phone?: string;
  location?: string;
  socials?: UserSocials;
  privacy: PrivacySettings;
}

// --- Post ---
export interface Post {
  id: string;
  villageId: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  images?: string[];
  tags?: string[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostAuthor {
  id: string;
  name: string;
  avatar?: string;
  role: MemberRole;
}

export interface CreatePostDto {
  content: string;
  images?: string[];
  tags?: string[];
}

// --- Comment ---
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: PostAuthor;
  parentId?: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

// --- Event ---
export interface VillageEvent {
  id: string;
  villageId: string;
  organizerId: string;
  organizer: PostAuthor;
  title: string;
  description?: string;
  coverImage?: string;
  type: 'online' | 'offline';
  location: string;
  startTime: string;
  endTime?: string;
  attendeeCount: number;
  myRsvpStatus?: RsvpStatus;
  createdAt: string;
  updatedAt: string;
}

export type RsvpStatus = 'going' | 'maybe' | 'not_going';

export interface CreateEventDto {
  title: string;
  description?: string;
  coverImage?: string;
  type: 'online' | 'offline';
  location: string;
  startTime: string;
  endTime?: string;
}

// --- Quest ---
export interface Quest {
  id: string;
  villageId: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'one_time';
  actionType: QuestAction;
  actionCount: number;
  reward: number;
  isActive: boolean;
  progress?: QuestProgress;
}

export type QuestAction = 'post' | 'comment' | 'like' | 'invite' | 'attend_event';

export interface QuestProgress {
  progress: number;
  completed: boolean;
  completedAt?: string;
}

// --- Notification ---
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'post_liked'
  | 'post_commented'
  | 'contact_request'
  | 'contact_approved'
  | 'event_reminder'
  | 'quest_completed'
  | 'announcement'
  | 'new_member';

// --- Contact Request ---
export interface ContactRequest {
  id: string;
  requesterId: string;
  requester: PostAuthor;
  targetId: string;
  villageId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

// --- Auth ---
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface PhoneLoginDto {
  phone: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email?: string;
  iat: number;
  exp: number;
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

// --- Error Codes ---
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_INVITE_CODE: 'INVALID_INVITE_CODE',
  VILLAGE_PRIVATE: 'VILLAGE_PRIVATE',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
