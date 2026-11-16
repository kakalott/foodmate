import React, { useState } from 'react';
import { Database, Plus, CheckCircle, ExternalLink, ShieldAlert, Globe } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

interface DataSourceItem {
  id: string;
  restaurant_name: string;
  source_type: 'admin' | 'google_places' | 'community' | 'user_report';
  source_name: string;
  source_url?: string;
  collected_at: string;
  verification_status: 'verified' | 'unverified' | 'needs_update';
  notes: string;
}

const MOCK_SOURCES: DataSourceItem[] = [
  {
    id: 'src-1',
    restaurant_name: 'Phở Thìn Lò Đúc',
    source_type: 'admin',
    source_name: 'Admin khảo sát trực tiếp tại quán',
    collected_at: '2026-03-10',
    verification_status: 'verified',
    notes: 'Kiểm tra menu tại quầy số 13 Lò Đúc. Giá 70k bát phở tái lăn, quẩy 10k.',
  },
  {
    id: 'src-2',
    restaurant_name: 'Bún chả Hương Liên',
    source_type: 'admin',
    source_name: 'Bảng giá niêm yết tại quán & Fanpage',
    source_url: 'https://facebook.com/bunchahuonglien',
    collected_at: '2026-03-01',
    verification_status: 'verified',
    notes: 'Suất đặc biệt 55k, nem hải sản 35k/chiếc.',
  },
  {
    id: 'src-3',
    restaurant_name: 'Bánh mì 25',
    source_type: 'google_places',
    source_name: 'Google Places API Place Details',
    collected_at: '2026-03-05',
    verification_status: 'verified',
    notes: 'Đối chiếu tọa độ địa lý, số điện thoại và giờ mở cửa.',
  },
  {
    id: 'src-4',
    restaurant_name: 'Cơm tấm Phương Anh',
    source_type: 'user_report',
    source_name: 'Đóng góp từ người dùng FoodMate',
    collected_at: '2026-03-12',
    verification_status: 'needs_update',
    notes: 'Người dùng báo giá sườn bì chả tăng từ 45k lên 50k. Cần Admin gọi điện xác thực.',
  },
];

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState(MOCK_SOURCES);

  const sourceTypeBadge = (type: DataSourceItem['source_type']) => {
    switch (type) {
      case 'admin':
        return <Badge variant="success">Admin nhập</Badge>;
      case 'google_places':
        return <Badge variant="info">Google Places</Badge>;
      case 'user_report':
        return <Badge variant="warning">Người dùng</Badge>;
      default:
        return <Badge variant="neutral">Cộng đồng</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-card border border-[#E8E2D8] shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#46564E]">Quản lý Nguồn dữ liệu (Data Sources)</h2>
            <span className="bg-[#BFE8D5] text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Chính sách minh bạch
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fm-muted mt-0.5">
            Mọi dữ liệu giá và địa điểm đều được gắn kèm nguồn thu thập, thời điểm và ghi chú xác thực.
          </p>
        </div>

        <Button
          leftIcon={<Plus size={15} />}
          onClick={() => toast.success('Mở form ghi nhận nguồn dữ liệu mới')}
        >
          Ghi nhận nguồn mới
        </Button>
      </div>

      <div className="bg-white rounded-card border border-[#E8E2D8] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200/80 text-fm-muted font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Quán ăn áp dụng</th>
                <th className="py-3 px-4">Phân loại nguồn</th>
                <th className="py-3 px-4">Tên nguồn / Kênh thu thập</th>
                <th className="py-3 px-4">Thời điểm</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ghi chú xác thực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-fm-text">
                    {src.restaurant_name}
                  </td>
                  <td className="py-3.5 px-4">
                    {sourceTypeBadge(src.source_type)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-fm-text">
                    {src.source_name}
                    {src.source_url && (
                      <a
                        href={src.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 ml-1.5 hover:underline"
                      >
                        <ExternalLink size={11} /> Link
                      </a>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                    {src.collected_at}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={src.verification_status === 'verified' ? 'success' : 'warning'}>
                      {src.verification_status === 'verified' ? 'Đã thẩm định' : 'Cần kiểm tra'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-fm-muted text-[11px] max-w-xs leading-relaxed">
                    {src.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
