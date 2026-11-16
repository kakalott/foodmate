import React from 'react';
import { UtensilsCrossed, FileText, CheckSquare, Flag, Map, TrendingUp, Sparkles, Navigation, ArrowRight } from 'lucide-react';
import { StatsCard } from '../../components/admin/StatsCard';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsApi } from '../../services/api';
import { MOCK_ANALYTICS } from '../../services/mockData';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      try {
        const res = await adminAnalyticsApi.get();
        if (res) return res;
      } catch {
        // Fallback
      }
      return MOCK_ANALYTICS;
    },
    initialData: MOCK_ANALYTICS,
    staleTime: 60000,
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-card border border-[#E8E2D8] shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#46564E]">
              Tổng quan hệ thống FoodMate
            </h1>
            <span className="bg-[#BFE8D5] text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-full">
              Hà Nội Pilot v1.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fm-muted">
            Theo dõi dữ liệu thực đơn bình dân, lượt đề xuất món ngon và các yêu cầu tìm đường được ghi nhận.
          </p>
        </div>

        <Link
          to="/admin/routes"
          className="inline-flex items-center gap-2 bg-[#BFE8D5] hover:bg-[#A7DECA] text-[#46564E] font-bold px-4 py-2.5 rounded-btn text-xs transition-colors shadow-xs shrink-0"
        >
          <Navigation size={15} /> Mở Route Explorer <ArrowRight size={14} />
        </Link>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<UtensilsCrossed size={22} className="text-emerald-700" />}
          value={analytics?.active_restaurants ?? 42}
          label="Quán đang hoạt động"
          color="green"
          trend={{ value: 8, label: 'Tháng này' }}
        />
        <StatsCard
          icon={<FileText size={22} className="text-amber-700" />}
          value={analytics?.verified_items ?? 142}
          label="Món ăn đã xác minh giá"
          color="orange"
          trend={{ value: 15, label: 'Đã duyệt' }}
        />
        <StatsCard
          icon={<CheckSquare size={22} className="text-purple-700" />}
          value={analytics?.pending_verifications ?? 8}
          label="Hàng chờ xác thực"
          color="purple"
        />
        <StatsCard
          icon={<Flag size={22} className="text-red-700" />}
          value={analytics?.total_reports ?? 5}
          label="Báo cáo sai dữ liệu"
          color="blue"
        />
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<Map size={22} className="text-blue-700" />}
          value={analytics?.total_routes ?? 328}
          label="Tuyến đường đã đề xuất"
          color="green"
        />
        <StatsCard
          icon={<TrendingUp size={22} className="text-emerald-700" />}
          value={analytics?.total_recommendations ?? 1250}
          label="Lượt đề xuất món AI"
          color="orange"
        />
        <StatsCard
          icon={<UtensilsCrossed size={22} className="text-indigo-700" />}
          value={analytics?.total_restaurants ?? 48}
          label="Tổng cơ sở ẩm thực"
          color="blue"
        />
        <StatsCard
          icon={<Sparkles size={22} className="text-pink-700" />}
          value={analytics?.total_menu_items ?? 186}
          label="Tổng món ăn trong kho"
          color="purple"
        />
      </div>

      {/* Two Column Section: Recent Activity & Route Explorer Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admin Audit Activity */}
        <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-5">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h3 className="font-bold text-[#46564E] text-sm sm:text-base">Nhật ký hoạt động xác minh gần đây</h3>
            <span className="text-xs text-fm-muted">Audit Log</span>
          </div>
          <div className="space-y-3">
            {[
              { time: '10 phút trước', action: 'Xác minh giá', target: 'Phở Thìn Lò Đúc (Phở tái lăn: 70.000đ)' },
              { time: '35 phút trước', action: 'Duyệt báo cáo', target: 'Cập nhật giờ mở cửa Bún chả Hương Liên' },
              { time: '2 giờ trước', action: 'Thêm quán mới', target: 'Cơm tấm Phương Anh — 119 Phùng Hưng' },
              { time: 'Hôm qua', action: 'Route Log Audit', target: 'Kiểm tra tuyến đường session_hanoi_8f29c1' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-2" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-fm-text">{item.action}</span>
                    <span className="text-[11px] text-gray-400 font-mono">{item.time}</span>
                  </div>
                  <p className="text-xs text-fm-muted mt-0.5 truncate">{item.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Explorer Highlight Card */}
        <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Navigation size={18} />
              </span>
              <div>
                <h3 className="font-bold text-[#46564E] text-base">Route Explorer — Trung tâm kiểm tra</h3>
                <p className="text-xs text-fm-muted">Bản đồ kiểm tra các tuyến đường backend nhận từ Routes API</p>
              </div>
            </div>

            <div className="bg-[#FFF9F0] p-4 rounded-btn border border-[#E8E2D8] text-xs text-[#46564E] leading-relaxed my-3 space-y-2">
              <p>• <strong>Bố cục chuẩn:</strong> Cột danh sách bên trái, bản đồ lớn ở trung tâm, panel chi tiết tọa độ bên phải.</p>
              <p>• <strong>Quy chuẩn bảo mật:</strong> Không thu thập GPS trace thực tế; legend ghi chú rõ &quot;Tuyến đường được đề xuất từ API&quot;.</p>
              <p>• <strong>Hỗ trợ:</strong> Xem khoảng cách, ETA, polyline, lọc theo phương tiện và xuất file CSV an toàn.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/admin/routes" className="block">
              <button className="w-full bg-[#BFE8D5] hover:bg-[#A7DECA] text-[#46564E] font-bold py-2.5 px-4 rounded-btn text-xs transition-colors flex items-center justify-center gap-2 shadow-xs">
                Mở giao diện Route Explorer ngay <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
