"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const geminiService_1 = require("../services/geminiService");
const router = (0, express_1.Router)();
// POST /api/route-fact
// Nhận { restaurant_name, dish_name } (hoặc textbox_value)
// Gọi Gemini tạo fact siêu ngắn (dưới 25 chữ) tạo hứng khởi trên đường đi
router.post('/', async (req, res) => {
    try {
        const { restaurant_name, dish_name, textbox_value } = req.body;
        const venueName = restaurant_name || 'quán ăn';
        const dish = dish_name || textbox_value || 'món ngon';
        const fact = await geminiService_1.geminiService.generateRouteFact(venueName, dish);
        res.json({ route_fact: fact });
    }
    catch (error) {
        console.error('Error generating route fact:', error);
        res.json({ route_fact: 'Món ăn ngon nhất khi thưởng thức lúc còn nóng sốt và chia sẻ cùng bạn bè!' });
    }
});
exports.default = router;
