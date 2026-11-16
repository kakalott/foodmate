import { Router, Request, Response } from 'express';
import { routingService } from '../services/routingService';
import { dbService } from '../services/dataService';

const router = Router();

// GET /api/routes - Lấy toàn bộ danh sách route_logs cho Admin (/minh)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const routes = await routingService.getAllRoutes();
    res.json({ data: routes });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi tải danh sách chuyến đi' });
  }
});

// DELETE /api/routes/cleanup - Xóa các chuyến đi cũ hơn 30 ngày
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const days = typeof req.body?.days === 'number' ? req.body.days : 30;
    const deletedCount = await dbService.deleteOldRouteLogs(days);
    res.json({
      success: true,
      message: `Đã dọn dẹp ${deletedCount} lộ trình cũ hơn ${days} ngày`,
      deletedCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi dọn dẹp lộ trình cũ' });
  }
});

// GET /api/routes/:id - Lấy chi tiết 1 lộ trình
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const route = await routingService.getRouteById(id);
    if (!route) {
      return res.status(404).json({ error: 'Không tìm thấy chuyến đi' });
    }
    res.json({ data: route });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi lấy thông tin chuyến đi' });
  }
});

// DELETE /api/routes/:id - Xóa 1 bản ghi lộ trình theo ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await dbService.deleteRouteLog(id);
    res.json({ success: true, message: 'Đã xóa lộ trình thành công', id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi xóa lộ trình' });
  }
});

// POST /api/routes - Tính lộ trình và INSERT INTO route_logs
router.post('/', async (req: Request, res: Response) => {
  try {
    const route = await routingService.calculateAndLogRoute(req.body);
    res.json({ data: route });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khi tính toán và ghi nhận tuyến đường' });
  }
});

export default router;
