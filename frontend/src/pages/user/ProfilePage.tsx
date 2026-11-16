import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { PreferenceSelector } from '../../components/public/PreferenceSelector';
import { BudgetSelector } from '../../components/public/BudgetSelector';
import { ShieldCheck, UserCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#46564E] mb-6">
        Hồ sơ cá nhân & Cài đặt ẩm thực
      </h1>

      <Card header="Thông tin tài khoản" className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#BFE8D5] rounded-2xl flex items-center justify-center text-2xl font-black text-[#46564E] shadow-xs">
            {(profile?.display_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-fm-text text-lg">
              {profile?.display_name || 'Người dùng ẩm thực'}
            </p>
            <p className="text-fm-muted text-xs sm:text-sm">{user?.email || 'user@foodmate.ai'}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {profile?.role === 'admin' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#FFE6A7] text-amber-900 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Quản trị viên (Admin)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#BFE8D5] text-emerald-800 px-2.5 py-0.5 rounded-full">
                  <UserCheck size={12} /> Thành viên FoodMate
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card header="Sở thích & Tiêu chí ăn uống mặc định" className="mb-6">
        <div className="space-y-6">
          <BudgetSelector />
          <div className="border-t border-gray-100 pt-5">
            <PreferenceSelector />
          </div>
        </div>
      </Card>
    </div>
  );
};
