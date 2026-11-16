import React, { useState } from 'react';
import { CheckSquare, Check, X, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

interface QueueItem {
  id: string;
  restaurant_name: string;
  item_name: string;
  submitted_price: number;
  old_price?: number;
  submitted_by: string;
  submitted_at: string;
  evidence_note: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MOCK_QUEUE: QueueItem[] = [
  {
    id: 'queue-1',
    restaurant_name: 'Cơm tấm Phương Anh',
    item_name: 'Cơm tấm sườn bì chả trứng',
    submitted_price: 50000,
    old_price: 45000,
    submitted_by: 'user_nguyenvan@gmail.com',
    submitted_at: '2026-03-15 14:20',
    evidence_note: 'Quán vừa cập nhật bảng giá tuần trước, sườn nướng mật ong rất ngon.',
    status: 'pending',
  },
  {
    id: 'queue-2',
    restaurant_name: 'Bánh mì 25',
    item_name: 'Bánh mì Bò xào phô mai',
    submitted_price: 40000,
    old_price: 38000,
    submitted_by: 'khach_hanoi_88@gmail.com',
    submitted_at: '2026-03-14 09:15',
    evidence_note: 'Menu tại quầy ghi rõ 40k/chiếc kèm sốt phô mai.',
    status: 'pending',
  },
  {
    id: 'queue-3',
    restaurant_name: 'Bún đậu Mẹt Cây Bàng',
    item_name: 'Chả cốm gọi thêm',
    submitted_price: 15000,
    submitted_by: 'admin@foodmate.ai',
    submitted_at: '2026-03-12 18:00',
    evidence_note: 'Bổ sung món phụ gọi thêm vào thực đơn.',
    status: 'pending',
  },
];

export const VerificationQueuePage: React.FC = () => {
  const [queue, setQueue] = useState(MOCK_QUEUE);

  const handleApprove = (id: string, name: string) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
    toast.success(`Đã phê duyệt giá mới cho món "${name}" và đưa vào tập đề xuất AI!`);
  };

  const handleReject = (id: string, name: string) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
    toast.error(`Đã từ chối cập nhật cho "${name}".`);
  };

  const pendingItems = queue.filter(q => q.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-card border border-[#E8E2D8] shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#46564E]">Hàng chờ xác thực thực đơn & giá</h2>
            <span className="bg-[#FFE6A7] text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pendingItems.length} yêu cầu cần duyệt
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fm-muted mt-0.5">
            Dữ liệu đóng góp phải được Admin thẩm định trước khi tham gia hệ thống xếp hạng của Gemini AI.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {queue.map((item) => (
          <div
            key={item.id}
            className={`p-4 sm:p-5 rounded-card border transition-all ${
              item.status === 'approved'
                ? 'bg-emerald-50/50 border-emerald-200 opacity-70'
                : item.status === 'rejected'
                ? 'bg-red-50/50 border-red-200 opacity-60'
                : 'bg-white border-[#E8E2D8] shadow-soft'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-fm-text text-base">{item.item_name}</span>
                  <span className="text-xs text-fm-muted">tại</span>
                  <span className="font-semibold text-emerald-800 text-xs bg-[#BFE8D5]/60 px-2.5 py-0.5 rounded-full">
                    {item.restaurant_name}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-fm-muted flex-wrap">
                  <span>Giá đề xuất: <strong className="text-emerald-700">{new Intl.NumberFormat('vi-VN').format(item.submitted_price)}đ</strong></span>
                  {item.old_price && (
                    <span className="text-gray-400 line-through">
                      Giá cũ: {new Intl.NumberFormat('vi-VN').format(item.old_price)}đ
                    </span>
                  )}
                  <span>Người gửi: <span className="font-mono">{item.submitted_by}</span></span>
                  <span className="font-mono text-gray-400">{item.submitted_at}</span>
                </div>

                <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-btn mt-2 border border-gray-100">
                  <strong>Ghi chú kiểm chứng:</strong> {item.evidence_note}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {item.status === 'pending' ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item.id, item.item_name)}
                      leftIcon={<Check size={14} />}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Duyệt & Lưu DB
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(item.id, item.item_name)}
                      leftIcon={<X size={14} />}
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Từ chối
                    </Button>
                  </>
                ) : (
                  <Badge variant={item.status === 'approved' ? 'success' : 'error'}>
                    {item.status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
