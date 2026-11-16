import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type AuthUser } from '../services/auth';
import type { UserProfile } from '../types';

interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
          throw err;
        }
      },

      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.register(email, password, displayName);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await authService.logout();
        set({ user: null, profile: null, isAuthenticated: false });
      },

      loadUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getUser();
          set({
            user,
            profile: user?.profile || null,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      setProfile: (profile) => set({ profile }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'fm-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
