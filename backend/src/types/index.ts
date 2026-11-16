// ============================================================
// FoodMate v3.0 - Real-time Places & Route Logs Types
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
  created_at: string;
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
