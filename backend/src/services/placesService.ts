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
  // Tìm kiếm quán ăn thực tế qua TrackAsia Search API với 2 Lớp Khiên Bảo Vệ
  async searchTrackAsiaPlaces(
    keyword: string,
    lat: number,
    lng: number
  ): Promise<PlaceRestaurant[]> {
    const apiKey = await dbService.getEffectiveApiKey('trackasia');

    if (!apiKey) {
      throw new Error('Chưa cấu hình TRACKASIA_API_KEY trên máy chủ.');
    }

    // 1. LỚP KHIÊN TEXT: Tự động thêm chữ "quán" để ép bộ máy tìm kiếm hiểu đúng ý định ẩm thực
    const cleanKeyword = keyword.trim();
    const lowerKeyword = cleanKeyword.toLowerCase();
    const isAlreadySpecific =
      lowerKeyword.includes('quán') ||
      lowerKeyword.includes('nhà hàng') ||
      lowerKeyword.includes('tiệm') ||
      lowerKeyword.includes('bếp') ||
      lowerKeyword.includes('cửa hàng');
    const searchQuery = isAlreadySpecific ? cleanKeyword : `quán ${cleanKeyword}`;

    // 2. LỚP KHIÊN API:
    // - size=6: Khóa chặt kết quả
    // - layers=venue: Loại bỏ đường xá, thành phố, chỉ quét POI/địa điểm kinh doanh
    const url = `https://maps.track-asia.com/api/v1/search?text=${encodeURIComponent(
      searchQuery
    )}&focus.point.lat=${lat}&focus.point.lon=${lng}&size=6&layers=venue&key=${apiKey}&api_key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();

      if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
        return [];
      }

      // Chuẩn hóa dữ liệu trả về và tính khoảng cách
      const places: PlaceRestaurant[] = data.features.map((feature: any, idx: number) => {
        const coords = feature.geometry?.coordinates || [lng, lat];
        const pLng = coords[0];
        const pLat = coords[1];

        // Ưu tiên khoảng cách thực tế do TrackAsia tính (nếu có, đổi sang km), nếu không tính bằng Haversine
        let distanceKm: number;
        if (typeof feature.properties?.distance === 'number') {
          distanceKm = Math.round(feature.properties.distance * 10) / 10;
        } else {
          distanceKm = calculateHaversineKm(lat, lng, pLat, pLng);
        }

        return {
          place_id: feature.properties?.id || `trackasia_${idx}_${pLat}_${pLng}`,
          name: feature.properties?.name || cleanKeyword,
          address: feature.properties?.label || feature.properties?.street || 'Hà Nội',
          lat: pLat,
          lng: pLng,
          rating: 4.8,
          user_ratings_total: 100,
          distance_km: distanceKm,
          dish_matched: cleanKeyword,
        };
      });

      // Lọc bỏ kết quả trùng tên hoặc không phải quán ăn nếu có từ "game"
      const filtered = places.filter(
        (p) => !p.name.toLowerCase().includes('game') && !p.name.toLowerCase().includes('nét')
      );

      // Sắp xếp ưu tiên quán gần nhất và lấy tối đa chính xác 6 quán
      filtered.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
      return filtered.slice(0, 6);
    } catch (error: any) {
      console.error('Lỗi gọi API TrackAsia Search:', error);
      throw new Error('Lỗi máy chủ bản đồ');
    }
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
