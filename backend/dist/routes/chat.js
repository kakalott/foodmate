"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const geminiService_1 = require("../services/geminiService");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const { message, history, session_id } = req.body;
        const reply = await geminiService_1.geminiService.chat(message, history || [], session_id || 'sess_default');
        res.json({ data: reply });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Lỗi khi trò chuyện với AI' });
    }
});
exports.default = router;
