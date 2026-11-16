import React from 'react';
import { History, Calendar, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { MOCK_RECOMMENDATIONS } from '../../services/mockData';
import { Link } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#46564E]">Lịch sử gợi ý món ăn</h1>
        <p className="text-xs sm:text-sm text-fm-muted mt-1">Các phiên đề xuất AI đã tạo cho bạn dựa trên thời tiết và ngân sách.</p>
      </div>

      <div className="space-y-4">
        {MOCK_RECOMMENDATIONS.map((rec, i) => (
          <div key={i} className="bg-white p-5 rounded-card border border-[#E8E2D8] shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-[#BFE8D5] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={11} /> Đề xuất {i + 1}
                </span>
                <span className="text-xs text-gray-400 font-mono">16/03/2026</span>
              </div>
              <h3 className="font-bold text-[#46564E] text-base">{rec.restaurant.name}</h3>
              <p className="text-xs text-fm-muted line-clamp-1">{rec.explanation}</p>
            </div>

            <Link
              to={`/restaurants/${rec.restaurant.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-[#FFF9F0] border border-[#E8E2D8] px-3.5 py-2 rounded-btn hover:bg-[#BFE8D5] transition-colors shrink-0"
            >
              Xem lại quán <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
