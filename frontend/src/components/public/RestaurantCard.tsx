import React from 'react';
import { ExternalLink, Sparkles, MapPin } from 'lucide-react';
import type { PlaceRestaurant } from '../../types';
import { Button } from '../ui/Button';

interface RestaurantCardProps {
  place?: PlaceRestaurant;
  restaurant?: any;
  onFindRoute?: (place: PlaceRestaurant) => void;
  isLoadingRoute?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  place,
  restaurant,
}) => {
  const item: PlaceRestaurant = place || {
    place_id: restaurant?.id || '',
    name: restaurant?.name || 'Món ăn gợi ý',
    address: restaurant?.address || '',
    lat: restaurant?.lat || 21.0285,
    lng: restaurant?.lng || 105.8542,
    rating: restaurant?.rating || 4.8,
    dish_matched: restaurant?.dish_matched,
  };

  const foodName = item.name;

  // Deep Link: Mở ứng dụng hoặc trang Google Maps trên trình duyệt người dùng với 0 đồng, 0 thẻ Visa
  const handleDeepLink = () => {
    const query = `quán ${foodName}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[#E8E2D8] p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-soft-lg hover:border-emerald-300 group">
      <div>
        {/* Top Badge: Món đề xuất */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-[#BFE8D5]/80 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
            <Sparkles size={12} className="text-emerald-700" />
            Món ngon đề xuất
          </span>
          <span className="text-[11px] font-bold text-amber-900 bg-[#FFE6A7]/70 px-2.5 py-0.5 rounded-full border border-amber-200">
            ⭐ 4.8+
          </span>
        </div>

        {/* Tên Món: Font to, in đậm, nổi bật */}
        <h3 className="font-extrabold text-[#46564E] text-lg sm:text-xl leading-snug group-hover:text-emerald-800 transition-colors mb-2.5">
          {foodName}
        </h3>

        {/* Mô tả Deep Link */}
        <p className="text-xs text-[#46564E]/75 leading-relaxed mb-4 flex items-start gap-1.5">
          <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
          <span>Tìm kiếm các quán <strong>{foodName}</strong> đang mở cửa và gần vị trí GPS của bạn nhất.</span>
        </p>
      </div>

      {/* Nút Deep Link: Mở Google Maps định vị quán thật quanh bạn */}
      <div className="pt-3 border-t border-gray-100">
        <Button
          size="sm"
          className="w-full justify-center shadow-2xs text-xs font-bold py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white border-none"
          leftIcon={<ExternalLink size={14} />}
          onClick={handleDeepLink}
        >
          📍 Tìm quán gần đây
        </Button>
      </div>
    </div>
  );
};
