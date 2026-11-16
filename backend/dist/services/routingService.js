"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routingService = void 0;
const dataService_1 = require("./dataService");
exports.routingService = {
    async calculateAndLogRoute(params) {
        const originLat = params.origin_lat;
        const originLng = params.origin_lng;
        const destLat = params.dest_lat || params.destination_lat || 21.0285;
        const destLng = params.dest_lng || params.destination_lng || 105.8542;
        const placeId = params.place_id || 'place_unknown';
        const restName = params.restaurant_name || 'Quán ăn';
        const restAddr = params.restaurant_address || 'Hà Nội';
        const sessionId = params.session_id || 'session_' + Math.random().toString(36).substring(2, 9);
        let distanceMeters = 0;
        let durationSeconds = 0;
        let polyline = '';
        // 1. Try real OSRM (Open Source Routing Machine) API
        try {
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
            const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(3000) });
            const data = await res.json();
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                distanceMeters = Math.round(route.distance);
                durationSeconds = Math.round(route.duration);
                if (route.geometry?.coordinates) {
                    // Map to lat,lng format
                    const points = route.geometry.coordinates.map((c) => `${c[1].toFixed(5)},${c[0].toFixed(5)}`);
                    polyline = points.join(';');
                }
            }
        }
        catch {
            // OSRM failed or timeout, use mathematical calculation with Hanoi urban factor
        }
        // Fallback if OSRM was not reached
        if (!polyline || distanceMeters === 0) {
            const dLat = (destLat - originLat) * 111320;
            const dLng = (destLng - originLng) * 111320 * Math.cos(originLat * (Math.PI / 180));
            const straightMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
            distanceMeters = Math.max(300, Math.round(straightMeters * 1.35));
            durationSeconds = Math.round((distanceMeters / 6000) * 3600); // 25 km/h urban
            const midLat1 = originLat + (destLat - originLat) * 0.35 + 0.0008;
            const midLng1 = originLng + (destLng - originLng) * 0.35 - 0.0012;
            const midLat2 = originLat + (destLat - originLat) * 0.70;
            const midLng2 = originLng + (destLng - originLng) * 0.70 + 0.0008;
            polyline = `${originLat.toFixed(5)},${originLng.toFixed(5)};${midLat1.toFixed(5)},${midLng1.toFixed(5)};${midLat2.toFixed(5)},${midLng2.toFixed(5)};${destLat.toFixed(5)},${destLng.toFixed(5)}`;
        }
        // 2. INSERT INTO route_logs
        const savedLog = await dataService_1.dbService.saveRouteLog({
            session_id: sessionId,
            place_id: placeId,
            restaurant_name: restName,
            restaurant_address: restAddr,
            origin_lat: originLat,
            origin_lng: originLng,
            dest_lat: destLat,
            dest_lng: destLng,
            distance_meters: distanceMeters,
            duration_seconds: durationSeconds,
            route_polyline: polyline,
        });
        return savedLog;
    },
    async getAllRoutes() {
        return dataService_1.dbService.getAllRouteLogs();
    },
    async getRouteById(id) {
        return dataService_1.dbService.getRouteLogById(id);
    },
};
