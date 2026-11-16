import React, { useState } from 'react';
import { MapPin, Clock, Navigation, AlertTriangle, Copy, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import type { RouteLog } from '../../types';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RouteDetailPanelProps {
  route?: RouteLog | null;
}

const travelModeLabel: Record<string, string> = {
  driving: '🚗 Xe máy / Ô tô',
  walking: '🚶 Đi bộ',
  cycling: '🚲 Xe đạp',
  transit: '🚌 Phương tiện công cộng',
};

export const RouteDetailPanel: React.FC<RouteDetailPanelProps> = ({ route }) => {
  const [copied, setCopied] = useState(false);

  if (!route) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-white rounded-card border border-gray-100">
        <div className="w-12 h-12 rounded-full bg-fm-primary/30 flex items-center justify-center text-fm-text mb-3">
          <Navigation size={20} />
        </div>
        <p className="font-medium text-fm-text text-sm">Chưa có tuyến đường nào được chọn</p>
        <p className="text-fm-muted text-xs mt-1">Bấm vào một bản ghi ở cột danh sách để xem chi tiết kỹ thuật và audit log.</p>
      </div>
    );
  }

  const hasPolyline = !!route.route_polyline;
  const distanceKm = route.distance_meters
    ? (route.distance_meters / 1000).toFixed(2)
    : null;
  const durationMin = route.duration_seconds
    ? Math.round(route.duration_seconds / 60)
    : null;

  const handleCopyCoords = () => {
    const text = `Origin: ${route.origin_lat}, ${route.origin_lng} | Destination: ${route.destination_lat}, ${route.destination_lng}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-white rounded-card border border-gray-100 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="font-bold text-fm-text text-base">Chi tiết Route Log</h3>
        <button
          onClick={handleCopyCoords}
          className="text-xs text-fm-text flex items-center gap-1 hover:text-blue-600 bg-gray-50 px-2 py-1 rounded-md transition-colors"
          title="Sao chép tọa độ"
        >
          {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
          <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
        </button>
      </div>

      {/* Target Restaurant */}
      {route.restaurant && (
        <div className="bg-[#FFF9F0] border border-[#E8E2D8] rounded-btn p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-fm-muted uppercase tracking-wider">Quán ăn đích</span>
            <span className="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Hoạt động</span>
          </div>
          <p className="font-bold text-fm-text text-base">{route.restaurant.name}</p>
          <p className="text-xs text-fm-muted mt-1 leading-relaxed">{route.restaurant.address}</p>
        </div>
      )}

      {/* Origin / Destination coordinates */}
      <div className="space-y-3 bg-gray-50/80 p-3.5 rounded-btn border border-gray-100">
        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            A
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-fm-muted">Điểm xuất phát (Origin)</p>
            <p className="text-xs text-fm-text font-mono font-semibold truncate">
              {route.origin_lat.toFixed(6)}, {route.origin_lng.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 border-t border-gray-200/60 pt-2.5">
          <span className="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            B
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-fm-muted">Điểm đến (Destination)</p>
            <p className="text-xs text-fm-text font-mono font-semibold truncate">
              {route.destination_lat.toFixed(6)}, {route.destination_lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#BFE8D5]/20 border border-[#BFE8D5]/40 rounded-btn p-3 text-center">
          <p className="text-xl font-extrabold text-[#46564E]">{distanceKm ?? '—'}</p>
          <p className="text-xs font-medium text-fm-muted mt-0.5">Khoảng cách (km)</p>
        </div>
        <div className="bg-[#FFE6A7]/30 border border-[#FFE6A7]/50 rounded-btn p-3 text-center">
          <p className="text-xl font-extrabold text-[#46564E]">{durationMin ?? '—'}</p>
          <p className="text-xs font-medium text-fm-muted mt-0.5">Thời gian ước tính (phút)</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2.5 text-xs text-fm-text pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-fm-muted">Phương tiện:</span>
          <span className="font-medium">{travelModeLabel[route.travel_mode] || route.travel_mode}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-fm-muted">Nhà cung cấp API:</span>
          <Badge variant="info">{route.provider || 'Google Routes API'}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-fm-muted">Mã Session ID:</span>
          <span className="font-mono text-gray-600 truncate max-w-[130px]" title={route.session_id}>
            {route.session_id}
          </span>
        </div>

        {route.consent_id && (
          <div className="flex items-center justify-between">
            <span className="text-fm-muted">Location Consent:</span>
            <span className="flex items-center gap-1 text-green-700 font-medium">
              <ShieldCheck size={12} /> Đã có consent
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-fm-muted">Thời điểm ghi nhận:</span>
          <span className="font-mono text-gray-600">
            {format(new Date(route.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
          </span>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-btn p-3 text-[11px] text-blue-800 leading-relaxed">
        <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-900">
          <ShieldCheck size={13} /> Tuân thủ quyền riêng tư (Privacy Policy)
        </div>
        Tọa độ chỉ được lưu trữ một lần khi người dùng bấm &quot;Tìm đường&quot; và có sự đồng ý. Hệ thống không theo dõi GPS liên tục và không thu thập hành trình thực tế.
      </div>

      {/* Warnings */}
      {!hasPolyline && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-btn p-3 text-xs text-amber-800">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span>Tuyến đường không có dữ liệu polyline — bản đồ chỉ hiển thị 2 điểm A và B.</span>
        </div>
      )}
    </div>
  );
};
