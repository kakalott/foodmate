"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const weather_1 = __importDefault(require("./routes/weather"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const routes_1 = __importDefault(require("./routes/routes"));
const config_1 = __importDefault(require("./routes/config"));
const trackLocation_1 = __importDefault(require("./routes/trackLocation"));
const routeFact_1 = __importDefault(require("./routes/routeFact"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express_1.default.json());
// Request logging
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
    next();
});
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        project: 'FoodMate v3.0 (Real-time Places & Route Logs)',
        version: '3.0.0',
        mode: 'Open Web, No Auth, Real-Time Places',
        timestamp: new Date().toISOString(),
    });
});
// Mount Routes (Architecture v3.0)
app.use('/api/weather', weather_1.default);
app.use('/api/recommend', recommendations_1.default);
app.use('/api/recommendations', recommendations_1.default);
app.use('/api/routes', routes_1.default);
app.use('/api/admin/routes', routes_1.default); // Alias for Route Explorer
app.use('/api/config', config_1.default);
app.use('/api/track-location', trackLocation_1.default);
app.use('/api/user-locations', trackLocation_1.default);
app.use('/api/route-fact', routeFact_1.default);
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: err.message || 'Lỗi máy chủ nội bộ' });
});
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 FoodMate Backend is running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🗺️ Route Explorer Logs: http://localhost:${PORT}/api/routes`);
});
exports.default = app;
