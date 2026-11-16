import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E8E2D8] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-fm-text">
            <span className="text-xl">🍜</span>
            <span className="text-sm font-bold text-[#46564E]">FoodMate — Gợi ý món ngon & quán ăn bình dân</span>
          </div>

          <div className="flex gap-6 text-xs font-medium text-fm-muted">
            <Link to="/" className="hover:text-fm-text transition-colors">Trang chủ</Link>
            <Link to="/recommend" className="hover:text-fm-text transition-colors">Hôm nay ăn gì?</Link>
          </div>

          <p className="text-xs text-fm-muted flex items-center gap-1.5">
            Dành cho người yêu ẩm thực <Heart size={13} className="text-red-400 fill-current" /> tại Hà Nội
          </p>
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
          <p>© {new Date().getFullYear()} FoodMate — Người bạn đồng hành ẩm thực Hà Nội.</p>
          <p className="italic">Chúc bạn luôn có những bữa ăn ngon miệng và ấm cúng!</p>
        </div>
      </div>
    </footer>
  );
};
