import React from 'react';
import { LogOut, User, Globe } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Dropdown } from '../ui/Dropdown';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const { user, profile, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E8E2D8] flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <h1 className="text-base sm:text-lg font-bold text-fm-text">{title}</h1>
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-fm-muted hover:text-fm-text bg-gray-50 px-2.5 py-1 rounded-md transition-colors"
        >
          <Globe size={13} /> Xem trang chủ
        </Link>
      </div>

      <Dropdown
        align="right"
        trigger={
          <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-btn hover:bg-gray-50 transition-colors text-xs text-fm-text border border-gray-100">
            <div className="w-8 h-8 bg-[#BFE8D5] text-[#46564E] rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
              {(profile?.display_name || user?.email || 'A')[0].toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-semibold leading-tight">{profile?.display_name || 'Admin'}</p>
              <p className="text-[11px] text-fm-muted">{user?.email || 'admin@foodmate.ai'}</p>
            </div>
          </button>
        }
        items={[
          { label: 'Hồ sơ người dùng', icon: <User size={14} />, onClick: () => window.location.href = '/profile' },
          { label: 'Đăng xuất', icon: <LogOut size={14} />, danger: true, divider: true, onClick: logout },
        ]}
      />
    </header>
  );
};
