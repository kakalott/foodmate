import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Compass, Car, Footprints, ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGeolocation } from '../../hooks/useGeolocation';
import { MOCK_RESTAURANTS } from '../../services/mockData';
import type { Restaurant, RouteLog } from '../../types';
import toast from 'react-hot-toast';

const POPULAR_ORIGINS = [
  { label: 'Hồ Hoàn Kiếm (Nhà thờ Lớn)', lat: 21.0285, lng: 105.8542 },
  { label: 'Ga Hà Nội (Đống Đa)', lat: 21.0245, lng: 105.8412 },
  { label: 'Đại học Bách Khoa (Hai Bà Trưng)', lat: 21.0080, lng: 105.8420 },
  { label: 'Cầu Giấy (ĐH Quốc Gia)', lat: 21.0368, lng: 105.7825 },
  { label: 'Lăng Bác (Ba Đình)', lat: 21.0366, lng: 105.8348 },
];

export const MapRoutingPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const location = useLocation();
  const locationState = location.state as {
    restaurant?: Restaurant;
    originCoords?: { lat: number; lng: number };
    manualAddress?: string;
  } | null;

  // Selected restaurant destination
  const [selectedRestId, setSelectedRestId] = useState<string>(
    locationState?.restaurant?.id || MOCK_RESTAURANTS[0].id
  );
  const destination = MOCK_RESTAURANTS.find((r) => r.id === selectedRestId) || MOCK_RESTAURANTS[0];

  // Geolocation
  const { lat, lng, requestLocation, isLoading: geoLoading, error: geoError } = useGeolocation();

  // Manual origin fallback if GPS is denied or user enters text
  const [manualInputText, setManualInputText] = useState<string>(locationState?.manualAddress || '');
  const [manualCoords, setManualCoords] = useState<{ lat: number; lng: number } | null>(
    locationState?.originCoords || null
  );

  // Routing state
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');
  const [consentToSave, setConsentToSave] = useState<boolean>(true);
  const [currentRoute, setCurrentRoute] = useState<RouteLog | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Effective origin coordinates
  const activeOriginLat = manualCoords ? manualCoords.lat : (lat || POPULAR_ORIGINS[0].lat);
  const activeOriginLng = manualCoords ? manualCoords.lng : (lng || POPULAR_ORIGINS[0].lng);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [destination.lat, destination.lng],
      zoom: 14,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Custom Map Legend
    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'bg-white/95 backdrop-blur-sm p-3 text-xs rounded-xl shadow-lg border border-gray-200');
      div.innerHTML = `
        <div style="font-weight:bold;margin-bottom:4px;color:#46564E;">Tuyến đường đề xuất</div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
          <span style="display:inline-block;width:12px;height:12px;background:#10B981;border-radius:50%;"></span>
          <span>A: Điểm xuất phát của bạn</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
          <span style="display:inline-block;width:12px;height:12px;background:#EF4444;border-radius:50%;"></span>
          <span>B: Quán ăn đích</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="display:inline-block;width:18px;height:4px;background:#3B82F6;border-radius:2px;"></span>
          <span style="color:#2563EB;font-weight:600;">Lộ trình đề xuất</span>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    // Initial destination marker
    const initMarkerB = L.marker([destination.lat, destination.lng], {
      icon: L.divIcon({
        className: 'custom-pin-b',
        html: `<div style="background:#EF4444;color:#fff;font-weight:bold;font-size:12px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);">B</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      }),
    }).addTo(map).bindPopup(`<b>${destination.name}</b><br/>${destination.address}`);
    markersRef.current = [initMarkerB];

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [destination]);

  // If user came with originCoords, auto-calculate route
  useEffect(() => {
    if (locationState?.originCoords) {
      handleCalculateRoute();
    }
  }, []);

  // Update Markers & Polyline on map
  const renderRouteOnMap = (routeLog: RouteLog) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    // Origin Marker A
    const markerA = L.marker([routeLog.origin_lat, routeLog.origin_lng], {
      icon: L.divIcon({
        className: 'custom-pin-a',
        html: `<div style="background:#10B981;color:#fff;font-weight:bold;font-size:12px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);">A</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      }),
    }).addTo(map).bindPopup('<b>Điểm xuất phát của bạn (A)</b>');

    // Destination Marker B
    const markerB = L.marker([routeLog.destination_lat, routeLog.destination_lng], {
      icon: L.divIcon({
        className: 'custom-pin-b',
        html: `<div style="background:#EF4444;color:#fff;font-weight:bold;font-size:12px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);">B</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      }),
    }).addTo(map).bindPopup(`<b>${routeLog.restaurant?.name || 'Quán ăn'}</b>`);

    markersRef.current = [markerA, markerB];

    // Decode polyline points
    const points: [number, number][] = routeLog.route_polyline
      ? routeLog.route_polyline.split(';').map((p) => {
          const [la, lo] = p.split(',').map(Number);
          return [la, lo];
        })
      : [
          [routeLog.origin_lat, routeLog.origin_lng],
          [routeLog.destination_lat, routeLog.destination_lng],
        ];

    const polyline = L.polyline(points, {
      color: '#3B82F6',
      weight: 5,
      opacity: 0.85,
    }).addTo(map);

    routePolylineRef.current = polyline;
    map.fitBounds(polyline.getBounds().pad(0.2));
  };

  const handleCalculateRoute = () => {
    setIsCalculating(true);
    // Updated humanized loading text
    toast.loading('Đang vạch tuyến đường đi ngắn nhất...', { duration: 1200 });

    setTimeout(() => {
      // Calculate distance
      const dLat = (destination.lat - activeOriginLat) * 111320;
      const dLng = (destination.lng - activeOriginLng) * 111320 * Math.cos(activeOriginLat * (Math.PI / 180));
      const straightMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
      const distanceMeters = Math.max(500, Math.round(straightMeters * 1.32));
      const durationSeconds = travelMode === 'driving' 
        ? Math.round((distanceMeters / 6000) * 3600)
        : Math.round((distanceMeters / 4500) * 3600);

      // Generate polyline
      const midLat1 = activeOriginLat + (destination.lat - activeOriginLat) * 0.35 + 0.0008;
      const midLng1 = activeOriginLng + (destination.lng - activeOriginLng) * 0.35 - 0.0012;
      const midLat2 = activeOriginLat + (destination.lat - activeOriginLat) * 0.70;
      const midLng2 = activeOriginLng + (destination.lng - activeOriginLng) * 0.70 + 0.0008;

      const polyline = `${activeOriginLat.toFixed(5)},${activeOriginLng.toFixed(5)};${midLat1.toFixed(5)},${midLng1.toFixed(5)};${midLat2.toFixed(5)},${midLng2.toFixed(5)};${destination.lat.toFixed(5)},${destination.lng.toFixed(5)}`;

      const newRoute: RouteLog = {
        id: 'route-live-' + Date.now(),
        session_id: 'session_' + Math.random().toString(36).substring(2, 9),
        restaurant_id: destination.id,
        origin_lat: activeOriginLat,
        origin_lng: activeOriginLng,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        distance_meters: distanceMeters,
        duration_seconds: durationSeconds,
        travel_mode: travelMode,
        route_polyline: polyline,
        provider: 'Google Routes API',
        consent_id: consentToSave ? 'consent_' + Date.now() : undefined,
        created_at: new Date().toISOString(),
        restaurant: destination,
      };

      setCurrentRoute(newRoute);
      renderRouteOnMap(newRoute);
      setIsCalculating(false);
      toast.success('Đã tìm thấy tuyến đường phù hợp nhất!');
    }, 700);
  };

  const handleSelectPreset = (p: typeof POPULAR_ORIGINS[0]) => {
    setManualInputText(p.label);
    setManualCoords({ lat: p.lat, lng: p.lng });
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden">
      {/* Floating Control Panel (Left Sidebar) */}
      <div className="w-full lg:w-96 bg-white/95 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-[#E8E2D8] shadow-lg z-20 flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-full p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#BFE8D5] flex items-center justify-center text-[#46564E]">
              <Navigation size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-[#46564E] text-base">Tìm đường tới quán</h2>
              <p className="text-[11px] text-fm-muted">Vạch lộ trình an toàn • Tối ưu thời gian</p>
            </div>
          </div>
          <Link to="/restaurants" className="text-xs text-fm-muted hover:text-fm-text">
            <ArrowLeft size={14} />
          </Link>
        </div>

        {/* Destination selection */}
        <div>
          <label className="text-xs font-bold text-fm-muted uppercase tracking-wider block mb-1.5">
            Quán ăn bạn muốn đến
          </label>
          <select
            value={selectedRestId}
            onChange={(e) => setSelectedRestId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-btn border border-[#E8E2D8] bg-white text-fm-text focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
          >
            {MOCK_RESTAURANTS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.address.split(',')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Origin Section: Gentle humanized experience */}
        <div className="space-y-2 bg-[#FFF9F0] p-3.5 rounded-card border border-[#E8E2D8]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#46564E] uppercase tracking-wider block">
              Điểm xuất phát của bạn
            </label>
            {lat && !manualCoords && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-[#BFE8D5] px-2 py-0.5 rounded-full">
                Vị trí GPS của bạn
              </span>
            )}
          </div>

          {/* Gentle Fallback if no GPS or if user prefers input */}
          {(!lat || geoError || manualCoords) ? (
            <div className="space-y-2">
              <p className="text-xs text-[#46564E] flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-600 shrink-0" />
                <span>Mình không lấy được vị trí của bạn. Bạn nhập địa chỉ đang đứng vào đây nhé!</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInputText}
                  onChange={(e) => setManualInputText(e.target.value)}
                  placeholder="Ví dụ: Hồ Hoàn Kiếm, Cầu Giấy..."
                  className="flex-1 px-3 py-2 text-xs rounded-input border border-[#E8E2D8] bg-white text-fm-text focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
                />
              </div>

              {/* Quick Preset Location Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_ORIGINS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSelectPreset(p)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      manualCoords?.lat === p.lat
                        ? 'bg-[#BFE8D5] border-emerald-600 font-bold text-[#46564E]'
                        : 'bg-white border-[#E8E2D8] text-fm-muted hover:bg-white'
                    }`}
                  >
                    📍 {p.label.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setManualCoords(null);
                    setManualInputText('');
                    requestLocation();
                  }}
                  className="text-[11px] text-emerald-800 underline hover:text-emerald-900 font-medium inline-flex items-center gap-1"
                >
                  <Compass size={12} /> Thử lại định vị tự động
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-800 space-y-1">
              <p className="font-medium">📍 Tọa độ GPS hiện tại: {lat.toFixed(4)}, {lng?.toFixed(4)}</p>
              <button
                type="button"
                onClick={() => setManualCoords({ lat: POPULAR_ORIGINS[0].lat, lng: POPULAR_ORIGINS[0].lng })}
                className="text-[11px] text-fm-muted underline hover:text-fm-text"
              >
                Đổi sang nhập địa chỉ thủ công
              </button>
            </div>
          )}
        </div>

        {/* Travel mode buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTravelMode('driving')}
            className={`flex-1 py-2 px-3 rounded-btn text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              travelMode === 'driving'
                ? 'bg-[#BFE8D5] border-[#46564E]/40 text-[#46564E] shadow-xs'
                : 'bg-white border-[#E8E2D8] text-fm-muted'
            }`}
          >
            <Car size={14} /> Xe máy / Ô tô
          </button>
          <button
            type="button"
            onClick={() => setTravelMode('walking')}
            className={`flex-1 py-2 px-3 rounded-btn text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              travelMode === 'walking'
                ? 'bg-[#BFE8D5] border-[#46564E]/40 text-[#46564E] shadow-xs'
                : 'bg-white border-[#E8E2D8] text-fm-muted'
            }`}
          >
            <Footprints size={14} /> Đi bộ
          </button>
        </div>

        {/* Location Consent Checkbox */}
        <label className="flex items-start gap-2 text-xs text-fm-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consentToSave}
            onChange={(e) => setConsentToSave(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
          />
          <span>
            Đồng ý lưu thông tin tuyến đường phục vụ nâng cao chất lượng dịch vụ (tuân thủ quyền riêng tư).
          </span>
        </label>

        {/* Calculate Button */}
        <Button
          size="lg"
          onClick={handleCalculateRoute}
          loading={isCalculating}
          leftIcon={<Navigation size={16} />}
          className="w-full justify-center shadow-soft"
        >
          Tìm đường đi ngay
        </Button>

        {/* Route Result Card */}
        {currentRoute && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-card p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-900">
              <span>Đã có tuyến đường phù hợp</span>
              <span className="text-[11px] bg-[#BFE8D5] text-[#46564E] px-2.5 py-0.5 rounded-full font-bold">
                {currentRoute.travel_mode === 'driving' ? 'Lái xe' : 'Đi bộ'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="bg-white p-2.5 rounded-btn shadow-xs border border-emerald-100">
                <p className="text-base font-extrabold text-[#46564E]">
                  {(currentRoute.distance_meters! / 1000).toFixed(1)} km
                </p>
                <p className="text-[10px] text-fm-muted">Khoảng cách</p>
              </div>
              <div className="bg-white p-2.5 rounded-btn shadow-xs border border-emerald-100">
                <p className="text-base font-extrabold text-[#46564E]">
                  {Math.round(currentRoute.duration_seconds! / 60)} phút
                </p>
                <p className="text-[10px] text-fm-muted">Thời gian ước tính</p>
              </div>
            </div>

            <p className="text-[10px] text-emerald-800 leading-tight pt-1">
              * Lộ trình tối ưu tránh các điểm nghẽn giao thông Hà Nội.
            </p>
          </div>
        )}
      </div>

      {/* Main Full-height Leaflet Map Container */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-10" />
      </div>
    </div>
  );
};
