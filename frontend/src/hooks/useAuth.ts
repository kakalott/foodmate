import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    profile: store.profile,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.profile?.role === 'admin',
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    loadUser: store.loadUser,
    clearError: store.clearError,
  };
};
