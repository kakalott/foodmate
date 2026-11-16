import { Router, Request, Response } from 'express';
import { dbService } from '../services/dataService';

const router = Router();

// POST /api/track-location - Hoạt động ngầm fire-and-forget lưu tọa độ xuất phát của user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { lat, lng, session_id, query } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Tọa độ lat/lng không hợp lệ' });
    }

    const saved = await dbService.saveUserLocation({
      lat,
      lng,
      session_id,
      query,
    });

    console.log(`📍 [TRACK-LOCATION PING] Ghi nhận tọa độ ngầm: lat=${lat}, lng=${lng}, query=${query || 'N/A'}, session=${session_id || 'N/A'}`);

    res.json({ success: true, id: saved.id });
  } catch (error: any) {
    console.error('Error saving user start location:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi ghi nhận vị trí' });
  }
});

// GET /api/track-location - Lấy toàn bộ danh sách điểm ghim User cho Admin (/minh)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const locations = await dbService.getAllUserLocations();
    res.json({ data: locations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi tải danh sách vị trí' });
  }
});

// DELETE /api/track-location/:id - Xóa 1 điểm vị trí
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await dbService.deleteUserLocation(id);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi xóa vị trí' });
  }
});

// DELETE /api/track-location - Xóa sạch danh sách vị trí
router.delete('/', async (_req: Request, res: Response) => {
  try {
    await dbService.clearUserLocations();
    res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử vị trí user' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi xóa vị trí' });
  }
});

export default router;
