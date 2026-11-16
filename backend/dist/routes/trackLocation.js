"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataService_1 = require("../services/dataService");
const router = (0, express_1.Router)();
// POST /api/track-location - Hoạt động ngầm fire-and-forget lưu tọa độ xuất phát của user
router.post('/', async (req, res) => {
    try {
        const { lat, lng, session_id, query } = req.body;
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return res.status(400).json({ error: 'Tọa độ lat/lng không hợp lệ' });
        }
        const saved = await dataService_1.dbService.saveUserLocation({
            lat,
            lng,
            session_id,
            query,
        });
        console.log(`📍 [TRACK-LOCATION PING] Ghi nhận tọa độ ngầm: lat=${lat}, lng=${lng}, query=${query || 'N/A'}, session=${session_id || 'N/A'}`);
        res.json({ success: true, id: saved.id });
    }
    catch (error) {
        console.error('Error saving user start location:', error);
        res.status(500).json({ error: error.message || 'Lỗi khi ghi nhận vị trí' });
    }
});
// GET /api/track-location - Lấy toàn bộ danh sách điểm ghim User cho Admin (/minh)
router.get('/', async (_req, res) => {
    try {
        const locations = await dataService_1.dbService.getAllUserLocations();
        res.json({ data: locations });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Lỗi khi tải danh sách vị trí' });
    }
});
// DELETE /api/track-location/:id - Xóa 1 điểm vị trí
router.delete('/:id', async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await dataService_1.dbService.deleteUserLocation(id);
        res.json({ success: true, id });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Lỗi khi xóa vị trí' });
    }
});
// DELETE /api/track-location - Xóa sạch danh sách vị trí
router.delete('/', async (_req, res) => {
    try {
        await dataService_1.dbService.clearUserLocations();
        res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử vị trí user' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Lỗi khi xóa vị trí' });
    }
});
exports.default = router;
