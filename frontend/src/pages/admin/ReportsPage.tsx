import React, { useState } from 'react';
import { Flag, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

interface AdminReportItem {
  id: string;
  restaurant_name: string;
  report_type: string;
  description: string;
  created_at: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

const MOCK_REPORTS: AdminReportItem[] = [
  {
    id: 'rep-1',
    restaurant_name: 'Bún chả Hương Liên',
    report_type: 'Giờ mở cửa',
    description: 'Chủ nhật quán mở cửa sớm từ 7h30 sáng chứ không phải 8h00.',
    created_at: '2026-03-15 16:30',
    status: 'pending',
  },
  {
    id: 'rep-2',
    restaurant_name: 'Phở Thìn Lò Đúc',
    report_type: 'Giá cả',
    description: 'Trứng gà chần lòng đào hiện tại là 10k/quả, xác nhận đúng giá.',
    created_at: '2026-03-14 11:20',
    status: 'resolved',
  },
  {
    id: 'rep-3',
    restaurant_name: 'Bún đậu Mẹt Cây Bàng',
    report_type: 'Địa chỉ',
    description: 'Quán có thêm ngõ đi vào bên cạnh số 129 Đại La, dễ tìm hơn.',
    created_at: '2026-03-13 18:45',
    status: 'pending',
  },
];

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState(MOCK_REPORTS);

  const handleResolve = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    toast.success('Đã cập nhật trạng thái: Đã xử lý & chuẩn hóa dữ liệu.');
  };

  const handleDismiss = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
    toast.error('Đã bỏ qua báo cáo này.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-card border border-[#E8E2D8] shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#46564E]">Xử lý Báo cáo sai sót từ cộng đồng</h2>
            <span className="bg-[#FFE6A7] text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {reports.filter(r => r.status === 'pending').length} báo cáo chờ xử lý
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fm-muted mt-0.5">
            Phản hồi từ người dùng giúp ban quản trị cập nhật giờ mở cửa, giá thực tế và tình trạng quán.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`p-4 sm:p-5 rounded-card border transition-all ${
              report.status === 'resolved'
                ? 'bg-emerald-50/40 border-emerald-200'
                : report.status === 'dismissed'
                ? 'bg-gray-50/50 border-gray-200 opacity-60'
                : 'bg-white border-[#E8E2D8] shadow-soft'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{report.report_type}</Badge>
                  <span className="font-bold text-fm-text text-base">{report.restaurant_name}</span>
                </div>
                <p className="text-xs text-fm-text mt-1.5 leading-relaxed bg-[#FFF9F0] p-2.5 rounded-btn border border-[#E8E2D8]">
                  {report.description}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">Ghi nhận lúc: {report.created_at}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {report.status === 'pending' ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleResolve(report.id)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Xác nhận & Cập nhật
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(report.id)}
                      className="text-xs"
                    >
                      Bỏ qua
                    </Button>
                  </>
                ) : (
                  <Badge variant={report.status === 'resolved' ? 'success' : 'neutral'}>
                    {report.status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua'}
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
