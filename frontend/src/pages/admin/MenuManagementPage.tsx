import React, { useState } from 'react';
import { Plus, CheckCircle, AlertTriangle, Clock, Search, ShieldCheck } from 'lucide-react';
import { MOCK_RESTAURANTS } from '../../services/mockData';
import type { RestaurantMenu } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const MenuManagementPage: React.FC = () => {
  // Aggregate all menus across all restaurants
  const initialMenus: (RestaurantMenu & { restaurant_name: string })[] = MOCK_RESTAURANTS.flatMap(r => 
    (r.menus || []).map(m => ({
      ...m,
      restaurant_name: r.name,
    }))
  );

  const [menus, setMenus] = useState(initialMenus);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = menus.filter(m => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const matchName = m.menu_item?.name.toLowerCase().includes(s);
      const matchRest = m.restaurant_name.toLowerCase().includes(s);
      if (!matchName && !matchRest) return false;
    }
    if (filterStatus !== 'all' && m.verification_status !== filterStatus) {
      return false;
    }
    return true;
  });

  const handleVerify = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
    setMenus(prev => prev.map(m => m.id === id ? { 
      ...m, 
      verification_status: nextStatus,
      last_verified_at: new Date().toISOString().slice(0, 10),
    } : m));
    toast.success(`Đã cập nhật trạng thái món thành: ${nextStatus === 'verified' ? 'Đã xác minh' : 'Chưa xác minh'}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-card border border-[#E8E2D8] shadow-soft">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#46564E]">Quản lý Menu & Bảng giá xác minh</h2>
          <p className="text-xs sm:text-sm text-fm-muted mt-0.5">
            Mỗi mức giá món phải có nguồn xác minh minh bạch trước khi tham gia xếp hạng đề xuất AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-800 bg-[#BFE8D5] px-3 py-1.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={14} /> {menus.filter(m => m.verification_status === 'verified').length} / {menus.length} món đã duyệt
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-card border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Tìm theo tên món hoặc quán ăn..."
            leftIcon={<Search size={15} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'verified', label: 'Đã xác minh' },
            { id: 'unverified', label: 'Chưa xác minh' },
            { id: 'needs_update', label: 'Cần cập nhật' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-btn border transition-all ${
                filterStatus === tab.id
                  ? 'bg-[#BFE8D5] border-[#46564E]/40 text-[#46564E]'
                  : 'bg-white border-[#E8E2D8] text-fm-muted hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-card border border-[#E8E2D8] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200/80 text-fm-muted font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tên món ăn</th>
                <th className="py-3 px-4">Cơ sở quán ăn</th>
                <th className="py-3 px-4">Đơn giá niêm yết</th>
                <th className="py-3 px-4">Trạng thái xác minh</th>
                <th className="py-3 px-4">Ngày xác minh</th>
                <th className="py-3 px-4 text-right">Thao tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((menu) => (
                <tr key={menu.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-fm-text">
                    {menu.menu_item?.name || 'Món ăn'}
                    {menu.portion_label && (
                      <span className="block text-[10px] text-gray-400 font-normal">
                        Quy cách: {menu.portion_label}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-fm-text font-medium">
                    {menu.restaurant_name}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800">
                    {new Intl.NumberFormat('vi-VN').format(menu.price)} đ
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={menu.verification_status === 'verified' ? 'success' : 'neutral'}>
                      {menu.verification_status === 'verified' ? 'Đã xác minh' : 'Giá tham khảo'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                    {menu.last_verified_at || 'Chưa cập nhật'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleVerify(menu.id, menu.verification_status)}
                      className={`text-xs font-bold px-3 py-1 rounded-btn transition-colors ${
                        menu.verification_status === 'verified'
                          ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {menu.verification_status === 'verified' ? 'Hủy duyệt' : 'Xác minh ngay'}
                    </button>
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
