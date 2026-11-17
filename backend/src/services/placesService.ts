import { PlaceRestaurant } from '../types';
import { dbService } from './dataService';

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const placesService = {
  // Tìm kiếm trực tiếp Google Places API bằng chính chuỗi searchKeyword của người dùng
  async searchGooglePlaces(
    query: string,
    userLat: number,
    userLng: number,
    _isVegetarian?: boolean
  ): Promise<PlaceRestaurant[]> {
    const apiKey = await dbService.getEffectiveApiKey('google_maps');
    const searchKeyword = query.trim();

    if (!apiKey) {
      throw new Error('Chưa cấu hình GOOGLE_MAPS_KEY trên máy chủ. Vui lòng kiểm tra API Key.');
    }

    const endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchKeyword
    )}&location=${userLat},${userLng}&radius=5000&language=vi&key=${apiKey}`;

    const res = await fetch(endpoint);
    const data: any = await res.json();

    if (data.status === 'OK' && Array.isArray(data.results)) {
      const places: PlaceRestaurant[] = data.results.map((r: any) => {
        const pLat = r.geometry?.location?.lat || userLat;
        const pLng = r.geometry?.location?.lng || userLng;
        const dist = calculateHaversineKm(userLat, userLng, pLat, pLng);

        return {
          place_id: r.place_id,
          name: r.name,
          address: r.formatted_address || r.vicinity || 'Hà Nội',
          lat: pLat,
          lng: pLng,
          rating: r.rating || 0,
          user_ratings_total: r.user_ratings_total || 0,
          photo_url: undefined, // Loại bỏ hình ảnh theo chuẩn siêu tối giản
          distance_km: dist,
          dish_matched: searchKeyword,
        };
      });

      // Ưu tiên quán có rating cao
      places.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return places;
    }

    if (data.status === 'ZERO_RESULTS') {
      return [];
    }

    throw new Error(`Lỗi Google Places API: ${data.status} ${data.error_message || ''}`);
  },

  // Backward compatibility alias
  async searchNearbyPlaces(
    dishes: string[],
    userLat: number,
    userLng: number,
    options?: {
      isVegetarian?: boolean;
    }
  ): Promise<PlaceRestaurant[]> {
    const query = dishes.join(' ');
    return this.searchGooglePlaces(query, userLat, userLng, options?.isVegetarian);
  },
};
