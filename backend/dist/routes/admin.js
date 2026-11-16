"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataService_1 = require("../services/dataService");
const router = (0, express_1.Router)();
// Route Explorer logs
router.get('/routes', (req, res) => {
    try {
        let list = dataService_1.dataStore.getRoutes();
        const search = req.query.search;
        const travel_mode = req.query.travel_mode;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(r => r.restaurant?.name.toLowerCase().includes(s) || r.session_id.toLowerCase().includes(s));
        }
        if (travel_mode) {
            list = list.filter(r => r.travel_mode === travel_mode);
        }
        const total = list.length;
        const start = (page - 1) * limit;
        const paginated = list.slice(start, start + limit);
        res.json({
            data: paginated,
            total,
            page,
            limit,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/routes/:id', (req, res) => {
    const routeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const route = dataService_1.dataStore.getRoutes().find(r => r.id === routeId);
    if (!route) {
        return res.status(404).json({ error: 'Không tìm thấy route log' });
    }
    res.json({ data: route });
});
// Admin Analytics
router.get('/analytics', (_req, res) => {
    const rests = dataService_1.dataStore.getRestaurants();
    const routes = dataService_1.dataStore.getRoutes();
    const totalMenus = rests.reduce((acc, r) => acc + (r.menus?.length || 0), 0);
    res.json({
        data: {
            total_restaurants: rests.length,
            active_restaurants: rests.filter(r => r.status === 'active').length,
            total_menu_items: totalMenus,
            verified_items: totalMenus,
            total_routes: routes.length,
            total_recommendations: 1250,
            total_reports: dataService_1.dataStore.getReports().length,
            pending_verifications: 8,
        }
    });
});
// CRUD Restaurants
router.get('/restaurants', (_req, res) => {
    const list = dataService_1.dataStore.getRestaurants();
    res.json({
        data: list,
        total: list.length,
        page: 1,
        limit: 100,
    });
});
router.post('/restaurants', (req, res) => {
    const created = dataService_1.dataStore.createRestaurant(req.body);
    res.status(201).json({ data: created });
});
router.put('/restaurants/:id', (req, res) => {
    const restId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = dataService_1.dataStore.updateRestaurant(restId, req.body);
    if (!updated) {
        return res.status(404).json({ error: 'Không tìm thấy quán ăn' });
    }
    res.json({ data: updated });
});
router.delete('/restaurants/:id', (req, res) => {
    const restId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    dataService_1.dataStore.deleteRestaurant(restId);
    res.json({ success: true, message: 'Đã xóa quán thành công' });
});
// Admin Reports
router.get('/reports', (_req, res) => {
    const reports = dataService_1.dataStore.getReports();
    res.json({
        data: reports,
        total: reports.length,
        page: 1,
        limit: 50,
    });
});
// Admin Users
router.get('/users', (_req, res) => {
    res.json({
        data: [
            { id: 'user-1', email: 'admin@foodmate.ai', display_name: 'Quản trị viên FoodMate', role: 'admin', created_at: '2026-01-01' },
            { id: 'user-2', email: 'user@foodmate.ai', display_name: 'Nguyễn Văn Ẩm Thực', role: 'user', created_at: '2026-03-01' },
        ],
        total: 2,
        page: 1,
        limit: 10,
    });
});
exports.default = router;
