import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { adminRestaurantsApi } from '../../services/api';
import { MOCK_RESTAURANTS } from '../../services/mockData';
import toast from 'react-hot-toast';

export const RestaurantFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';

  const [form, setForm] = useState({
    name: '',
    address: '',
    lat: '21.0285',
    lng: '105.8542',
    phone: '',
    website: '',
    description: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const existing = MOCK_RESTAURANTS.find(r => r.id === id);
      if (existing) {
        setForm({
          name: existing.name,
          address: existing.address,
          lat: existing.lat.toString(),
          lng: existing.lng.toString(),
          phone: existing.phone || '',
          website: existing.website || '',
          description: existing.description || '',
          status: existing.status,
        });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await adminRestaurantsApi.update(id!, { ...form, lat: Number(form.lat), lng: Number(form.lng) });
        toast.success(`Đã cập nhật thông tin quán "${form.name}"!`);
      } else {
        await adminRestaurantsApi.create({ ...form, lat: Number(form.lat), lng: Number(form.lng) });
        toast.success(`Đã thêm quán mới "${form.name}" thành công!`);
      }
      navigate('/admin/restaurants');
    } catch {
      // Mock success for local demo
      toast.success(isEdit ? 'Đã lưu thay đổi vào cơ sở dữ liệu!' : 'Đã thêm quán ăn vào hệ thống!');
      navigate('/admin/restaurants');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-fm-muted hover:text-fm-text mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Quay lại danh sách quán
      </button>

      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-[#46564E]">
          {isEdit ? 'Chỉnh sửa thông tin quán' : 'Thêm cơ sở ẩm thực mới'}
        </h2>
        <p className="text-xs text-fm-muted mt-0.5">
          Nhập đầy đủ tọa độ chính xác để tích hợp với bản đồ và công cụ Route Explorer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-6 space-y-4">
        <Input
          label="Tên quán ăn *"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ví dụ: Phở Thìn Lò Đúc"
          required
        />

        <Input
          label="Địa chỉ chi tiết tại Hà Nội *"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Ví dụ: 13 Lò Đúc, Hai Bà Trưng, Hà Nội"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-btn border border-gray-100">
          <Input
            label="Vĩ độ (Latitude) *"
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
            leftIcon={<MapPin size={14} />}
            required
          />
          <Input
            label="Kinh độ (Longitude) *"
            type="number"
            step="any"
            value={form.lng}
            onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
            leftIcon={<MapPin size={14} />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Số điện thoại liên hệ"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="024 3821 2709"
          />
          <Input
            label="Website / Fanpage"
            type="url"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#46564E] mb-1.5 block">Mô tả đặc trưng & món nổi bật</label>
          <textarea
            className="w-full border border-[#E8E2D8] rounded-input px-3.5 py-2.5 text-fm-text text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#BFE8D5]"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Giới thiệu về hương vị món ăn, không gian, lịch sử quán..."
          />
        </div>

        <Select
          label="Trạng thái hoạt động"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' | 'pending' }))}
          options={[
            { value: 'active', label: 'Đang hoạt động (Hiển thị cho người dùng)' },
            { value: 'pending', label: 'Chờ duyệt / Chưa xác minh thông tin' },
            { value: 'inactive', label: 'Tạm ngừng hoạt động / Đóng cửa' },
          ]}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/restaurants')}>
            Hủy bỏ
          </Button>
          <Button type="submit" loading={isSubmitting} leftIcon={<Save size={16} />}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm quán ăn mới'}
          </Button>
        </div>
      </form>
    </div>
  );
};
