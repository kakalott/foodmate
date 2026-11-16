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
    place_id: restaurant?.id || 'place_mock',
    name: restaurant?.name || 'Quán ăn',
    address: restaurant?.address || 'Hà Nội',
    lat: restaurant?.lat || 21.0285,
    lng: restaurant?.lng || 105.8542,
    rating: restaurant?.rating || 4.8,
    user_ratings_total: restaurant?.review_count || 120,
    photo_url: restaurant?.image_url,
    distance_km: restaurant?.distance_km,
  };

  return (
    <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-0.5 group">
      {/* Photo Header */}
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        <img
          src={item.photo_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Distance Badge */}
        {item.distance_km !== undefined && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[#46564E] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs border border-[#E8E2D8] flex items-center gap-1">
            <span className="text-emerald-600">📍</span>
            <span>Cách {formatDistance(item.distance_km)}</span>
          </div>
        )}
        {/* Matched Dish Badge */}
        {item.dish_matched && (
          <div className="absolute bottom-3 left-3 bg-[#BFE8D5]/95 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
            🍜 {item.dish_matched}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-extrabold text-[#46564E] text-base leading-snug line-clamp-1 group-hover:text-emerald-800 transition-colors">
              {item.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-[#FFE6A7]/60 text-amber-950 px-2 py-0.5 rounded-md text-xs font-bold border border-[#FFE6A7]">
              <Star size={12} className="text-amber-500 fill-amber-400" />
              <span>{(item.rating || 4.7).toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-fm-muted">
              ({item.user_ratings_total || 120} đánh giá thực tế)
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-xs text-fm-muted line-clamp-2">
            <MapPin size={13} className="text-red-400 shrink-0 mt-0.5" />
            <span>{item.address}</span>
          </div>
        </div>

        {/* Action Button: "Tìm đường tới đây" */}
        <div className="pt-2 border-t border-gray-100">
          <Button
            size="sm"
            className="w-full justify-center shadow-2xs text-xs font-bold"
            leftIcon={<Navigation size={14} />}
            loading={isLoadingRoute}
            onClick={() => onFindRoute?.(item)}
          >
            Tìm đường tới đây
          </Button>
        </div>
      </div>
    </div>
  );
};
