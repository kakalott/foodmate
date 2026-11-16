import { Router, Request, Response } from 'express';
import { dbService } from '../services/dataService';

const router = Router();

// GET /api/config - Lấy cấu hình hệ thống hiện tại
router.get('/', async (_req: Request, res: Response) => {
  try {
    const configs = await dbService.getAllConfigs();
    const googleKey = configs['google_maps_key'] || process.env.GOOGLE_MAPS_KEY || '';
    const geminiKey = configs['gemini_api_key'] || process.env.GEMINI_API_KEY || '';

    res.json({
      data: {
        google_maps_key: googleKey,
        gemini_api_key: geminiKey,
        has_google_key: !!googleKey && !googleKey.includes('your_'),
        has_gemini_key: !!geminiKey && !geminiKey.includes('your_'),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi tải cấu hình hệ thống' });
  }
});

// POST /api/config - Cập nhật API Keys vào Database
router.post('/', async (req: Request, res: Response) => {
  try {
    const { google_maps_key, gemini_api_key } = req.body;

    if (typeof google_maps_key === 'string') {
      await dbService.setConfig('google_maps_key', google_maps_key.trim());
    }

    if (typeof gemini_api_key === 'string') {
      await dbService.setConfig('gemini_api_key', gemini_api_key.trim());
    }

    res.json({
      success: true,
      message: 'Đã lưu cấu hình API Keys vào Database thành công!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi lưu cấu hình API' });
  }
});

export default router;
