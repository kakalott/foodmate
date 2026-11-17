import React from 'react';
import { MapPin, Navigation, Star } from 'lucide-react';
import type { PlaceRestaurant } from '../../types';
import { Button } from '../ui/Button';

interface RestaurantCardProps {
  place?: PlaceRestaurant;
  restaurant?: any;
  onFindRoute?: (place: PlaceRestaurant) => void;
  isLoadingRoute?: boolean;
}

const formatDistance = (km?: number) => {
  if (km === undefined) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`;
};

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  place,
  restaurant,
  onFindRoute,
  isLoadingRoute = false,
}) => {
  const item: PlaceRestaurant = place || {
    place_id: restaurant?.id || '',
    name: restaurant?.name || 'Quán ăn',
    address: restaurant?.address || '',
    lat: restaurant?.lat || 21.0285,
    lng: restaurant?.lng || 105.8542,
    rating: restaurant?.rating || 0,
    user_ratings_total: restaurant?.user_ratings_total || restaurant?.review_count || 0,
    distance_km: restaurant?.distance_km,
    dish_matched: restaurant?.dish_matched,
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[#E8E2D8] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-soft-lg hover:border-emerald-300 group">
      <div>
        {/* Top Badges: Khoảng cách & Món ăn khớp */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          {item.dish_matched && (
            <span className="inline-flex items-center gap-1 bg-[#BFE8D5]/70 text-emerald-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              🍜 {item.dish_matched}
            </span>
          )}
          {item.distance_km !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-fm-muted bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full ml-auto">
              📍 Cách {formatDistance(item.distance_km)}
            </span>
          )}
        </div>

        {/* Tên Quán: Font to, in đậm, nổi bật */}
        <h3 className="font-extrabold text-[#46564E] text-base sm:text-lg leading-snug group-hover:text-emerald-800 transition-colors mb-2">
          {item.name}
        </h3>

        {/* Rating & Đánh giá */}
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1 bg-[#FFE6A7]/70 text-amber-950 px-2 py-0.5 rounded-md text-xs font-extrabold border border-[#FFE6A7]">
            <Star size={13} className="text-amber-500 fill-amber-400" />
            <span>{(item.rating || 0) > 0 ? (item.rating || 0).toFixed(1) : 'Mới'}</span>
          </div>
          <span className="text-xs text-fm-muted">
            {item.user_ratings_total ? `(${item.user_ratings_total} lượt đánh giá)` : '(Chưa có đánh giá)'}
          </span>
        </div>

        {/* Địa chỉ chi tiết */}
        <div className="flex items-start gap-1.5 text-xs text-[#46564E]/80 leading-relaxed mb-4">
          <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
          <span>{item.address || 'Đang cập nhật địa chỉ'}</span>
        </div>
      </div>

      {/* Nút Tìm đường tới đây */}
      <div className="pt-3 border-t border-gray-100 mt-2">
        <Button
          size="sm"
          className="w-full justify-center shadow-2xs text-xs font-bold py-2.5"
          leftIcon={<Navigation size={14} />}
          loading={isLoadingRoute}
          onClick={() => onFindRoute?.(item)}
        >
          Tìm đường tới đây
        </Button>
      </div>
    </div>
  );
};
