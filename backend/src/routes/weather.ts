import { Router, Request, Response } from 'express';
import { weatherService } from '../services/weatherService';

const router = Router();

router.get('/current', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const weather = await weatherService.getCurrentWeather(lat, lng);
    res.json({ data: weather });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi lấy thông tin thời tiết' });
  }
});

export default router;
