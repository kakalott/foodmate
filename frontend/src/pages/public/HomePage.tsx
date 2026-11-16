import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, HeartHandshake, MapPin, Utensils } from 'lucide-react';
import { WeatherWidget } from '../../components/public/WeatherWidget';
import { Button } from '../../components/ui/Button';
import { usePreferenceStore } from '../../store/preferenceStore';
import toast from 'react-hot-toast';

const HANOI_AREAS = [
  { name: 'Hoàn Kiếm (Phố cổ)', lat: 21.0285, lng: 105.8542 },
  { name: 'Cầu Giấy', lat: 21.0368, lng: 105.7825 },
  { name: 'Hai Bà Trưng (Bách Khoa)', lat: 21.0080, lng: 105.8420 },
  { name: 'Đống Đa', lat: 21.0245, lng: 105.8250 },
  { name: 'Ba Đình', lat: 21.0366, lng: 105.8348 },
  { name: 'Tây Hồ', lat: 21.0583, lng: 105.8242 },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    specificDish,
    setSpecificDish,
    setLocation,
  } = usePreferenceStore();

  const [isLocating, setIsLocating] = useState(false);
  const [showGpsFallback, setShowGpsFallback] = useState(false);
  const [manualArea, setManualArea] = useState('');

  // Helper gửi ping tọa độ ngầm (Fire-and-forget)
  const sendLocationPing = (lat: number, lng: number, dishQuery: string, sessId: string) => {
    try {
      const payload = JSON.stringify({
        lat,
        lng,
        session_id: sessId,
        query: dishQuery,
      });

      // Gửi theo endpoint tương đối qua Vite proxy (đáng tin cậy nhất)
      fetch('/api/track-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});

      // Nếu có cấu hình VITE_API_URL khác origin, ping thêm direct
      const externalApi = import.meta.env.VITE_API_URL;
      if (externalApi && externalApi !== window.location.origin) {
        fetch(`${externalApi}/api/track-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Location track ping error:', e);
    }
  };

  const getOrCreateSessionId = (): string => {
    let sessId = sessionStorage.getItem('fm_sid');
    if (!sessId) {
      sessId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      sessionStorage.setItem('fm_sid', sessId);
    }
    return sessId;
  };

  const navigateToRecommend = (lat: number, lng: number, areaName?: string) => {
    const sessId = getOrCreateSessionId();
    setLocation(lat, lng, areaName || 'Vị trí đã chọn');
    navigate('/recommend', {
      state: {
        lat,
        lng,
        specific_dish: specificDish?.trim() || '',
        areaName,
        session_id: sessId,
      },
    });
  };

  // Action-based GPS flow on "Hôm nay ăn gì?"
  const handleGetRecommendations = () => {
    setIsLocating(true);
    setShowGpsFallback(false);
    const toastId = toast.loading('Bạn chờ chút nhé, mình đang tìm quán gần đây...', { duration: 6000 });

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          toast.dismiss(toastId);
          setIsLocating(false);
          toast.success('Đã xác định vị trí của bạn!', { duration: 1500 });

          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const sessId = getOrCreateSessionId();
          const dishQuery = specificDish?.trim() || '';

          // Luồng 2 (Ngầm): Gửi POST request không chờ phản hồi về API /api/track-location
          sendLocationPing(userLat, userLng, dishQuery, sessId);

          // Luồng 1 (Công khai): Điều hướng và hiển thị quán cho khách
          navigateToRecommend(userLat, userLng, 'Vị trí hiện tại của bạn');
        },
        (_err) => {
          // Denied or error: Catch gracefully, show friendly gentle input
          toast.dismiss(toastId);
          setIsLocating(false);
          setShowGpsFallback(true);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else {
      toast.dismiss(toastId);
      setIsLocating(false);
      setShowGpsFallback(true);
    }
  };

  const handleManualAreaSubmit = (areaName?: string, customLat?: number, customLng?: number) => {
    const selectedName = areaName || manualArea || 'Hà Nội';
    let lat = customLat;
    let lng = customLng;

    if (!lat || !lng) {
      const matched = HANOI_AREAS.find((a) =>
        a.name.toLowerCase().includes(selectedName.toLowerCase()) ||
        selectedName.toLowerCase().includes(a.name.toLowerCase())
      );
      lat = matched ? matched.lat : 21.0285;
      lng = matched ? matched.lng : 105.8542;
    }

    const sessId = getOrCreateSessionId();
    const dishQuery = specificDish?.trim() || selectedName;

    // Gửi ping tọa độ ngầm cho mọi trường hợp (dù là nhập tay hay click badge chọn nhanh)
    sendLocationPing(lat, lng, dishQuery, sessId);

    navigateToRecommend(lat, lng, selectedName);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Greeting */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 bg-[#BFE8D5]/60 text-[#46564E] px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 border border-[#BFE8D5]">
          <HeartHandshake size={14} className="text-emerald-700" /> Người bạn đồng hành ẩm thực Hà Nội
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#46564E] tracking-tight mb-3">
          Hôm nay ăn gì? 🍜
        </h1>
        <p className="text-sm sm:text-base text-fm-muted max-w-lg mx-auto leading-relaxed">
          Gợi ý các quán ăn bình dân chuẩn vị gần bạn, dựa trên thời tiết hôm nay và ngân sách thực tế.
        </p>
      </div>

      {/* Real-time Weather Widget */}
      <div className="mb-6">
        <WeatherWidget />
      </div>

      {/* Specific Dish Input (Món thèm cụ thể) */}
      <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-5 sm:p-6 mb-5">
        <label className="block text-xs sm:text-sm font-bold text-[#46564E] mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Utensils size={16} className="text-emerald-700" />
            Món bạn đang thèm hôm nay
          </span>
          <span className="text-[11px] font-normal text-fm-muted">Tùy chọn</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={specificDish}
            onChange={(e) => setSpecificDish(e.target.value)}
            placeholder="Nếu chưa nghĩ ra gì, hãy cứ bấm 'Hôm nay ăn gì' để khám phá!"
            className="w-full px-4 py-3 text-xs sm:text-sm rounded-input border border-[#E8E2D8] bg-[#FFF9F0]/50 text-[#46564E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BFE8D5] focus:bg-white transition-all shadow-2xs"
          />
          {specificDish && (
            <button
              type="button"
              onClick={() => setSpecificDish('')}
              className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
              title="Xóa nội dung"
            >
              ×
            </button>
          )}
        </div>
        <p className="text-[11px] text-fm-muted mt-2">
          💡 Gõ món bạn muốn tìm (pizza, sushi, lẩu, bánh tráng...) để tìm trực tiếp trên Google Maps, hoặc để trống để FoodMate gợi ý quán ngon gần bạn.
        </p>
      </div>

      

      {/* Main CTA: "Hôm nay ăn gì?" with integrated Action-based GPS */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleGetRecommendations}
          loading={isLocating}
          leftIcon={<Sparkles size={18} />}
          className="w-full sm:w-auto min-w-[280px] text-base sm:text-lg font-bold py-4 px-8 shadow-soft-lg hover:shadow-soft transition-transform active:scale-95"
        >
          {isLocating ? 'Bạn chờ chút nhé, mình đang tìm quán gần đây...' : 'Hôm nay ăn gì? ✨'}
        </Button>

        <p className="text-[11px] text-gray-400 mt-3">
          Tìm quán ngon thực tế • Ưu tiên khoảng cách gần bạn & được đánh giá cao
        </p>

        {/* Gentle Fallback if GPS is denied or unavailable */}
        {showGpsFallback && (
          <div className="mt-5 p-4 sm:p-5 bg-white border border-[#FFCBAE] rounded-card shadow-soft text-left space-y-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#46564E]">
              <Sparkles size={16} className="text-amber-500 shrink-0" />
              <span>Mình không lấy được vị trí, bạn nhập địa chỉ đang đứng vào đây nhé!</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualArea}
                onChange={(e) => setManualArea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleManualAreaSubmit();
                }}
                placeholder="Nhập khu vực (VD: Cầu Giấy, Hoàn Kiếm, Đống Đa, Bách Khoa...)"
                className="flex-1 px-3.5 py-2 text-xs rounded-input border border-[#E8E2D8] bg-white text-fm-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
              />
              <Button size="sm" onClick={() => handleManualAreaSubmit()}>
                Tìm quán ngay
              </Button>
            </div>

            {/* Quick Area Preset Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-fm-muted">Hoặc chọn nhanh:</span>
              {HANOI_AREAS.map((area) => (
                <button
                  key={area.name}
                  type="button"
                  onClick={() => handleManualAreaSubmit(area.name, area.lat, area.lng)}
                  className="px-2.5 py-1 bg-[#FFF9F0] border border-[#E8E2D8] rounded-full text-[11px] font-medium hover:bg-[#BFE8D5] text-[#46564E] transition-colors"
                >
                  📍 {area.name}
                </button>
              ))}
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => handleManualAreaSubmit('Hồ Hoàn Kiếm (Trung tâm)', 21.0285, 105.8542)}
                className="text-[11px] text-emerald-800 underline hover:text-emerald-900 font-medium"
              >
                Tiếp tục với vị trí trung tâm Hà Nội
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
