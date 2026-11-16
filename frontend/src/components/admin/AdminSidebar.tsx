import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, FileText, Database,
  CheckSquare, Bot, BarChart3, Map, Flag, Users, ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/restaurants', label: 'Quản lý quán ăn', icon: UtensilsCrossed },
  { to: '/admin/menus', label: 'Menu & Bảng giá', icon: FileText },
  { to: '/admin/sources', label: 'Nguồn dữ liệu', icon: Database },
  { to: '/admin/verification', label: 'Hàng chờ xác thực', icon: CheckSquare },
  { to: '/admin/ai-settings', label: 'Cấu hình AI & Prompt', icon: Bot },
  { to: '/admin/analytics', label: 'Thống kê & Báo cáo', icon: BarChart3 },
  { to: '/admin/routes', label: 'Route Explorer', icon: Map },
  { to: '/admin/reports', label: 'Xử lý báo sai', icon: Flag },
  { to: '/admin/users', label: 'Quản trị viên (Users)', icon: Users },
];

export const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={[
        'fixed left-0 top-0 h-full bg-white border-r border-[#E8E2D8] shadow-sm z-40',
        'flex flex-col transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E8E2D8] bg-[#FFF9F0]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xl">🍜</span>
            <span className="font-extrabold text-[#46564E] text-base tracking-tight">FoodMate <span className="text-emerald-700 bg-[#BFE8D5] px-1.5 py-0.5 rounded-md text-xs font-bold">Admin</span></span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-fm-muted hover:text-fm-text transition-colors mx-auto"
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-btn transition-all text-xs font-medium',
                isActive
                  ? 'bg-[#BFE8D5] text-[#46564E] font-semibold shadow-xs'
                  : 'text-[#46564E]/70 hover:bg-[#FFF9F0] hover:text-[#46564E]',
              ].join(' ')
            }
          >
            <item.icon size={17} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Admin badge */}
      {!collapsed && (
        <div className="p-3 border-t border-[#E8E2D8] bg-gray-50/50">
          <p className="text-[11px] text-fm-muted text-center">FoodMate Management Portal</p>
        </div>
      )}
    </aside>
  );
};
