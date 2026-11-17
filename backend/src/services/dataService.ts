import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RouteLog, SearchLog, UserStartLocation } from '../types';

let supabase: SupabaseClient | null = null;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase Database (Public Route & Search Logs & System Configs)');
  } catch (err) {
    console.warn('⚠️ Supabase init failed, using in-memory store:', err);
  }
} else {
  console.log('ℹ️ Running with in-memory persistence (Configure SUPABASE_URL in .env to sync with cloud)');
}

// In-memory fallback / cache
let memoryRouteLogs: RouteLog[] = [
  {
    id: 'sample-route-1',
    session_id: 'session_demo_hanoi_01',
    place_id: 'ChIJb6F61k6rNTERx-uWb_zH2z4',
    restaurant_name: 'Phở Thìn Lò Đúc',
    restaurant_address: '13 Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội',
    origin_lat: 21.0285,
    origin_lng: 105.8542,
    dest_lat: 21.0182,
    dest_lng: 105.8573,
    distance_meters: 1650,
    duration_seconds: 420,
    route_polyline: '21.0285,105.8542;21.0255,105.8550;21.0215,105.8562;21.0182,105.8573',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'sample-route-2',
    session_id: 'session_demo_hanoi_02',
    place_id: 'ChIJ592Jq_mrNTER1aIq9uG2a6Y',
    restaurant_name: 'Bún chả Hương Liên (Obama)',
    restaurant_address: '24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng, Hà Nội',
    origin_lat: 21.0368,
    origin_lng: 105.7825,
    dest_lat: 21.0189,
    dest_lng: 105.8524,
    distance_meters: 7800,
    duration_seconds: 1320,
    route_polyline: '21.0368,105.7825;21.0320,105.8100;21.0250,105.8350;21.0189,105.8524',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const memorySearchLogs: SearchLog[] = [];
const memoryConfigs: Record<string, string> = {};

let memoryUserLocations: UserStartLocation[] = [];

export const dbService = {
  // ─── ROUTE LOGS ──────────────────────────────────────────
  async saveRouteLog(log: {
    session_id: string;
    place_id: string;
    restaurant_name: string;
    restaurant_address?: string;
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
    distance_meters: number;
    duration_seconds: number;
    route_polyline: string;
    filter_context?: string;
  }): Promise<RouteLog> {
    const newLog: RouteLog = {
      id: 'route-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...log,
      created_at: (log as any).created_at || new Date().toISOString(),
    };

    memoryRouteLogs.unshift(newLog);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('route_logs')
          .insert([
            {
              session_id: log.session_id,
              place_id: log.place_id,
              restaurant_name: log.restaurant_name,
              restaurant_address: log.restaurant_address,
              origin_lat: log.origin_lat,
              origin_lng: log.origin_lng,
              dest_lat: log.dest_lat,
              dest_lng: log.dest_lng,
              distance_meters: log.distance_meters,
              duration_seconds: log.duration_seconds,
              route_polyline: log.route_polyline,
              filter_context: log.filter_context,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return data as RouteLog;
        }
      } catch (err) {
        console.warn('Could not insert to Supabase, saved to memory cache:', err);
      }
    }

    return newLog;
  },

  async getAllRouteLogs(): Promise<RouteLog[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('route_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as RouteLog[];
        }
      } catch (err) {
        console.warn('Could not fetch from Supabase, falling back to memory:', err);
      }
    }
    return memoryRouteLogs;
  },

  async getRouteLogById(id: string): Promise<RouteLog | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('route_logs')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data as RouteLog;
      } catch {}
    }
    return memoryRouteLogs.find((r) => r.id === id) || null;
  },

  async deleteRouteLog(id: string): Promise<boolean> {
    memoryRouteLogs = memoryRouteLogs.filter((r) => r.id !== id);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('route_logs')
          .delete()
          .eq('id', id);
        if (error) {
          console.warn('Error deleting from Supabase:', error);
        }
      } catch (err) {
        console.warn('Could not delete from Supabase:', err);
      }
    }
    return true;
  },

  async deleteOldRouteLogs(days = 30): Promise<number> {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const initialCount = memoryRouteLogs.length;

    memoryRouteLogs = memoryRouteLogs.filter(
      (r) => new Date(r.created_at).getTime() >= cutoffTime
    );
    const deletedCount = initialCount - memoryRouteLogs.length;

    if (supabase) {
      try {
        const cutoffISO = new Date(cutoffTime).toISOString();
        await supabase
          .from('route_logs')
          .delete()
          .lt('created_at', cutoffISO);
      } catch (err) {
        console.warn('Could not delete old route logs from Supabase:', err);
      }
    }

    return deletedCount;
  },

  // ─── SEARCH LOGS ─────────────────────────────────────────
  async saveSearchLog(log: {
    weather_context?: string;
    budget?: string;
    suggested_dishes: string[];
  }): Promise<SearchLog> {
    const newLog: SearchLog = {
      id: 'search-' + Date.now(),
      ...log,
      created_at: new Date().toISOString(),
    };

    memorySearchLogs.unshift(newLog);

    if (supabase) {
      try {
        await supabase.from('search_logs').insert([
          {
            weather_context: log.weather_context,
            budget: log.budget,
            suggested_dishes: log.suggested_dishes,
          },
        ]);
      } catch {}
    }

    return newLog;
  },

  async getSearchLogs(): Promise<SearchLog[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('search_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data) return data as SearchLog[];
      } catch {}
    }
    return memorySearchLogs;
  },

  // ─── SYSTEM CONFIGS (Dynamic API Keys) ───────────────────
  async getConfig(key: string): Promise<string | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('system_configs')
          .select('value')
          .eq('key', key)
          .single();
        if (!error && data?.value) {
          memoryConfigs[key] = data.value;
          return data.value;
        }
      } catch {}
    }
    return memoryConfigs[key] || null;
  },

  async setConfig(key: string, value: string): Promise<void> {
    memoryConfigs[key] = value;

    if (supabase) {
      try {
        await supabase.from('system_configs').upsert([
          {
            key,
            value,
            updated_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.warn(`Could not save config "${key}" to Supabase:`, err);
      }
    }
  },

  async getAllConfigs(): Promise<Record<string, string>> {
    const result: Record<string, string> = { ...memoryConfigs };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('system_configs')
          .select('key, value');
        if (!error && data) {
          data.forEach((row: { key: string; value: string }) => {
            result[row.key] = row.value;
            memoryConfigs[row.key] = row.value;
          });
        }
      } catch {}
    }

    return result;
  },

  // Ưu tiên đọc key từ DB, nếu không có mới fallback sang file .env
  async getEffectiveApiKey(type: 'gemini' | 'google_maps' | 'trackasia'): Promise<string | undefined> {
    const configKey = type === 'gemini' ? 'gemini_api_key' : (type === 'trackasia' ? 'trackasia_api_key' : 'google_maps_key');
    const dbVal = await this.getConfig(configKey);
    if (dbVal && dbVal.trim().length > 5 && !dbVal.includes('your_')) {
      return dbVal.trim();
    }

    if (type === 'gemini') {
      const envKey = process.env.GEMINI_API_KEY;
      return envKey && !envKey.includes('your_') ? envKey : undefined;
    } else if (type === 'trackasia') {
      const envKey = process.env.TRACKASIA_API_KEY;
      return envKey && !envKey.includes('your_') ? envKey : undefined;
    } else {
      const envKey = process.env.GOOGLE_MAPS_KEY || process.env.GOOGLE_PLACES_KEY || process.env.TRACKASIA_API_KEY;
      return envKey && !envKey.includes('your_') ? envKey : undefined;
    }
  },

  // ─── USER START LOCATIONS (Bản đồ User) ──────────────────
  async saveUserLocation(loc: {
    session_id?: string;
    lat: number;
    lng: number;
    query?: string;
    created_at?: string;
  }): Promise<UserStartLocation> {
    const lat = Number(loc.lat);
    const lng = Number(loc.lng);
    const sess = loc.session_id || 'guest_sess_' + Math.random().toString(36).substring(2, 7);
    const query = (loc.query || '').trim();

    // Dedup: Nếu cùng session_id trong vòng 15 giây và tọa độ gần nhau (< 20m), cập nhật query thay vì tạo marker trùng
    const recent = memoryUserLocations.find(
      (m) =>
        m.session_id === sess &&
        Math.abs(m.lat - lat) < 0.0002 &&
        Math.abs(m.lng - lng) < 0.0002 &&
        Date.now() - new Date(m.created_at).getTime() < 15000
    );

    if (recent) {
      if (query && (!recent.query || recent.query === 'Gợi ý món ăn' || recent.query === 'quán ăn ngon')) {
        recent.query = query;
      }
      return recent;
    }

    const newLoc: UserStartLocation = {
      id: 'loc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      session_id: sess,
      lat,
      lng,
      query: query || 'Gợi ý món ăn',
      created_at: loc.created_at || new Date().toISOString(),
    };

    memoryUserLocations.unshift(newLoc);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_start_locations')
          .insert([
            {
              session_id: newLoc.session_id,
              lat: newLoc.lat,
              lng: newLoc.lng,
              query: newLoc.query,
            },
          ])
          .select()
          .single();
        if (!error && data) {
          return data as UserStartLocation;
        }
      } catch (err) {
        console.warn('Could not insert location to Supabase:', err);
      }
    }

    return newLoc;
  },

  async getAllUserLocations(): Promise<UserStartLocation[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_start_locations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as UserStartLocation[];
        }
      } catch (err) {
        console.warn('Could not fetch locations from Supabase:', err);
      }
    }
    return memoryUserLocations;
  },

  async deleteUserLocation(id: string): Promise<boolean> {
    memoryUserLocations = memoryUserLocations.filter((l) => l.id !== id);
    if (supabase) {
      try {
        await supabase.from('user_start_locations').delete().eq('id', id);
      } catch {}
    }
    return true;
  },

  async clearUserLocations(): Promise<boolean> {
    memoryUserLocations = [];
    if (supabase) {
      try {
        await supabase.from('user_start_locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch {}
    }
    return true;
  },
};
