import { Router, Request, Response } from 'express';
import { geminiService } from '../services/geminiService';

const router = Router();

// POST /api/route-fact
// Nhận { restaurant_name, dish_name } (hoặc textbox_value)
// Gọi Gemini tạo fact siêu ngắn (dưới 25 chữ) tạo hứng khởi trên đường đi
router.post('/', async (req: Request, res: Response) => {
  try {
    const { restaurant_name, dish_name, textbox_value } = req.body;
    const venueName = restaurant_name || 'quán ăn';
    const dish = dish_name || textbox_value || 'món ngon';

    res.json({ route_fact: `Chúc bạn ngon miệng khi thưởng thức ${dish} tại ${venueName}!` });
  } catch (error: any) {
    console.error('Error generating route fact:', error);
    res.json({ route_fact: 'Món ăn ngon nhất khi thưởng thức lúc còn nóng sốt và chia sẻ cùng bạn bè!' });
  }
});

export default router;
