import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import weatherRoutes from './routes/weather';
import recommendationRoutes from './routes/recommendations';
import routingRoutes from './routes/routes';
import configRoutes from './routes/config';
import trackLocationRoutes from './routes/trackLocation';
import routeFactRoutes from './routes/routeFact';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

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
app.use('/api/weather', weatherRoutes);
app.use('/api/recommend', recommendationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/routes', routingRoutes);
app.use('/api/admin/routes', routingRoutes); // Alias for Route Explorer
app.use('/api/config', configRoutes);
app.use('/api/track-location', trackLocationRoutes);
app.use('/api/user-locations', trackLocationRoutes);
app.use('/api/route-fact', routeFactRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Lỗi máy chủ nội bộ' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 FoodMate Backend is running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🗺️ Route Explorer Logs: http://localhost:${PORT}/api/routes`);
});

export default app;
