import { Router, Request, Response } from 'express';
import { geminiService } from '../services/geminiService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const recs = await geminiService.getRecommendations(req.body);
    res.json({ data: recs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi tạo đề xuất' });
  }
});

export default router;
