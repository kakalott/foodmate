"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weatherService_1 = require("../services/weatherService");
const router = (0, express_1.Router)();
router.get('/current', async (req, res) => {
    try {
        const lat = req.query.lat ? Number(req.query.lat) : undefined;
        const lng = req.query.lng ? Number(req.query.lng) : undefined;
        const weather = await weatherService_1.weatherService.getCurrentWeather(lat, lng);
        res.json({ data: weather });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Lỗi khi lấy thông tin thời tiết' });
    }
});
exports.default = router;
