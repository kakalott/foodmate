import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Utensils } from 'lucide-react';
import { recommendationsApi } from '../../services/api';
import { RestaurantCard } from '../../components/public/RestaurantCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import type { RecommendationResponse } from '../../types';

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
  }, [state?.specific_dish, state?.lat, state?.lng]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-fm-muted hover:text-fm-text mb-6 transition-colors"
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
              {/* Sender Name & Weather / Area Pill */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5 pb-2 border-b border-[#E8E2D8]/60">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#46564E] text-sm sm:text-base flex items-center gap-1.5">
                    FoodMate
                    <span className="text-[10px] font-semibold text-emerald-800 bg-[#BFE8D5]/60 px-2 py-0.5 rounded-full">
                      Bạn đồng hành
                    </span>
                  </span>
                </div>
                {data.weather && (
                  <span className="text-[11px] font-bold text-emerald-950 bg-[#BFE8D5] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    ☀️ {data.weather.description}
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

              {/* Fun Fact Badge (Sự thật nổ não) */}
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
                      Món ngon đề xuất:
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
            Đang phân tích thời tiết và tìm gợi ý ngon nhất...
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorState
          message="Không có kết nối mạng hoặc lỗi máy chủ. Vui lòng thử lại sau!"
          onRetry={fetchRecommendations}
        />
      )}

      {/* Food Cards Grid: Deep Link 100% Free to Google Maps */}
      {!isLoading && data && (data.google_places_results || data.places) && (data.google_places_results || data.places).length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-fm-muted uppercase tracking-wider">
              Khám phá món ngon & Tìm quán gần bạn
            </h3>
            <span className="text-xs text-emerald-950 bg-[#BFE8D5] px-2.5 py-0.5 rounded-full font-bold">
              Deep Link Maps Trực Tiếp
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(data.google_places_results || data.places).map((place) => (
              <RestaurantCard
                key={place.place_id}
                place={place}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
