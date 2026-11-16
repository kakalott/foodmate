import React, { useState } from 'react';
import { Save, Terminal, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const AISettingsPage: React.FC = () => {
  const [model, setModel] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState('0.4');
  const [defaultBudgetThreshold, setDefaultBudgetThreshold] = useState('100000');
  const [systemPrompt, setSystemPrompt] = useState(
`Bạn là FoodMate — người bạn đồng hành ẩm thực thân thiện tại Hà Nội.
QUY TẮC BẮT BUỘC:
1. Xưng hô thân thiện bằng "mình" và "bạn", hoặc "FoodMate" và "bạn". Tuyệt đối không tự xưng "Tôi là AI...".
2. Luôn ưu tiên đề xuất các quán có rating (số sao) cao nhất nằm ở đầu danh sách trả về.
3. Chỉ gợi ý và sắp xếp các quán/món ăn từ danh sách dữ liệu thực tế đã được xác minh.
4. Tuyệt đối KHÔNG tự bịa tên quán, giá, menu, địa chỉ, giờ mở cửa hay số điện thoại.
5. Khi thời tiết se lạnh hoặc mưa, ưu tiên món nóng như phở bò tái lăn, bún chả nướng than hoa, lẩu nóng.
6. Khi thời tiết nắng nóng, ưu tiên món thanh mát như bún đậu, bánh mì kẹp, chè, cà phê trứng hoặc nước giải khát.
7. Giữ phong cách Cute Minimal, ấm áp, súc tích và sử dụng tiếng Việt tự nhiên, giàu cảm xúc.`
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Đã lưu cấu hình System Prompt & tham số thành công!');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-card border border-[#E8E2D8] shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#46564E]">Cấu hình Tư vấn & System Prompt</h2>
            <span className="bg-[#BFE8D5] text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> Ưu tiên Rating cao
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fm-muted mt-0.5">
            Quản trị tiêu chí lọc món, ngôn ngữ giao tiếp thân thiện và sắp xếp điểm đánh giá.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-fm-text mb-1.5 block">Mô hình xử lý</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-btn border border-[#E8E2D8] bg-white font-mono"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Nhanh & Tối ưu)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Suy luận sâu)</option>
              <option value="mock-grounded">FoodMate Local Engine</option>
            </select>
          </div>

          <Input
            label="Nhiệt độ sáng tạo (Temperature)"
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="text-xs font-mono"
          />

          <Input
            label="Ngưỡng ngân sách bình dân mặc định (VND)"
            type="number"
            step="5000"
            value={defaultBudgetThreshold}
            onChange={(e) => setDefaultBudgetThreshold(e.target.value)}
            className="text-xs font-mono"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-fm-text flex items-center gap-1.5">
              <Terminal size={14} className="text-emerald-700" />
              <span>System Prompt (Lời nhắc hệ thống)</span>
            </label>
            <span className="text-[11px] text-gray-400">Tối ưu cho văn phong người thật</span>
          </div>
          <textarea
            className="w-full border border-[#E8E2D8] rounded-input p-3.5 text-xs text-[#46564E] font-mono leading-relaxed bg-[#FFF9F0]/50 resize-none focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
            rows={9}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-[11px] text-fm-muted">
            Ưu tiên quán nhiều sao và loại bỏ các từ ngữ xưng hô máy móc.
          </p>
          <Button type="submit" loading={isSaving} leftIcon={<Save size={15} />}>
            Lưu cấu hình
          </Button>
        </div>
      </form>
    </div>
  );
};
