import React from 'react';
import { MapPin, Car, Bike, Footprints, Bus, Clock } from 'lucide-react';
import type { RouteLog } from '../../types';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RouteListItemProps {
  route: RouteLog;
  selected?: boolean;
  onClick?: () => void;
}

const travelModeIcon: Record<string, React.ReactNode> = {
  driving: <Car size={14} />,
  walking: <Footprints size={14} />,
  cycling: <Bike size={14} />,
  transit: <Bus size={14} />,
};

const travelModeLabel: Record<string, string> = {
  driving: 'Xe máy / Ô tô',
  walking: 'Đi bộ',
  cycling: 'Xe đạp',
  transit: 'Phương tiện công cộng',
};

export const RouteListItem: React.FC<RouteListItemProps> = ({
  route,
  selected = false,
  onClick,
}) => {
  const distanceKm = route.distance_meters
    ? `${(route.distance_meters / 1000).toFixed(1)} km`
    : null;
  const durationMin = route.duration_seconds
    ? `${Math.round(route.duration_seconds / 60)} phút`
    : null;

  return (
    <div
      onClick={onClick}
      className={[
        'p-3.5 rounded-btn cursor-pointer transition-all border text-left',
        selected
          ? 'bg-[#BFE8D5]/30 border-[#46564E]/40 shadow-sm ring-1 ring-[#46564E]/20'
          : 'bg-white border-gray-100 hover:bg-[#FFF9F0] hover:border-gray-200 shadow-xs',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-fm-text text-sm line-clamp-1">
            {route.restaurant?.name || 'Quán ăn đích'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-fm-muted mt-0.5">
            <MapPin size={12} className="text-red-400 shrink-0" />
            <span className="truncate">{route.restaurant?.address || `${route.destination_lat.toFixed(4)}, ${route.destination_lng.toFixed(4)}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-fm-text bg-gray-50 px-2 py-1 rounded-md text-xs shrink-0" title={travelModeLabel[route.travel_mode] || route.travel_mode}>
          {travelModeIcon[route.travel_mode] || <Car size={14} />}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {distanceKm && <Badge variant="info">{distanceKm}</Badge>}
        {durationMin && (
          <span className="text-xs text-fm-muted flex items-center gap-1">
            <Clock size={12} /> {durationMin}
          </span>
        )}
        <span className="text-[11px] text-gray-400 ml-auto font-mono">
          {format(new Date(route.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
        </span>
      </div>
    </div>
  );
};
