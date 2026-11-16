"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const geminiService_1 = require("../services/geminiService");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const recs = await geminiService_1.geminiService.getRecommendations(req.body);
        res.json({ data: recs });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Lỗi khi tạo đề xuất' });
    }
});
exports.default = router;
