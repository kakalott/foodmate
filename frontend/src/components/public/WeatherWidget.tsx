import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Zap, Wind, MapPin } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';
import { Skeleton } from '../ui/Skeleton';

const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun size={26} className="text-amber-500" />;
  if (code === 2 || code === 3) return <Cloud size={26} className="text-sky-400" />;
  if (code <= 48) return <Cloud size={26} className="text-gray-400" />;
  if (code <= 67) return <CloudRain size={26} className="text-blue-500" />;
  if (code <= 77) return <CloudSnow size={26} className="text-indigo-300" />;
  if (code <= 82) return <CloudRain size={26} className="text-blue-600" />;
  if (code <= 99) return <Zap size={26} className="text-amber-600" />;
  return <Wind size={26} className="text-teal-500" />;
};

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lng, compact = false }) => {
  const { data: weather, isLoading } = useWeather(lat, lng);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-white p-4 rounded-card border border-[#E8E2D8]">
        <div className="w-9 h-9 rounded-full bg-[#FFE6A7]/50 flex items-center justify-center animate-pulse">
          <Sun size={20} className="text-amber-500 animate-spin" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#46564E]">Đang xem thời tiết hôm nay thế nào...</p>
          <p className="text-[11px] text-fm-muted">Cập nhật nhanh khu vực Hà Nội</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full border border-[#E8E2D8] text-xs">
        {getWeatherIcon(weather.weather_code)}
        <span className="font-bold text-fm-text">
          {Math.round(weather.temperature)}°C
        </span>
        <span className="text-fm-muted">{weather.area_label}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-[#FFE6A7]/50 rounded-2xl flex items-center justify-center shrink-0 border border-[#FFE6A7]">
          {getWeatherIcon(weather.weather_code)}
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#46564E]">
              {Math.round(weather.temperature)}°C
            </span>
            <span className="text-xs font-semibold bg-[#BFE8D5]/60 text-[#46564E] px-2 py-0.5 rounded-full">
              Thích hợp đi ăn
            </span>
          </div>
          <p className="text-xs font-medium text-fm-text mt-0.5">{weather.description}</p>
        </div>
      </div>

      <div className="text-right border-l border-gray-100 pl-4 shrink-0">
        <div className="flex items-center gap-1 text-xs text-fm-muted justify-end">
          <MapPin size={12} className="text-emerald-600" />
          <span className="font-semibold text-fm-text">{weather.area_label}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Cập nhật theo thời gian thực</p>
      </div>
    </div>
  );
};
