import axios from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  WeatherData,
  RecommendationRequest,
  RecommendationResponse,
  RouteLog,
  Restaurant,
  RestaurantMenu,
  ChatMessage,
  AnalyticsData,
  RestaurantReport,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Weather ─────────────────────────────────────────────
export const weatherApi = {
  getCurrent: (lat?: number, lng?: number) =>
    apiClient
      .get<ApiResponse<WeatherData>>('/api/weather/current', { params: { lat, lng } })
      .then((r) => r.data.data),
};

// ─── Recommendations (Real-time Places Flow) ─────────────
export const recommendationsApi = {
  get: (payload: RecommendationRequest) =>
    apiClient
      .post<ApiResponse<RecommendationResponse>>('/api/recommend', payload)
      .then((r) => r.data.data),
};

// ─── Routes & Route Logs (v3.1 with Delete) ──────────────
export const routeFactApi = {
  getFact: (payload: { restaurant_name: string; dish_name?: string; textbox_value?: string }) =>
    apiClient
      .post<{ route_fact: string }>('/api/route-fact', payload)
      .then((r) => r.data.route_fact),
};

export const routingApi = {
  createRoute: (payload: {
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
    place_id: string;
    restaurant_name: string;
    restaurant_address?: string;
    session_id?: string;
    travel_mode?: string;
    filter_context?: string;
  }) =>
    apiClient
      .post<ApiResponse<RouteLog>>('/api/routes', payload)
      .then((r) => r.data.data),

  getAllRoutes: () =>
    apiClient
      .get<ApiResponse<RouteLog[]>>('/api/routes')
      .then((r) => r.data.data),

  getRouteById: (id: string) =>
    apiClient
      .get<ApiResponse<RouteLog>>(`/api/routes/${id}`)
      .then((r) => r.data.data),

  deleteRoute: (id: string) =>
    apiClient
      .delete<{ success: boolean; id: string }>('/api/routes/' + id)
      .then((r) => r.data),

  cleanupOldRoutes: (days = 30) =>
    apiClient
      .post<{ success: boolean; deletedCount: number; message: string }>('/api/routes/cleanup', { days })
      .then((r) => r.data),
};

// ─── System Config API (/minh) ───────────────────────────
export const configApi = {
  get: () =>
    apiClient
      .get<ApiResponse<{
        google_maps_key: string;
        gemini_api_key: string;
        has_google_key: boolean;
        has_gemini_key: boolean;
      }>>('/api/config')
      .then((r) => r.data.data),

  save: (payload: { google_maps_key?: string; gemini_api_key?: string }) =>
    apiClient
      .post<ApiResponse<{ success: boolean; message: string }>>('/api/config', payload)
      .then((r) => r.data),
};

// ─── Compatibility Stubs for Legacy References ───────────
export const restaurantsApi = {
  list: async (_params?: any) => ({ data: [] as Restaurant[], total: 0, page: 1, limit: 10, total_pages: 1 }),
  getById: async (_id: string) => null as unknown as Restaurant,
  getMenus: async (_id: string) => [] as RestaurantMenu[],
};

export const adminRestaurantsApi = {
  list: async (_params?: any) => ({ data: [] as Restaurant[], total: 0, page: 1, limit: 10, total_pages: 1 }),
  getById: async (_id: string) => null as unknown as Restaurant,
  create: async (data: any) => data,
  update: async (_id: string, data: any) => data,
  delete: async (_id: string) => true,
};

export const adminAnalyticsApi = {
  get: async (): Promise<AnalyticsData> => ({
    total_users: 120,
    total_restaurants: 0,
    total_routes_calculated: 18,
    active_verifications: 0,
    today_recommendations: 45,
    top_categories: [],
    route_by_distance: [],
  }),
  getOverview: async (): Promise<AnalyticsData> => ({
    total_users: 120,
    total_restaurants: 0,
    total_routes_calculated: 18,
    active_verifications: 0,
    today_recommendations: 45,
    top_categories: [],
    route_by_distance: [],
  }),
};

export const reportsApi = {
  create: async (data: any) => data,
  list: async () => [] as RestaurantReport[],
  resolve: async (_id: string) => true,
};

export const chatApi = {
  send: async (message: string, _history?: any, _sessionId?: string) => ({
    id: 'msg-' + Date.now(),
    role: 'assistant' as const,
    content: message,
    created_at: new Date().toISOString(),
  }),
};
