import { createClient } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface AuthUser {
  id: string;
  email?: string;
  role?: 'admin' | 'user';
  display_name?: string;
  profile?: UserProfile;
}

// Demo accounts for instant testing without mandatory Supabase
const DEMO_ACCOUNTS: Record<string, AuthUser & { password: string }> = {
  'admin@foodmate.ai': {
    id: 'demo-admin-uuid',
    email: 'admin@foodmate.ai',
    password: 'admin',
    role: 'admin',
    display_name: 'Quản trị viên FoodMate',
    profile: {
      id: 'demo-admin-uuid',
      display_name: 'Quản trị viên FoodMate',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
  },
  'user@foodmate.ai': {
    id: 'demo-user-uuid',
    email: 'user@foodmate.ai',
    password: 'user123',
    role: 'user',
    display_name: 'Nguyễn Văn Ẩm Thực',
    profile: {
      id: 'demo-user-uuid',
      display_name: 'Nguyễn Văn Ẩm Thực',
      role: 'user',
      created_at: new Date().toISOString(),
    },
  },
};

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    // 1. Check demo accounts first for seamless local development
    const normalizedEmail = email.toLowerCase().trim();
    if (DEMO_ACCOUNTS[normalizedEmail]) {
      const demo = DEMO_ACCOUNTS[normalizedEmail];
      if (demo.password === password) {
        localStorage.setItem('fm_token', 'demo-token-' + demo.role);
        localStorage.setItem('fm_user', JSON.stringify(demo));
        return {
          id: demo.id,
          email: demo.email,
          role: demo.role,
          display_name: demo.display_name,
          profile: demo.profile,
        };
      } else {
        throw new Error('Mật khẩu không chính xác');
      }
    }

    // 2. Try Supabase if configured
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Đăng nhập thất bại');
      const token = data.session?.access_token;
      if (token) localStorage.setItem('fm_token', token);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'user',
        display_name: profile?.display_name || data.user.email,
        profile: profile || undefined,
      };
    }

    // Fallback: create mock session
    const mockUser: AuthUser = {
      id: 'mock-user-' + Date.now(),
      email,
      role: email.includes('admin') ? 'admin' : 'user',
      display_name: email.split('@')[0],
      profile: {
        id: 'mock-user-' + Date.now(),
        display_name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user',
        created_at: new Date().toISOString(),
      },
    };
    localStorage.setItem('fm_token', 'mock-token');
    localStorage.setItem('fm_user', JSON.stringify(mockUser));
    return mockUser;
  },

  async register(email: string, password: string, displayName: string): Promise<AuthUser> {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Đăng ký thất bại');
      return { id: data.user.id, email: data.user.email, display_name: displayName, role: 'user' };
    }

    // Demo/Mock registration
    const newUser: AuthUser = {
      id: 'user-' + Date.now(),
      email,
      role: 'user',
      display_name: displayName,
      profile: {
        id: 'user-' + Date.now(),
        display_name: displayName,
        role: 'user',
        created_at: new Date().toISOString(),
      },
    };
    localStorage.setItem('fm_token', 'mock-token');
    localStorage.setItem('fm_user', JSON.stringify(newUser));
    return newUser;
  },

  async logout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('fm_token');
    localStorage.removeItem('fm_user');
  },

  async getUser(): Promise<AuthUser | null> {
    // Check local storage demo first
    const saved = localStorage.getItem('fm_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }

    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'user',
        display_name: profile?.display_name,
        profile: profile || undefined,
      };
    }

    return null;
  },

  async getSession() {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
    const token = localStorage.getItem('fm_token');
    return token ? { access_token: token } : null;
  },
};
