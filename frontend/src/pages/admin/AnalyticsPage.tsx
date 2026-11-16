import React from 'react';
import { BarChart3, TrendingUp, MapPin, Utensils, Car, Footprints, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const AnalyticsPage: React.FC = () => {
  const districtStats = [
    { name: 'Hoàn Kiếm', count: 480, percentage: 38 },
    { name: 'Hai Bà Trưng', count: 320, percentage: 26 },
    { name: 'Ba Đình', count: 210, percentage: 17 },
    { name: 'Đống Đa', count: 140, percentage: 11 },
    { name: 'Cầu Giấy', count: 100, percentage: 8 },
  ];

  const topDishes = [
    { name: 'Phở bò tái lăn (13 Lò Đúc)', searches: 560, avgPrice: '70.000đ' },
    { name: 'Bún chả đặc biệt (24 Lê Văn Hưu)', searches: 430, avgPrice: '55.000đ' },
    { name: 'Bánh mì Thập cẩm Pate (25 Hàng Cá)', searches: 390, avgPrice: '35.000đ' },
    { name: 'Bún đậu mẹt đầy đủ (129 Đại La)', searches: 310, avgPrice: '45.000đ' },
    { name: 'Cà phê trứng nóng (39 Nguyễn Hữu Huân)', searches: 280, avgPrice: '35.000đ' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-card border border-[#E8E2D8] shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#46564E]">Thống kê & Phân tích xu hướng ẩm thực</h2>
            <span className="bg-[#BFE8D5] text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp size={13} /> Dữ liệu trực tiếp
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fm-muted mt-0.5">
            Tổng hợp dữ liệu tìm kiếm, nhu cầu món ăn và thống kê tuyến đường tại Hà Nội.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Chart */}
        <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-fm-text text-sm sm:text-base flex items-center gap-2">
              <MapPin size={16} className="text-emerald-700" /> Khu vực ẩm thực được quan tâm nhất
            </h3>
            <span className="text-xs text-fm-muted">1.250 lượt truy vấn</span>
          </div>

          <div className="space-y-3">
            {districtStats.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-fm-text">
                  <span>Quận {d.name}</span>
                  <span className="font-mono text-emerald-800">{d.count} lượt ({d.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#BFE8D5] h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Mode Breakdown */}
        <div className="bg-white rounded-card shadow-soft border border-[#E8E2D8] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-fm-text text-sm sm:text-base flex items-center gap-2">
              <Car size={16} className="text-blue-600" /> Phân bố phương tiện tìm đường
            </h3>
            <span className="text-xs text-fm-muted">328 route requests</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#BFE8D5]/30 p-4 rounded-btn border border-[#BFE8D5]/50 text-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-xs text-emerald-800">
                <Car size={20} />
              </div>
              <p className="text-2xl font-black text-[#46564E]">72%</p>
              <p className="text-xs font-semibold text-fm-muted mt-0.5">Xe máy / Ô tô</p>
              <p className="text-[11px] text-gray-400 mt-1">236 lượt đề xuất</p>
            </div>

            <div className="bg-[#FFCBAE]/30 p-4 rounded-btn border border-[#FFCBAE]/50 text-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-xs text-orange-800">
                <Footprints size={20} />
              </div>
              <p className="text-2xl font-black text-[#46564E]">28%</p>
              <p className="text-xs font-semibold text-fm-muted mt-0.5">Đi bộ phố cổ</p>
              <p className="text-[11px] text-gray-400 mt-1">92 lượt đề xuất</p>
            </div>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-btn border border-blue-100 text-xs text-blue-900 leading-relaxed">
            Khoảng cách trung bình mỗi lượt tìm đường là <strong>1.85 km</strong>. Đa số người dùng lựa chọn di chuyển tới quán ăn trong bán kính dưới 3km.
          </div>
        </div>
      </div>

      {/* Top Dishes Table */}
      <div className="bg-white rounded-card border border-[#E8E2D8] shadow-soft p-5">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h3 className="font-bold text-fm-text text-sm sm:text-base flex items-center gap-2">
            <Utensils size={16} className="text-amber-600" /> Top 5 món ăn & quán ăn được AI đề xuất nhiều nhất
          </h3>
          <span className="text-xs font-semibold text-emerald-800 bg-[#BFE8D5] px-2.5 py-0.5 rounded-full">
            Độ chính xác cao
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-fm-muted font-bold uppercase text-[11px]">
                <th className="py-2.5 px-4">Tên món & Cơ sở</th>
                <th className="py-2.5 px-4">Lượt người dùng chọn</th>
                <th className="py-2.5 px-4">Mức giá trung bình</th>
                <th className="py-2.5 px-4">Tỷ lệ hài lòng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topDishes.map((dish, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-bold text-fm-text">
                    <span className="w-5 h-5 rounded-full bg-[#FFF9F0] border border-[#E8E2D8] inline-flex items-center justify-center text-xs mr-2 text-fm-muted">
                      {i + 1}
                    </span>
                    {dish.name}
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-800 font-mono">
                    {dish.searches} lượt
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">
                    {dish.avgPrice}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      98% tích cực
                    </span>
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
