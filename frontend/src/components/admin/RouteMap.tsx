import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RouteLog } from '../../types';

// Helper to decode google polyline or parse coordinates string
function parsePolyline(polylineStr?: string): [number, number][] {
  if (!polylineStr) return [];
  try {
    if (polylineStr.startsWith('[')) {
      return JSON.parse(polylineStr);
    }
    if (polylineStr.includes(';')) {
      return polylineStr.split(';').map(part => {
        const [lat, lng] = part.split(',').map(Number);
        return [lat, lng] as [number, number];
      });
    }
    // Google encoded polyline decode
    let index = 0, len = polylineStr.length;
    let lat = 0, lng = 0;
    const coordinates: [number, number][] = [];
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = polylineStr.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = polylineStr.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push([lat * 1e-5, lng * 1e-5]);
    }
    return coordinates;
  } catch {
    return [];
  }
}

// Custom clean SVG markers that do not fail to load
const createSvgIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="background:${color};color:#ffffff;font-weight:700;font-size:11px;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.25);border:2px solid #ffffff;">
          ${label}
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};margin-top:-1px;"></div>
      </div>
    `,
    iconSize: [26, 32],
    iconAnchor: [13, 32],
    popupAnchor: [0, -32],
  });
};

const originIcon = createSvgIcon('#10B981', 'A'); // Green for start A
const destIcon = createSvgIcon('#EF4444', 'B');   // Red for destination B

interface RouteMapProps {
  route?: RouteLog | null;
  className?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({ route, className = '' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter: [number, number] = route 
      ? [route.origin_lat, route.origin_lng] 
      : [21.0285, 105.8542]; // Hanoi center

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom Legend required by specification
    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'bg-white/95 backdrop-blur-sm p-3 text-xs rounded-xl shadow-lg border border-gray-200');
      div.style.minWidth = '220px';
      div.innerHTML = `
        <div style="font-weight:700;margin-bottom:6px;color:#46564E;border-bottom:1px solid #E5E7EB;padding-bottom:4px;">
          Chú giải Route Explorer
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
          <span style="display:inline-block;width:18px;height:18px;background:#10B981;color:#fff;border-radius:50%;text-align:center;line-height:18px;font-size:10px;font-weight:bold;">A</span>
          <span style="color:#4B5563;">Điểm xuất phát (Origin)</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
          <span style="display:inline-block;width:18px;height:18px;background:#EF4444;color:#fff;border-radius:50%;text-align:center;line-height:18px;font-size:10px;font-weight:bold;">B</span>
          <span style="color:#4B5563;">Quán ăn đích (Destination)</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="display:inline-block;width:24px;height:4px;background:#3B82F6;border-radius:2px;"></span>
          <span style="color:#1D4ED8;font-weight:600;">Tuyến đường API đề xuất</span>
        </div>
        <div style="font-size:10px;color:#9CA3AF;margin-top:4px;font-style:italic;">
          * Không phải hành trình GPS thực tế của người dùng
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    if (route) {
      // Add Origin Marker A
      L.marker([route.origin_lat, route.origin_lng], { icon: originIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding:4px;">
            <div style="font-weight:bold;color:#10B981;font-size:12px;">Điểm xuất phát (A)</div>
            <div style="font-size:11px;color:#4B5563;margin-top:2px;">Tọa độ: ${route.origin_lat.toFixed(5)}, ${route.origin_lng.toFixed(5)}</div>
          </div>
        `);

      // Add Destination Marker B
      L.marker([route.destination_lat, route.destination_lng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding:4px;">
            <div style="font-weight:bold;color:#EF4444;font-size:12px;">${route.restaurant?.name || 'Quán ăn đích (B)'}</div>
            <div style="font-size:11px;color:#4B5563;margin-top:2px;">${route.restaurant?.address || ''}</div>
          </div>
        `);

      // Polyline decode
      const coords = parsePolyline(route.route_polyline);
      if (coords.length > 0) {
        const polyline = L.polyline(coords, {
          color: '#3B82F6',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round',
        }).addTo(map);

        map.fitBounds(polyline.getBounds().pad(0.18));
      } else {
        // Fallback: draw straight dashed line if no detailed polyline
        const bounds = L.latLngBounds([
          [route.origin_lat, route.origin_lng],
          [route.destination_lat, route.destination_lng],
        ]);
        L.polyline(
          [
            [route.origin_lat, route.origin_lng],
            [route.destination_lat, route.destination_lng],
          ],
          { color: '#9CA3AF', weight: 3, dashArray: '6, 8', opacity: 0.7 }
        ).addTo(map);

        map.fitBounds(bounds.pad(0.25));
      }
    }

    // Force map re-render on resize
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [route]);

  if (!route) {
    return (
      <div className={`bg-gray-50 border border-dashed border-gray-300 rounded-card flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
          🗺️
        </div>
        <h4 className="font-semibold text-fm-text mb-1">Chưa chọn tuyến đường</h4>
        <p className="text-fm-text/50 text-xs max-w-xs">
          Vui lòng chọn một bản ghi lịch sử ở danh sách bên trái để kiểm tra chi tiết tuyến đường được đề xuất.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-card overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
    </div>
  );
};
