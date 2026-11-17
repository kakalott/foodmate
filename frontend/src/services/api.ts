import axios from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  WeatherData,
  RecommendationRequest,
  RecommendationResponse,
  PlaceRestaurant,
  RouteLog,
  Restaurant,
  RestaurantMenu,
  ChatMessage,
  AnalyticsData,
  RestaurantReport,
} from '../types';

export const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3001' : '');
// Gắn cứng trực tiếp đường link Google Apps Script Web App (không phụ thuộc vào .env khi build trên GitHub Actions)
export const GAS_URL = 'https://script.google.com/macros/s/AKfycbzeYapbXJWzyxYdVKcxCdTsg446DRsNFd3bFxhLsiWG3vTk6HGp7h1dqvHkdvN4-WlvBg/exec';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Helper lấy thời tiết trực tiếp từ Open-Meteo hoàn toàn miễn phí, HTTPS, không cần API Key
const fetchDirectWeather = async (lat?: number, lng?: number): Promise<WeatherData> => {
  const latitude = lat || 21.0285;
  const longitude = lng || 105.8542;
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const json = await res.json();
    const temp = Math.round(json.current_weather?.temperature ?? 27);
    const code = json.current_weather?.weathercode ?? 1;
    let desc = 'Thời tiết dễ chịu';
    if (code === 0) desc = 'Trời quang đãng, nắng nhẹ';
    else if (code <= 3) desc = 'Trời mát mẻ, có mây rải rác';
    else if (code >= 51 && code <= 67) desc = 'Trời có mưa nhỏ';
    else if (code >= 80) desc = 'Trời có mưa rào';
    return {
      temperature: temp,
      weather_code: code,
      description: `${temp}°C, ${desc}`,
      area_label: 'Khu vực của bạn',
      observed_at: new Date().toISOString(),
    };
  } catch (fallbackErr) {
    return {
      temperature: 26,
      weather_code: 1,
      description: '26°C, Thời tiết mát mẻ dễ chịu',
      area_label: 'Hà Nội',
      observed_at: new Date().toISOString(),
    };
  }
};

// ─── Weather ─────────────────────────────────────────────
export const weatherApi = {
  getCurrent: async (lat?: number, lng?: number): Promise<WeatherData> => {
    // Nếu chạy trên GitHub Pages (không phải localhost), lấy thời tiết trực tiếp qua HTTPS ngay lập tức
    if (!isLocalhost) {
      return await fetchDirectWeather(lat, lng);
    }

    try {
      const r = await apiClient.get<ApiResponse<WeatherData>>('/api/weather/current', { params: { lat, lng } });
      return r.data.data;
    } catch (err) {
      return await fetchDirectWeather(lat, lng);
    }
  },
};

// Helper gọi trực tiếp Google Apps Script Web App
export const callGasRecommendation = async (payload: RecommendationRequest): Promise<RecommendationResponse> => {
  const query = payload.specific_dish || payload.specificDish || '';
  const lat = payload.lat || 21.0285;
  const lng = payload.lng || 105.8542;
  const sessionId = payload.session_id || 'fm_sid_' + Date.now();

  console.log('[FoodMate] Đang gửi yêu cầu tới Google Apps Script Web App:', GAS_URL);

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'recommend',
      lat,
      lng,
      query,
      session_id: sessionId,
      dietary_preferences: payload.dietary_preferences,
      preferred_categories: payload.preferred_categories,
    }),
  });

  const data = await res.json();
  console.log('[FoodMate] Phản hồi từ Google Apps Script:', data);

  if (!data.dishes && data.status === 'success') {
    console.warn('[FoodMate Lưu ý] Apps Script đang chạy phiên bản cũ (chỉ ghi log chứ chưa có code Gemini AI). Hãy vào Apps Script > Deploy > New Version!');
  }

  const dishes: string[] = data.dishes || data.recommended_dishes || ['Phở bò tái lăn', 'Bún chả Hà Nội', 'Bánh cuốn nóng'];
  const places: PlaceRestaurant[] = data.places || dishes.map((dish: string, idx: number) => ({
    place_id: 'gas-dish-' + idx,
    name: dish,
    address: 'Món ngon nổi bật theo thời tiết hôm nay',
    lat,
    lng,
    rating: 4.8,
  }));

  const weatherData: WeatherData = data.weather || {
    temperature: 28,
    weather_code: 1,
    description: '28°C, Mát mẻ dễ chịu',
    area_label: 'Khu vực của bạn',
    observed_at: new Date().toISOString(),
  };

  return {
    intro_message: data.ai_message || data.intro_message || data.comment || 'Chào bạn! FoodMate đã chuẩn bị những gợi ý ngon nhất cho bạn hôm nay:',
    ai_message: data.ai_message || data.comment || data.intro_message,
    message: data.ai_message || data.comment || '',
    dishes,
    recommended_dishes: dishes,
    places,
    google_places_results: places,
    fun_fact: data.fun_fact || 'Ẩm thực Việt Nam có sự hòa quyện tuyệt vời giữa ngũ hành và thời tiết từng mùa!',
    weather: weatherData,
  };
};

// ─── Recommendations (Real-time Places Flow) ─────────────
export const recommendationsApi = {
  get: async (payload: RecommendationRequest): Promise<RecommendationResponse> => {
    // Nếu chạy trên GitHub Pages (hoặc bất kỳ môi trường production nào), gọi thẳng Apps Script, không đợi localhost
    if (!isLocalhost) {
      return await callGasRecommendation(payload);
    }

    try {
      const r = await apiClient.post<ApiResponse<RecommendationResponse>>('/api/recommend', payload);
      return r.data.data;
    } catch (apiErr) {
      console.warn('Local backend /api/recommend unavailable, switching to Google Apps Script proxy:', apiErr);
      return await callGasRecommendation(payload);
    }
  },
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
