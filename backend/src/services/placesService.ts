import { PlaceRestaurant } from '../types';
import { dbService } from './dataService';

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Bán kính Trái Đất (km)
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
  // Tìm kiếm quán ăn thực tế qua TrackAsia Search API (Focus vào tọa độ user)
  async searchTrackAsiaPlaces(
    query: string,
    userLat: number,
    userLng: number
  ): Promise<PlaceRestaurant[]> {
    const apiKey = await dbService.getEffectiveApiKey('trackasia');
    const searchKeyword = query.trim();

    if (!apiKey) {
      throw new Error('Chưa cấu hình TRACKASIA_API_KEY trên máy chủ.');
    }

    // API Search của TrackAsia chuẩn GeoJSON: trả về features[] với geometry.coordinates là [lon, lat]
    const url = `https://maps.track-asia.com/api/v1/search?text=${encodeURIComponent(
      searchKeyword
    )}&focus.point.lat=${userLat}&focus.point.lon=${userLng}&size=10&key=${apiKey}`;

    const res = await fetch(url);
    const data: any = await res.json();

    if (Array.isArray(data.features)) {
      const places: PlaceRestaurant[] = data.features.map((feature: any, idx: number) => {
        const coords = feature.geometry?.coordinates || [userLng, userLat];
        const pLng = coords[0];
        const pLat = coords[1];
        const dist = calculateHaversineKm(userLat, userLng, pLat, pLng);

        return {
          place_id: feature.properties?.id || `trackasia_${idx}_${pLat}_${pLng}`,
          name: feature.properties?.name || searchKeyword,
          address: feature.properties?.label || feature.properties?.street || 'Hà Nội',
          lat: pLat,
          lng: pLng,
          rating: 4.8,
          user_ratings_total: 100,
          distance_km: dist,
          dish_matched: searchKeyword,
        };
      });

      // Sắp xếp ưu tiên quán gần người dùng nhất
      places.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
      return places;
    }

    return [];
  },

  // Alias tương thích ngược cho recommendations flow
  async searchGooglePlaces(
    query: string,
    userLat: number,
    userLng: number,
    _isVegetarian?: boolean
  ): Promise<PlaceRestaurant[]> {
    return this.searchTrackAsiaPlaces(query, userLat, userLng);
  },

  async searchNearbyPlaces(
    dishes: string[],
    userLat: number,
    userLng: number,
    _options?: any
  ): Promise<PlaceRestaurant[]> {
    return this.searchTrackAsiaPlaces(dishes.join(' '), userLat, userLng);
  },
};
