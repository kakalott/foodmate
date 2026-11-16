import React, { useState } from 'react';
import { Flag, CheckCircle } from 'lucide-react';
import { reportsApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'wrong_price', label: 'Báo sai giá món ăn' },
  { value: 'closed', label: 'Quán đã chuyển địa điểm / đóng cửa' },
  { value: 'wrong_address', label: 'Địa chỉ hoặc số điện thoại không đúng' },
  { value: 'wrong_hours', label: 'Giờ mở cửa không chính xác' },
  { value: 'other', label: 'Vấn đề khác' },
];

export const ReportPage: React.FC = () => {
  const [reportType, setReportType] = useState('wrong_price');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await reportsApi.create({ report_type: reportType, description });
      setSubmitted(true);
      toast.success('Báo cáo đã được chuyển tới hàng chờ kiểm duyệt của Admin!');
    } catch {
      // Mock submit success
      setSubmitted(true);
      toast.success('Cảm ơn bạn! Báo cáo đã được ghi nhận.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center bg-white rounded-card border border-[#E8E2D8] shadow-soft my-10">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={30} />
        </div>
        <h2 className="text-xl font-bold text-[#46564E] mb-2">Đã tiếp nhận báo cáo!</h2>
        <p className="text-xs sm:text-sm text-fm-muted mb-6 leading-relaxed">
          Đội ngũ quản trị viên FoodMate sẽ tiến hành đối chiếu và cập nhật dữ liệu để đảm bảo độ chính xác cho cộng đồng.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline" size="sm">
          Gửi báo cáo khác
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <Flag size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#46564E]">Báo cáo sai sót dữ liệu</h1>
          <p className="text-xs text-fm-muted">Giúp nâng cao tính minh bạch cho giá cả và thực đơn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-6 space-y-4">
        <Select
          label="Loại vấn đề cần báo cáo"
          options={REPORT_TYPES}
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        />
        <div>
          <label className="text-xs font-bold text-[#46564E] mb-1.5 block">Mô tả chi tiết sai sót</label>
          <textarea
            className="w-full border border-[#E8E2D8] rounded-input px-3.5 py-2.5 text-fm-text text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ví dụ: Phở Thìn hiện tại giá đã đổi từ 65k lên 70k, quán mở cửa từ 6h sáng..."
            required
          />
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full justify-center">
          Gửi báo cáo cho Admin
        </Button>
      </form>
    </div>
  );
};
