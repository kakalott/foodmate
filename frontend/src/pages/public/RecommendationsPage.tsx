import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, MapPin, Navigation, X, Clock, Compass, Utensils, MessageCircle, Lightbulb } from 'lucide-react';
import { recommendationsApi, routingApi, routeFactApi } from '../../services/api';
import { RestaurantCard } from '../../components/public/RestaurantCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import type { PlaceRestaurant, RecommendationResponse, RouteLog } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

export const RecommendationsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    lat?: number;
    lng?: number;
    dietary_preferences?: string[];
    preferred_categories?: string[];
    specific_dish?: string;
    areaName?: string;
  } | null;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active route modal state
  const [activeRoute, setActiveRoute] = useState<RouteLog | null>(null);
  const [routingPlace, setRoutingPlace] = useState<PlaceRestaurant | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeFact, setRouteFact] = useState<string | null>(null);
  const [showRouteFact, setShowRouteFact] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentSessionId = (state as any)?.session_id || sessionStorage.getItem('fm_sid') || ('session_' + Date.now());
      const res = await recommendationsApi.get({
        lat: state?.lat || 21.0285,
        lng: state?.lng || 105.8542,
        dietary_preferences: state?.dietary_preferences,
        preferred_categories: state?.preferred_categories,
        specific_dish: state?.specific_dish,
        session_id: currentSessionId,
      });
      setData(res);
    } catch (err: any) {
      console.error('Fetch recommendations error:', err);
      setError(err?.message || 'Không thể lấy đề xuất từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [state?.lat, state?.lng, state?.specific_dish]);

  // Handle Find Route on a place card
  const handleFindRoute = async (place: PlaceRestaurant) => {
    setRoutingPlace(place);
    setIsRouting(true);
    const toastId = toast.loading('Đang vạch tuyến đường đi ngắn nhất...', { duration: 4000 });

    try {
      setRouteFact(null);
      setShowRouteFact(true);

      // Gọi song song (async background) API /api/route-fact để lấy fact dọc đường
      routeFactApi.getFact({
        restaurant_name: place.name,
        dish_name: state?.specific_dish || place.dish_matched || 'món ngon',
      }).then((fact) => {
        if (fact) setRouteFact(fact);
      }).catch(() => {});

      const routeLog = await routingApi.createRoute({
        origin_lat: state?.lat || 21.0285,
        origin_lng: state?.lng || 105.8542,
        dest_lat: place.lat,
        dest_lng: place.lng,
        place_id: place.place_id,
        restaurant_name: place.name,
        restaurant_address: place.address,
        session_id: 'session_user_' + Date.now(),
      });

      toast.dismiss(toastId);
      toast.success('Đã tìm thấy lộ trình phù hợp!', { duration: 1500 });
      setActiveRoute(routeLog);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error('Không thể tính toán lộ trình: ' + err.message);
    } finally {
      setIsRouting(false);
    }
  };

  // Render Leaflet map when activeRoute is set
  useEffect(() => {
    if (!activeRoute || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [activeRoute.origin_lat, activeRoute.origin_lng],
      zoom: 14,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Marker A (User)
    const markerA = L.marker([activeRoute.origin_lat, activeRoute.origin_lng], {
      icon: L.divIcon({
        className: 'pin-a',
        html: `<div style="background:#10B981;color:#fff;font-weight:bold;font-size:12px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);">A</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      }),
    }).addTo(map).bindPopup('<b>Vị trí xuất phát của bạn</b>');

    // Marker B (Restaurant)
    const markerB = L.marker([activeRoute.dest_lat, activeRoute.dest_lng], {
      icon: L.divIcon({
        className: 'pin-b',
        html: `<div style="background:#EF4444;color:#fff;font-weight:bold;font-size:12px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);">B</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      }),
    }).addTo(map).bindPopup(`<b>${activeRoute.restaurant_name}</b><br/>${activeRoute.restaurant_address || ''}`);

    // Polyline
    if (activeRoute.route_polyline) {
      const points: [number, number][] = activeRoute.route_polyline.split(';').map((p) => {
        const [la, lo] = p.split(',').map(Number);
        return [la, lo];
      });

      const polyline = L.polyline(points, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.85,
      }).addTo(map);

      map.fitBounds(polyline.getBounds().pad(0.25));
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeRoute]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-fm-muted hover:text-fm-text mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Quay lại trang chủ & chọn lại
      </Link>

      {/* Food Companion Message: Text Bubble (Bong bóng chat bạn ẩm thực) */}
      {data && (
        <div className="mb-8">
          <div className="flex items-start gap-3 sm:gap-4 max-w-4xl">
            {/* Companion Avatar */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#BFE8D5] flex items-center justify-center text-2xl shrink-0 shadow-2xs border border-[#E8E2D8]">
              🍜
            </div>

            {/* Chat Speech Bubble */}
            <div className="flex-1 bg-white border border-[#BFE8D5] rounded-[20px] rounded-tl-xs p-4 sm:p-5 shadow-soft relative">
              {/* Sender Name & Area Pill */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5 pb-2 border-b border-[#E8E2D8]/60">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#46564E] text-sm sm:text-base flex items-center gap-1.5">
                    FoodMate
                    <span className="text-[10px] font-semibold text-emerald-800 bg-[#BFE8D5]/60 px-2 py-0.5 rounded-full">
                      Bạn đồng hành
                    </span>
                  </span>
                </div>
                {state?.areaName && (
                  <span className="text-[11px] font-bold text-emerald-900 bg-[#BFE8D5] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <MapPin size={11} /> {state.areaName}
                  </span>
                )}
              </div>

              {/* Message text with formatted bold highlights */}
              <div className="text-xs sm:text-sm text-[#46564E] leading-relaxed">
                {(data.ai_message || data.intro_message || data.message || '')
                  .split(/(\*\*.*?\*\*)/g)
                  .map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={index} className="font-extrabold text-[#46564E] bg-[#FFE6A7]/40 px-1 py-0.2 rounded">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return <span key={index}>{part}</span>;
                  })}
              </div>

              {/* Fun Fact Badge (Chỉ hiện khi có Textbox và có fact) */}
              {data.fun_fact && (
                <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-950 text-xs flex items-start gap-2 shadow-2xs animate-fadeIn">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 mt-0.5 font-bold">
                    💡
                  </div>
                  <div className="flex-1 leading-relaxed">
                    <span className="font-extrabold text-amber-900 block mb-0.5">Góc có thể bạn chưa biết</span>
                    <span>{data.fun_fact}</span>
                  </div>
                </div>
              )}

              {/* Search Keywords or Recommended Dishes Badges */}
              {state?.specific_dish ? (
                <div className="mt-3.5 pt-3 border-t border-[#E8E2D8]/60 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-fm-muted uppercase flex items-center gap-1">
                    <Utensils size={12} className="text-emerald-700" />
                    Đang tìm theo món:
                  </span>
                  <span className="px-3 py-1 bg-[#FFF9F0] border border-[#FFCBAE] text-amber-950 font-bold rounded-full text-xs shadow-2xs">
                    🔍 {state.specific_dish}
                  </span>
                </div>
              ) : (
                (data.recommended_dishes || data.dishes) &&
                (data.recommended_dishes || data.dishes).length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-[#E8E2D8]/60 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-fm-muted uppercase flex items-center gap-1">
                      <Utensils size={12} className="text-emerald-700" />
                      Gợi ý món nên thử:
                    </span>
                    {(data.recommended_dishes || data.dishes).map((dish) => (
                      <span
                        key={dish}
                        className="px-3 py-1 bg-[#FFF9F0] border border-[#FFCBAE] text-amber-950 font-bold rounded-full text-xs shadow-2xs hover:bg-[#FFE6A7]/40 transition-colors"
                      >
                        ✨ {dish}
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <div className="text-center py-6 text-sm text-[#46564E] font-medium flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Bạn chờ chút nhé, mình đang tìm quán gần đây...
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorState
          message="Không thể lấy danh sách quán lúc này. Bạn thử lại nhé!"
          onRetry={fetchRecommendations}
        />
      )}

      {/* Places Grid: Render nguyên bản từ Google Maps */}
      {!isLoading && data && (data.google_places_results || data.places) && (data.google_places_results || data.places).length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-fm-muted uppercase tracking-wider">
              {(data.google_places_results || data.places).length} Quán ăn tìm thấy quanh bạn
            </h3>
            <span className="text-xs text-emerald-900 bg-[#BFE8D5] px-2.5 py-0.5 rounded-full font-bold">
              Gần nhất & đánh giá cao
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(data.google_places_results || data.places).map((place) => (
              <RestaurantCard
                key={place.place_id}
                place={place}
                onFindRoute={handleFindRoute}
                isLoadingRoute={isRouting && routingPlace?.place_id === place.place_id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Route Map Modal */}
      {activeRoute && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-modal shadow-2xl border border-[#E8E2D8] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#FFF9F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#BFE8D5] flex items-center justify-center text-[#46564E]">
                  <Navigation size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#46564E] text-base leading-tight">
                    Tuyến đường tới: {activeRoute.restaurant_name}
                  </h3>
                  <p className="text-[11px] text-fm-muted line-clamp-1">
                    {activeRoute.restaurant_address || 'Hà Nội'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRoute(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-fm-muted hover:text-fm-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Route Stats Bar */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 border-b border-gray-100 text-center">
              <div className="bg-white p-2.5 rounded-btn border border-gray-200">
                <span className="text-xs text-fm-muted block">Khoảng cách di chuyển</span>
                <span className="text-base font-extrabold text-[#46564E]">
                  {(activeRoute.distance_meters / 1000).toFixed(1)} km
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-btn border border-gray-200">
                <span className="text-xs text-fm-muted block">Thời gian ước tính</span>
                <span className="text-base font-extrabold text-[#46564E]">
                  {Math.round(activeRoute.duration_seconds / 60)} phút
                </span>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="flex-1 min-h-[350px] relative overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

              {/* Floating Overlay Card: Góc dọc đường (Route Fact) */}
              {routeFact && showRouteFact && (
                <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-[1000] bg-white/95 backdrop-blur-md border border-amber-200 rounded-card shadow-soft-lg p-3 sm:p-3.5 flex items-start gap-2.5 animate-fadeIn">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    💡
                  </div>
                  <div className="flex-1 text-xs text-[#46564E]">
                    <span className="font-bold text-amber-900 block mb-0.5">Góc dọc đường</span>
                    <p className="leading-snug">{routeFact}</p>
                  </div>
                  <button
                    onClick={() => setShowRouteFact(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="Đóng thông báo"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Clean Modal Footer - Pure Map Experience */}
            <div className="p-3.5 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-fm-muted">
                Lộ trình di chuyển ngắn nhất dành cho bạn
              </span>
              <Button size="sm" onClick={() => setActiveRoute(null)} className="shadow-2xs">
                Đóng bản đồ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
