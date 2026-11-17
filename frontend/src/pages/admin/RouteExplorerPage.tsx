import React, { useEffect, useState, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Search,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';
import { routingApi, configApi, apiClient } from '../../services/api';
import type { RouteLog, UserStartLocation } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DeleteModalState {
  isOpen: boolean;
  type: 'single' | 'cleanup';
  id?: string;
  name?: string;
}

export const RouteExplorerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'user_map' | 'config'>('routes');

  // --- Route Logs State ---
  const [routes, setRoutes] = useState<RouteLog[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteLog | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // --- User Start Locations State (Bản đồ User) ---
  const [userLocations, setUserLocations] = useState<UserStartLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<UserStartLocation | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState<boolean>(false);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  // --- API Config State ---
  const [googleKey, setGoogleKey] = useState<string>('');
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [showGoogleKey, setShowGoogleKey] = useState<boolean>(false);
  const [showGeminiKey, setShowGeminiKey] = useState<boolean>(false);
  const [hasGoogleKey, setHasGoogleKey] = useState<boolean>(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);
  const [configErrorMsg, setConfigErrorMsg] = useState<string | null>(null);

  // Map refs for Routes Map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Map refs for User Map
  const userMapContainerRef = useRef<HTMLDivElement>(null);
  const userMapInstanceRef = useRef<L.Map | null>(null);
  const userMarkersRef = useRef<L.Marker[]>([]);

  // Fetch routes from /api/routes
  const loadRoutes = async () => {
    setIsLoadingRoutes(true);
    try {
      const data = await routingApi.getAllRoutes();
      setRoutes(data || []);
      if (data && data.length > 0) {
        setSelectedRoute(data[0]);
      } else {
        setSelectedRoute(null);
      }
    } catch (err) {
      console.error('Failed to load route logs:', err);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Fetch user start locations from /api/track-location or Google Apps Script doGet
  const loadUserLocations = async () => {
    setIsLoadingLocations(true);
    try {
      let list: UserStartLocation[] = [];
      const isGithubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

      if (!isGithubPages) {
        try {
          const res = await apiClient.get('/api/track-location');
          list = res.data?.data || [];
        } catch (e) {
          console.warn('Local track-location failed, falling back to Google Sheets / GAS:', e);
        }
      }

      // Nếu chạy trên GitHub Pages hoặc Backend local không có dữ liệu, đọc trực tiếp từ Google Sheets qua GAS
      if (list.length === 0) {
        const gasUrl = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbzeYapbXJWzyxYdVKcxCdTsg446DRsNFd3bFxhLsiWG3vTk6HGp7h1dqvHkdvN4-WlvBg/exec';
        const res = await fetch(`${gasUrl}?action=get_logs`);
        const data = await res.json();
        const logs = Array.isArray(data) ? data : data?.data || [];
        list = logs.map((item: any, idx: number) => ({
          id: item.id || `gas-log-${idx}`,
          session_id: item.session_id || item.sessionId || `sess-${idx}`,
          lat: Number(item.lat || item.latitude) || 21.0285,
          lng: Number(item.lng || item.longitude) || 105.8542,
          query: item.query || item.suggested || item.suggested_dishes || 'Khách tìm món',
          created_at: item.timestamp || item.created_at || new Date().toISOString(),
        }));
      }

      setUserLocations(list);
      if (list.length > 0) {
        setSelectedLocation(list[0]);
      }
    } catch (err) {
      console.error('Failed to load user start locations:', err);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Fetch config from /api/config
  const loadConfig = async () => {
    setIsLoadingConfig(true);
    setConfigSuccessMsg(null);
    setConfigErrorMsg(null);
    try {
      const res = await configApi.get();
      setGoogleKey(res.google_maps_key || '');
      setGeminiKey(res.gemini_api_key || '');
      setHasGoogleKey(res.has_google_key);
      setHasGeminiKey(res.has_gemini_key);
    } catch (err: any) {
      console.error('Failed to load API configs:', err);
      setConfigErrorMsg('Không thể tải cấu hình API từ máy chủ');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadRoutes();
    loadUserLocations();
    loadConfig();
  }, []);

  // Initialize Leaflet Map when in routes tab
  useEffect(() => {
    if (activeTab !== 'routes' || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [21.0285, 105.8542],
      zoom: 13,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeTab]);

  // Re-draw map markers and polyline when selectedRoute changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRoute || activeTab !== 'routes') return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const markerA = L.marker([selectedRoute.origin_lat, selectedRoute.origin_lng], {
      icon: L.divIcon({
        className: 'custom-pin-a',
        html: `<div style="background:#10B981;color:#fff;font-weight:bold;font-size:12px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);">A</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      }),
    }).addTo(map).bindPopup(`<b>Điểm xuất phát (A)</b><br/>Tọa độ: ${selectedRoute.origin_lat.toFixed(5)}, ${selectedRoute.origin_lng.toFixed(5)}`);

    const markerB = L.marker([selectedRoute.dest_lat, selectedRoute.dest_lng], {
      icon: L.divIcon({
        className: 'custom-pin-b',
        html: `<div style="background:#EF4444;color:#fff;font-weight:bold;font-size:12px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);">B</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      }),
    }).addTo(map).bindPopup(`<b>${selectedRoute.restaurant_name}</b><br/>${selectedRoute.restaurant_address || ''}<br/>Tọa độ: ${selectedRoute.dest_lat.toFixed(5)}, ${selectedRoute.dest_lng.toFixed(5)}`);

    markersRef.current = [markerA, markerB];

    if (selectedRoute.route_polyline) {
      try {
        const points: [number, number][] = selectedRoute.route_polyline.split(';').map((p) => {
          const [la, lo] = p.split(',').map(Number);
          return [la, lo];
        });

        const polyline = L.polyline(points, {
          color: '#2563EB',
          weight: 5,
          opacity: 0.9,
        }).addTo(map);

        polylineRef.current = polyline;
        map.fitBounds(polyline.getBounds().pad(0.25));
      } catch (err) {
        map.setView([selectedRoute.dest_lat, selectedRoute.dest_lng], 14);
      }
    } else {
      map.setView([selectedRoute.dest_lat, selectedRoute.dest_lng], 14);
    }
  }, [selectedRoute, activeTab]);

  // Initialize Leaflet Map for Tab "Bản đồ User"
  useEffect(() => {
    if (activeTab !== 'user_map' || !userMapContainerRef.current) return;

    if (userMapInstanceRef.current) {
      userMapInstanceRef.current.remove();
      userMapInstanceRef.current = null;
    }

    const map = L.map(userMapContainerRef.current, {
      center: [21.0285, 105.8542],
      zoom: 13,
      zoomControl: true,
    });
    userMapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Plot all user location markers
    userMarkersRef.current = [];
    const bounds: L.LatLngTuple[] = [];

    userLocations.forEach((loc) => {
      let formattedDate = '';
      try {
        formattedDate = format(new Date(loc.created_at), 'HH:mm - dd/MM/yyyy', { locale: vi });
      } catch {
        formattedDate = loc.created_at;
      }

      const marker = L.marker([loc.lat, loc.lng], {
        icon: L.divIcon({
          className: 'custom-user-marker',
          html: `<div style="background:#2563EB;color:#fff;font-weight:bold;font-size:12px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 3px 10px rgba(37,99,235,0.5);cursor:pointer;">👤</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; min-width: 190px;">
          <div style="font-weight: 800; color: #1E40AF; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            📍 Vị trí bắt đầu của User
          </div>
          <div style="color: #374151; margin-bottom: 2px;">
            <b>Thời gian:</b> ${formattedDate}
          </div>
          <div style="color: #374151; margin-bottom: 2px;">
            <b>Món tìm kiếm:</b> <span style="color: #059669; font-weight: 700;">${loc.query || 'Không nhập món'}</span>
          </div>
          <div style="color: #4B5563; font-family: monospace; font-size: 11px; margin-bottom: 4px;">
            Tọa độ: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}
          </div>
          <div style="color: #9CA3AF; font-size: 10px; border-top: 1px solid #E5E7EB; padding-top: 3px;">
            Session: ${loc.session_id}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedLocation(loc);
      });

      userMarkersRef.current.push(marker);
      bounds.push([loc.lat, loc.lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds).pad(0.2));
      setTimeout(() => {
        if (userMapInstanceRef.current) userMapInstanceRef.current.invalidateSize();
      }, 150);
    }

    return () => {
      map.remove();
      userMapInstanceRef.current = null;
    };
  }, [activeTab, userLocations]);

  // Pan to selected user location
  useEffect(() => {
    if (activeTab === 'user_map' && userMapInstanceRef.current && (userMapInstanceRef.current as any)._loaded && selectedLocation) {
      userMapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 15, {
        animate: false,
      });
    }
  }, [selectedLocation, activeTab]);

  // Handle single route delete or bulk cleanup
  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'single' && deleteModal.id) {
        await routingApi.deleteRoute(deleteModal.id);
        setRoutes((prev) => prev.filter((r) => r.id !== deleteModal.id));
        if (selectedRoute?.id === deleteModal.id) {
          const remaining = routes.filter((r) => r.id !== deleteModal.id);
          setSelectedRoute(remaining.length > 0 ? remaining[0] : null);
        }
      } else if (deleteModal.type === 'cleanup') {
        const res = await routingApi.cleanupOldRoutes(30);
        await loadRoutes();
        alert(`Đã dọn dẹp thành công ${res.deletedCount || 0} lộ trình cũ!`);
      }
      setDeleteModal(null);
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err.message || 'Không thể hoàn tất thao tác'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete single user location
  const handleDeleteUserLocation = async (id: string) => {
    try {
      await apiClient.delete(`/api/track-location/${id}`);
      setUserLocations((prev) => prev.filter((l) => l.id !== id));
      if (selectedLocation?.id === id) {
        const remaining = userLocations.filter((l) => l.id !== id);
        setSelectedLocation(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Lỗi khi xóa điểm vị trí:', err);
    }
  };

  // Clear all user locations
  const handleClearAllLocations = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả các điểm vị trí người dùng?')) return;
    try {
      await apiClient.delete('/api/track-location');
      setUserLocations([]);
      setSelectedLocation(null);
    } catch (err) {
      console.error('Lỗi khi xóa vị trí:', err);
    }
  };

  // Handle saving API keys
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSuccessMsg(null);
    setConfigErrorMsg(null);
    try {
      await configApi.save({
        google_maps_key: googleKey.trim(),
        gemini_api_key: geminiKey.trim(),
      });
      setHasGoogleKey(!!googleKey.trim() && !googleKey.includes('your_'));
      setHasGeminiKey(!!geminiKey.trim() && !geminiKey.includes('your_'));
      setConfigSuccessMsg('Đã lưu cấu hình API Keys thành công! Các thiết lập có hiệu lực ngay lập tức.');
    } catch (err: any) {
      setConfigErrorMsg(err.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const filteredRoutes = routes.filter((r) =>
    r.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.restaurant_address && r.restaurant_address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUserLocations = userLocations.filter((l) => {
    if (!userSearchTerm.trim()) return true;
    const term = userSearchTerm.toLowerCase();
    const qMatch = l.query ? l.query.toLowerCase().includes(term) : false;
    const sMatch = l.session_id ? l.session_id.toLowerCase().includes(term) : false;
    return qMatch || sMatch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#FFF9F0]">
      {/* Top Bar Header with Tabs and Disclaimer */}
      <div className="bg-white border-b border-[#E8E2D8] px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#BFE8D5] flex items-center justify-center text-[#46564E] shadow-2xs">
            <Navigation size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-[#46564E] text-base leading-tight">
                FoodMate Management
              </h1>
              <span className="text-[10px] font-mono uppercase bg-[#FFE6A7] text-[#46564E] px-1.5 py-0.5 rounded-full font-bold">
                /minh
              </span>
            </div>
            <p className="text-[11px] text-fm-muted">
              Bảng quản trị nội bộ • Lộ trình, Bản đồ User và Cấu hình API
            </p>
          </div>
        </div>

        {/* Tab Controls: 3 Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FFF9F0] p-1 rounded-xl border border-[#E8E2D8]">
          {/* Tab 1: Quản lý lộ trình */}
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'routes'
                ? 'bg-white text-[#46564E] shadow-2xs border border-[#E8E2D8]'
                : 'text-fm-muted hover:text-[#46564E]'
            }`}
          >
            <Layers size={14} />
            Quản lý lộ trình
            <span className="text-[10px] bg-[#BFE8D5] text-[#46564E] px-1.5 py-0.2 rounded-full font-bold">
              {routes.length}
            </span>
          </button>

          {/* Tab 2: Bản đồ User (Vị trí bắt đầu) */}
          <button
            onClick={() => {
              setActiveTab('user_map');
              loadUserLocations();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'user_map'
                ? 'bg-white text-blue-700 shadow-2xs border border-[#E8E2D8]'
                : 'text-fm-muted hover:text-blue-700'
            }`}
          >
            <Users size={14} className="text-blue-600" />
            Bản đồ User
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
              {userLocations.length}
            </span>
          </button>

          {/* Tab 3: Cấu hình API */}
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-white text-[#46564E] shadow-2xs border border-[#E8E2D8]'
                : 'text-fm-muted hover:text-[#46564E]'
            }`}
          >
            <Key size={14} />
            Cấu hình API
            {(hasGoogleKey && hasGeminiKey) ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã cấu hình đủ key" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Chưa đủ key" />
            )}
          </button>
        </div>

        {/* Technical Disclaimer Banner */}
        <div className="bg-[#FFF9F0] border border-[#FFE6A7] text-amber-950 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium shadow-2xs">
          <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
          <span className="hidden sm:inline">Dữ liệu GPS người dùng &amp; lộ trình đề xuất phục vụ tối ưu dịch vụ.</span>
          <span className="sm:hidden">Quản trị nội bộ</span>
        </div>
      </div>

      {/* TAB 1: QUẢN LÝ LỘ TRÌNH */}
      {activeTab === 'routes' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <div className="w-full lg:w-[420px] bg-white border-b lg:border-b-0 lg:border-r border-[#E8E2D8] flex flex-col overflow-hidden shrink-0 z-10 max-h-[45vh] lg:max-h-full">
            <div className="p-3 border-b border-gray-100 flex flex-col gap-2 bg-[#FFF9F0]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo quán, địa chỉ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-input border border-[#E8E2D8] bg-white text-fm-text focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
                  />
                </div>
                <button
                  onClick={loadRoutes}
                  className="p-2 rounded-btn bg-white border border-[#E8E2D8] text-fm-muted hover:text-fm-text hover:bg-gray-50 transition-colors shrink-0"
                  title="Tải lại danh sách"
                >
                  <RefreshCw size={13} className={isLoadingRoutes ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-fm-muted font-medium">
                  Tổng cộng: <strong className="text-[#46564E]">{filteredRoutes.length}</strong> lộ trình
                </span>
                <button
                  onClick={() =>
                    setDeleteModal({
                      isOpen: true,
                      type: 'cleanup',
                    })
                  }
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md border border-rose-200 transition-colors flex items-center gap-1"
                  title="Xóa toàn bộ các lộ trình đã lưu cách đây hơn 30 ngày"
                >
                  <Calendar size={11} />
                  Dọn dẹp log &gt; 30 ngày
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1.5">
              {isLoadingRoutes && (
                <div className="p-6 text-center text-xs text-fm-muted flex flex-col items-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-emerald-600" />
                  Đang tải nhật ký lộ trình chi tiết...
                </div>
              )}

              {!isLoadingRoutes && filteredRoutes.length === 0 && (
                <div className="p-8 text-center text-xs text-fm-muted">
                  Chưa có dữ liệu chuyến đi nào khớp với tìm kiếm.
                </div>
              )}

              {filteredRoutes.map((r) => {
                const isSelected = selectedRoute?.id === r.id;
                let formattedDate = '';
                try {
                  formattedDate = format(new Date(r.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: vi });
                } catch {
                  formattedDate = r.created_at;
                }

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoute(r)}
                    className={`p-3 rounded-card cursor-pointer border transition-all relative group ${
                      isSelected
                        ? 'bg-[#BFE8D5]/35 border-emerald-500 shadow-2xs ring-1 ring-emerald-500/30'
                        : 'bg-white border-[#E8E2D8] hover:bg-[#FFF9F0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-xs text-[#46564E] line-clamp-1 flex-1">
                        {r.restaurant_name}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-mono text-fm-muted">
                          {(r.distance_meters / 1000).toFixed(1)} km
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({
                              isOpen: true,
                              type: 'single',
                              id: r.id,
                              name: r.restaurant_name,
                            });
                          }}
                          className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                          title="Xóa lộ trình này"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-fm-muted line-clamp-1 mb-2">
                      {r.restaurant_address || 'Hà Nội'}
                    </p>

                    <div className="bg-[#FFF9F0]/80 rounded-md p-1.5 border border-[#E8E2D8]/70 text-[10px] font-mono text-gray-600 mb-2 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-700 font-semibold">Khách (A):</span>
                        <span>{r.origin_lat.toFixed(5)}, {r.origin_lng.toFixed(5)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-rose-600 font-semibold">Quán (B):</span>
                        <span>{r.dest_lat.toFixed(5)}, {r.dest_lng.toFixed(5)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {formattedDate}
                      </span>
                      <span className="font-semibold text-emerald-800 bg-[#BFE8D5]/60 px-1.5 py-0.5 rounded">
                        {Math.round(r.duration_seconds / 60)} phút
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 relative h-full min-h-[350px]">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {selectedRoute && (
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-[#E8E2D8] rounded-card shadow-soft p-3.5 max-w-sm hidden sm:block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Lộ trình đang chọn
                  </span>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        type: 'single',
                        id: selectedRoute.id,
                        name: selectedRoute.restaurant_name,
                      })
                    }
                    className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 size={12} /> Xóa
                  </button>
                </div>
                <h3 className="font-extrabold text-[#46564E] text-sm line-clamp-1">
                  {selectedRoute.restaurant_name}
                </h3>
                <p className="text-xs text-fm-muted line-clamp-1 mb-2">
                  {selectedRoute.restaurant_address}
                </p>

                <div className="bg-[#FFF9F0] p-2 rounded-lg border border-[#E8E2D8] text-[11px] font-mono text-gray-700 mb-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-bold">Điểm A (GPS):</span>
                    <span>{selectedRoute.origin_lat.toFixed(5)}, {selectedRoute.origin_lng.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-600 font-bold">Điểm B (Quán):</span>
                    <span>{selectedRoute.dest_lat.toFixed(5)}, {selectedRoute.dest_lng.toFixed(5)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-[#FFF9F0] p-1.5 rounded border border-[#E8E2D8]">
                    <span className="text-[10px] text-fm-muted block">Khoảng cách</span>
                    <span className="font-extrabold text-[#46564E]">
                      {(selectedRoute.distance_meters / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <div className="bg-[#FFF9F0] p-1.5 rounded border border-[#E8E2D8]">
                    <span className="text-[10px] text-fm-muted block">Thời gian ước tính</span>
                    <span className="font-extrabold text-[#46564E]">
                      {Math.round(selectedRoute.duration_seconds / 60)} phút
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BẢN ĐỒ USER (VỊ TRÍ BẮT ĐẦU CỦA KHÁCH HÀNG) */}
      {activeTab === 'user_map' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Left Column: List of User Start Locations */}
          <div className="w-full lg:w-[380px] bg-white border-b lg:border-b-0 lg:border-r border-[#E8E2D8] flex flex-col overflow-hidden shrink-0 z-10 max-h-[40vh] lg:max-h-full">
            <div className="p-3 border-b border-gray-100 flex flex-col gap-2 bg-[#FFF9F0]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo món, session..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-input border border-[#E8E2D8] bg-white text-fm-text focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  onClick={loadUserLocations}
                  className="p-2 rounded-btn bg-white border border-[#E8E2D8] text-fm-muted hover:text-fm-text hover:bg-gray-50 transition-colors shrink-0"
                  title="Tải lại danh sách vị trí"
                >
                  <RefreshCw size={13} className={isLoadingLocations ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-fm-muted font-medium">
                  Tổng cộng: <strong className="text-blue-700 font-bold">{filteredUserLocations.length}</strong> điểm ghim
                </span>
                <button
                  onClick={handleClearAllLocations}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition-colors flex items-center gap-1"
                  title="Xóa tất cả các điểm ghim vị trí"
                >
                  <Trash2 size={11} />
                  Xóa tất cả
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1.5">
              {isLoadingLocations && (
                <div className="p-6 text-center text-xs text-fm-muted flex flex-col items-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-blue-600" />
                  Đang tải danh sách vị trí người dùng...
                </div>
              )}

              {!isLoadingLocations && filteredUserLocations.length === 0 && (
                <div className="p-8 text-center text-xs text-fm-muted">
                  Chưa có vị trí người dùng nào được ghi nhận.
                </div>
              )}

              {filteredUserLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                let formattedDate = '';
                try {
                  formattedDate = format(new Date(loc.created_at), 'HH:mm - dd/MM/yyyy', { locale: vi });
                } catch {
                  formattedDate = loc.created_at;
                }

                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`p-3 rounded-card cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500/30'
                        : 'bg-white border-[#E8E2D8] hover:bg-[#FFF9F0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">📍</span>
                        <h4 className="font-bold text-xs text-[#46564E] line-clamp-1">
                          {loc.query ? `Tìm kiếm: "${loc.query}"` : 'Bấm "Hôm nay ăn gì?"'}
                        </h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUserLocation(loc.id);
                        }}
                        className="text-gray-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                        title="Xóa điểm này"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="bg-[#FFF9F0] rounded p-1.5 border border-[#E8E2D8] text-[10px] font-mono text-gray-700 mb-1.5 flex justify-between">
                      <span className="text-blue-700 font-semibold">Tọa độ:</span>
                      <span>{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {formattedDate}
                      </span>
                      <span className="font-mono text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        {loc.session_id.slice(-8)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Large Leaflet Map */}
          <div className="flex-1 relative h-full min-h-[350px]">
            <div ref={userMapContainerRef} className="w-full h-full z-0" />

            {selectedLocation && (
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-blue-200 rounded-card shadow-soft p-3.5 max-w-sm hidden sm:block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Điểm xuất phát người dùng
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {selectedLocation.session_id.slice(-8)}
                  </span>
                </div>
                <h3 className="font-extrabold text-[#46564E] text-sm mb-1">
                  {selectedLocation.query ? `Món tìm kiếm: "${selectedLocation.query}"` : 'Lượt tìm ngẫu nhiên'}
                </h3>
                <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-100 text-[11px] font-mono text-blue-900 mb-2 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Vĩ độ (Lat):</span>
                    <strong>{selectedLocation.lat.toFixed(6)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Kinh độ (Lng):</span>
                    <strong>{selectedLocation.lng.toFixed(6)}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Clock size={12} className="text-gray-400" />
                  <span>
                    {format(new Date(selectedLocation.created_at), 'HH:mm:ss - dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CẤU HÌNH API KEYS */}
      {activeTab === 'config' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="w-full max-w-2xl bg-white border border-[#E8E2D8] rounded-[22px] shadow-soft p-6 md:p-8 my-auto">
            <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-[#BFE8D5] flex items-center justify-center text-[#46564E] shadow-2xs">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-[#46564E]">
                  Cấu hình API Keys Hệ Thống
                </h2>
                <p className="text-xs text-fm-muted">
                  Thiết lập Google Cloud và Google Gemini API Key trực tiếp vào Cơ sở dữ liệu
                </p>
              </div>
            </div>

            {configSuccessMsg && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{configSuccessMsg}</span>
              </div>
            )}
            {configErrorMsg && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>{configErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="mt-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#46564E] flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-600" />
                    Google Cloud API Key (Places & Routes API)
                  </label>
                  {hasGoogleKey ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Đã cấu hình
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      Chưa thiết lập
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showGoogleKey ? 'text' : 'password'}
                    value={googleKey}
                    onChange={(e) => setGoogleKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono rounded-input border border-[#E8E2D8] bg-[#FFF9F0]/50 text-[#46564E] focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleKey(!showGoogleKey)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    title={showGoogleKey ? 'Ẩn' : 'Hiện'}
                  >
                    {showGoogleKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-fm-muted">
                  Dùng để gọi Google Places Search thời gian thực và Google Routes API chỉ đường.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#46564E] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-500" />
                    Google Gemini API Key (Gemini 1.5 Flash)
                  </label>
                  {hasGeminiKey ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Đã cấu hình
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      Chưa thiết lập
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono rounded-input border border-[#E8E2D8] bg-[#FFF9F0]/50 text-[#46564E] focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    title={showGeminiKey ? 'Ẩn' : 'Hiện'}
                  >
                    {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-fm-muted">
                  Dùng để đóng vai bình luận viên vui tính nhận xét ngắn gọn về món ăn và thời tiết.
                </p>
              </div>

              <div className="p-3.5 bg-[#FFF9F0] border border-[#FFE6A7] rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Cơ chế ưu tiên thông minh:</strong> Các API Key được lưu tại trang quản trị này sẽ được lưu trữ trong bảng <code className="font-mono bg-white px-1 py-0.5 rounded text-gray-800">system_configs</code> và tự động ghi đè giá trị trong file <code className="font-mono bg-white px-1 py-0.5 rounded text-gray-800">.env</code> mà không cần khởi động lại máy chủ.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={loadConfig}
                  disabled={isLoadingConfig}
                  className="px-4 py-2.5 text-xs font-semibold rounded-btn border border-[#E8E2D8] bg-white text-fm-muted hover:text-[#46564E] hover:bg-gray-50 transition-colors"
                >
                  Tải lại
                </button>
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="px-6 py-2.5 text-xs font-bold rounded-btn bg-[#BFE8D5] text-[#46564E] hover:brightness-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={14} className={isSavingConfig ? 'animate-spin' : ''} />
                  {isSavingConfig ? 'Đang lưu cấu hình...' : 'Lưu cấu hình API'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFETY CONFIRMATION MODAL */}
      {deleteModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[22px] max-w-md w-full border border-[#E8E2D8] shadow-soft p-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <h3 className="font-extrabold text-[#46564E] text-center text-base mb-2">
              {deleteModal.type === 'single' ? 'Xác nhận xóa lộ trình' : 'Xác nhận dọn dẹp lộ trình cũ'}
            </h3>

            {deleteModal.type === 'single' ? (
              <p className="text-xs text-center text-fm-muted leading-relaxed mb-6">
                Bạn có chắc chắn muốn xóa lộ trình đến <strong>"{deleteModal.name}"</strong> không?
                <br />
                <span className="text-rose-600 font-medium">Dữ liệu đã xóa sẽ không thể khôi phục.</span>
              </p>
            ) : (
              <p className="text-xs text-center text-fm-muted leading-relaxed mb-6">
                Bạn có chắc chắn muốn dọn dẹp tất cả các lộ trình được tạo trước 30 ngày không?
                <br />
                <span className="text-rose-600 font-medium">Dữ liệu đã xóa sẽ không thể khôi phục.</span>
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-btn border border-[#E8E2D8] bg-white text-fm-muted hover:text-[#46564E] hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 text-xs font-bold rounded-btn bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} className={isDeleting ? 'animate-spin' : ''} />
                {isDeleting ? 'Đang xóa...' : 'Xóa dữ liệu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
