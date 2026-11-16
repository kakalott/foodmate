// ============================================================
// FoodMate v3.0 - Frontend Shared Types & Backward Compatibility
// ============================================================

export interface PlaceRestaurant {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photo_url?: string;
  distance_km?: number;
  dish_matched?: string;
  score?: number;
}

export interface RouteLog {
  id: string;
  session_id: string;
  place_id?: string;
  restaurant_name?: string;
  restaurant_address?: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat?: number;
  dest_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  restaurant_id?: string;
  travel_mode?: string;
  provider?: string;
  consent_id?: string;
  user_id?: string;
  distance_meters: number;
  duration_seconds: number;
  route_polyline: string;
  created_at: string;
  restaurant?: any;
}

export interface SearchLog {
  id: string;
  weather_context?: string;
  budget?: string;
  suggested_dishes: string[];
  created_at: string;
}

export interface UserStartLocation {
  id: string;
  session_id: string;
  lat: number;
  lng: number;
  query?: string;
  created_at: string;
}

export interface WeatherData {
  temperature: number;
  weather_code: number;
  description: string;
  area_label: string;
  observed_at: string;
}

export interface RecommendationRequest {
  lat?: number;
  lng?: number;
  budget_min?: number;
  budget_max?: number;
  budget?: string;
  dietary_preferences?: string[];
  preferred_categories?: string[];
  specific_dish?: string;
  specificDish?: string;
  session_id?: string;
}

export interface RecommendationResponse {
  intro_message?: string;
  ai_message?: string;
  recommended_dishes?: string[];
  dishes: string[];
  message: string;
  google_places_results?: PlaceRestaurant[];
  places: PlaceRestaurant[];
  fun_fact?: string | null;
  weather?: WeatherData;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Legacy types preserved to prevent auxiliary compile errors
export interface RestaurantCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  image_url?: string;
  status: 'active' | 'inactive';
}

export interface RestaurantMenu {
  id: string;
  restaurant_id: string;
  menu_item_id: string;
  price: number;
  currency: string;
  portion_label?: string;
  availability_status: string;
  verification_status: string;
  source_id?: string;
  last_verified_at?: string;
  menu_item?: MenuItem;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  opening_hours_json?: Record<string, string>;
  status: 'active' | 'inactive' | 'pending';
  place_id?: string;
  rating?: number;
  review_count?: number;
  distance_km?: number;
  created_at: string;
  updated_at: string;
  categories?: RestaurantCategory[];
  menus?: RestaurantMenu[];
}

export interface Recommendation {
  restaurant: Restaurant;
  menu_items: RestaurantMenu[];
  explanation: string;
  suitability_factors: string[];
  caveats?: string[];
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  budget_min?: number;
  budget_max?: number;
  dietary_preferences?: string[];
  disliked_items?: string[];
  preferred_categories?: string[];
  updated_at: string;
}

export interface RestaurantReport {
  id: string;
  restaurant_id: string;
  reporter_name?: string;
  issue_type: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
}

export interface AnalyticsData {
  total_users?: number;
  total_restaurants?: number;
  total_routes_calculated?: number;
  active_verifications?: number;
  today_recommendations?: number;
  top_categories?: { name: string; count: number }[];
  route_by_distance?: { label: string; count: number }[];
  [key: string]: any;
}
