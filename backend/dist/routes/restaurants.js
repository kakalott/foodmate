"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataService_1 = require("../services/dataService");
const router = (0, express_1.Router)();
// GET /api/restaurants
router.get('/', (req, res) => {
    try {
        let list = dataService_1.dataStore.getRestaurants();
        const search = req.query.search;
        const category = req.query.category;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(r => r.name.toLowerCase().includes(s) || r.address.toLowerCase().includes(s));
        }
        if (category) {
            list = list.filter(r => r.categories?.some(c => c.slug === category || c.id === category));
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
// GET /api/restaurants/:id
router.get('/:id', (req, res) => {
    const restId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const rest = dataService_1.dataStore.getRestaurantById(restId);
    if (!rest) {
        return res.status(404).json({ error: 'Không tìm thấy quán ăn' });
    }
    res.json({ data: rest });
});
// GET /api/restaurants/:id/menus
router.get('/:id/menus', (req, res) => {
    const restId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const rest = dataService_1.dataStore.getRestaurantById(restId);
    if (!rest) {
        return res.status(404).json({ error: 'Không tìm thấy quán ăn' });
    }
    res.json({ data: rest.menus || [] });
});
exports.default = router;
