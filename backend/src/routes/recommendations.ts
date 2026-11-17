import { Router, Request, Response } from 'express';
import { geminiService } from '../services/geminiService';
import { logToGoogleSheets } from '../services/sheetsService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const recs = await geminiService.getRecommendations(req.body);
    res.json({ data: recs });

    // Bắn log ngầm sang Google Sheets (Search_Logs)
    const lat = req.body?.origin_lat || req.body?.lat;
    const lng = req.body?.origin_lng || req.body?.lng;
    const userText = req.body?.textbox_value || req.body?.text || req.body?.dish_type || '';
    const weatherInfo = recs?.weather ? `${recs.weather.temperature}°C, ${recs.weather.description}` : '';

    logToGoogleSheets('Search_Logs', {
      session_id: req.body?.session_id || req.body?.sessionId || 'unknown',
      origin_lat: lat,
      origin_lng: lng,
      user_textbox: userText,
      weather: weatherInfo,
      suggested_dishes: (recs?.recommended_dishes || []).join(', '),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi tạo đề xuất' });
  }
});

export default router;
