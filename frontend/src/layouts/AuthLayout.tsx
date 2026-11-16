import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FoodMateToaster } from '../components/ui/Toast';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-4 py-12">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-fm-muted hover:text-fm-text mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Trở về trang chủ
      </Link>

      {/* Main card */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>

      <p className="text-[11px] text-gray-400 mt-8 text-center">
        © {new Date().getFullYear()} FoodMate — Hệ thống gợi ý ẩm thực và chỉ đường an toàn.
      </p>

      <FoodMateToaster />
    </div>
  );
};
