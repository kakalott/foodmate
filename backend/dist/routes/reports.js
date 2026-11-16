"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataService_1 = require("../services/dataService");
const router = (0, express_1.Router)();
router.post('/', (req, res) => {
    try {
        const report = dataService_1.dataStore.addReport(req.body);
        res.json({ data: report });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Lỗi khi gửi báo cáo' });
    }
});
exports.default = router;
