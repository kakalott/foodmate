import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, Globe, Clock, Navigation, ArrowLeft, ShieldCheck, AlertCircle, Sparkles, Star } from 'lucide-react';
import { useRestaurant, useRestaurantMenus } from '../../hooks/useRestaurants';
import { MenuItemCard } from '../../components/public/MenuItemCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const HANOI_PRESETS = [
  { name: 'Hồ Hoàn Kiếm', lat: 21.0285, lng: 105.8542 },
  { name: 'Cầu Giấy', lat: 21.0368, lng: 105.7825 },
  { name: 'Bách Khoa', lat: 21.0080, lng: 105.8420 },
  { name: 'Ga Hà Nội', lat: 21.0245, lng: 105.8412 },
];

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const { data: menus } = useRestaurantMenus(id);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Action-based GPS states
  const [isLocating, setIsLocating] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  useEffect(() => {
    if (!restaurant || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [restaurant.lat, restaurant.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: 'custom-rest-marker',
      html: `
        <div style="background:#EF4444;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:2px solid #fff;font-size:16px;">
          🍜
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([restaurant.lat, restaurant.lng], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`<b>${restaurant.name}</b><br/>${restaurant.address}`);

    return () => {
      map.remove();
    };
  }, [restaurant]);

  // Action-based GPS Trigger on "Tìm đường"
  const handleFindRoute = () => {
    if (!restaurant) return;
    setIsLocating(true);
    setShowManualInput(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          navigate('/map', {
            state: {
              restaurant,
              originCoords: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            },
          });
        },
        () => {
          // Denied or error: show friendly input fallback instead of harsh alert
          setIsLocating(false);
          setShowManualInput(true);
        },
        { timeout: 6000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
      setShowManualInput(true);
    }
  };

  const handleManualRouteSubmit = (preset?: { name?: string; lat: number; lng: number }) => {
    if (!restaurant) return;
    const selected = preset || HANOI_PRESETS[0];
    navigate('/map', {
      state: {
        restaurant,
        originCoords: { lat: selected.lat, lng: selected.lng },
        manualAddress: manualAddress || selected.name || 'Hà Nội',
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !restaurant) {
    return <ErrorState message="Không tìm thấy quán ăn yêu cầu" onRetry={() => navigate('/restaurants')} />;
  }

  const openingHours = restaurant.opening_hours_json?.mon_sun || '07:00 - 21:00';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-fm-muted hover:text-fm-text mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Quay lại danh sách
      </button>

      {/* Main Info Card */}
      <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-[#46564E]">{restaurant.name}</h1>
              <span className="text-xs font-bold bg-[#BFE8D5] text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={13} /> Quán ăn thật (Hà Nội)
              </span>
              {restaurant.rating && (
                <span className="text-xs font-bold bg-[#FFE6A7] text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  {restaurant.rating.toFixed(1)}
                  {restaurant.review_count && (
                    <span className="text-[11px] font-normal text-amber-800/80">({restaurant.review_count})</span>
                  )}
                </span>
              )}
            </div>

            {restaurant.description && (
              <p className="text-xs sm:text-sm text-fm-muted mt-2 leading-relaxed max-w-2xl">
                {restaurant.description}
              </p>
            )}

            {restaurant.categories && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {restaurant.categories.map((cat) => (
                  <Badge key={cat.id} variant="neutral" className="bg-[#FFF9F0] border border-[#E8E2D8] text-xs">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Badge variant={restaurant.status === 'active' ? 'success' : 'warning'} className="self-start">
            {restaurant.status === 'active' ? 'Đang mở cửa' : 'Tạm nghỉ'}
          </Badge>
        </div>

        {/* Details list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#46564E] border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-red-400 shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-500 shrink-0" />
            <span>Giờ mở cửa: {openingHours}</span>
          </div>

          {restaurant.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-emerald-600 shrink-0" />
              <a href={`tel:${restaurant.phone}`} className="hover:underline">{restaurant.phone}</a>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Globe size={16} className="text-blue-500 shrink-0" />
            <span className="text-gray-500">Nguồn dữ liệu: FoodMate Verified</span>
          </div>
        </div>

        {/* Find route CTA button with Action-based GPS */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            size="md"
            leftIcon={<Navigation size={16} />}
            onClick={handleFindRoute}
            loading={isLocating}
            className="shadow-sm"
          >
            Tìm đường tới quán này
          </Button>

          <Link to="/chatbot" state={{ initialQuestion: `Giới thiệu chi tiết thực đơn và giá tại quán ${restaurant.name}` }}>
            <Button variant="outline" size="md">
              Hỏi chi tiết món & quán này
            </Button>
          </Link>
        </div>

        {/* Gentle Manual Address Input Fallback (if GPS denied/unsupported) */}
        {showManualInput && (
          <div className="mt-4 bg-[#FFF9F0] border border-[#FFCBAE] p-4 rounded-card text-xs text-[#46564E] space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <Sparkles size={15} className="text-amber-600" />
              <span>Mình không lấy được vị trí của bạn. Bạn nhập địa chỉ đang đứng vào đây nhé!</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Ví dụ: Hồ Hoàn Kiếm, Cầu Giấy, Đại học Bách Khoa..."
                className="flex-1 bg-white border border-[#E8E2D8] rounded-input px-3 py-2 text-xs text-fm-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
              />
              <Button size="sm" onClick={() => handleManualRouteSubmit()}>
                Tiếp tục tìm đường
              </Button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-fm-muted text-[11px]">Hoặc chọn nhanh vị trí gần bạn:</span>
              {HANOI_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setManualAddress(preset.name);
                    handleManualRouteSubmit(preset);
                  }}
                  className="px-2.5 py-1 bg-white border border-[#E8E2D8] rounded-full text-[11px] font-medium hover:bg-[#BFE8D5] transition-colors"
                >
                  📍 {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Map Preview */}
      <div className="mb-6 bg-white rounded-card shadow-soft border border-[#E8E2D8] p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-fm-muted uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={14} className="text-red-400" /> Bản đồ vị trí quán
          </span>
          <span className="text-xs text-fm-muted font-mono">
            {restaurant.lat.toFixed(4)}, {restaurant.lng.toFixed(4)}
          </span>
        </div>
        <div ref={mapContainerRef} className="w-full h-56 rounded-btn overflow-hidden border border-gray-200" />
      </div>

      {/* Menu & Pricing Table */}
      <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-6">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div>
            <h2 className="font-extrabold text-[#46564E] text-base sm:text-lg">Thực đơn & Bảng giá xác minh</h2>
            <p className="text-xs text-fm-muted">Mỗi món ăn đều được kiểm tra trạng thái xác minh và thời điểm cập nhật.</p>
          </div>
          <span className="text-xs font-semibold bg-[#BFE8D5] text-emerald-800 px-2.5 py-0.5 rounded-full">
            {menus?.length || 0} món
          </span>
        </div>

        {menus && menus.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {menus.map((menu) => (
              <MenuItemCard key={menu.id} menu={menu} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-fm-muted text-xs">
            Chưa có dữ liệu món ăn chi tiết cho quán này.
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center gap-1.5">
          <AlertCircle size={13} className="text-amber-500 shrink-0" />
          <span>Giá món có thể thay đổi vào dịp lễ tết. Quý khách có thể báo sai giá để Admin cập nhật lại.</span>
        </div>
      </div>
    </div>
  );
};
