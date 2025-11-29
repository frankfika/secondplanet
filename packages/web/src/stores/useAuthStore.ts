import { create } from 'zustand';
import { authService, User, LoginDto, RegisterDto, getAccessToken } from '../services';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (data: LoginDto) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || '登录失败',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data: RegisterDto) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || '注册失败',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
