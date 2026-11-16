import React from 'react';
import { CheckCircle, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import type { RestaurantMenu } from '../../types';
import { Badge } from '../ui/Badge';

interface MenuItemCardProps {
  menu: RestaurantMenu;
}

const verificationBadge = (status: RestaurantMenu['verification_status']) => {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle size={11} /> Đã xác minh
        </Badge>
      );
    case 'needs_update':
      return (
        <Badge variant="warning" className="gap-1">
          <Clock size={11} /> Cần cập nhật
        </Badge>
      );
    case 'invalid':
      return (
        <Badge variant="error" className="gap-1">
          <ShieldAlert size={11} /> Không hợp lệ
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className="gap-1">
          <AlertCircle size={11} /> Giá tham khảo
        </Badge>
      );
  }
};

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ menu }) => {
  const item = menu.menu_item;

  return (
    <div className="flex items-center justify-between py-3.5 px-3 rounded-btn hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-fm-text text-sm">{item?.name || 'Món ăn'}</p>
          {menu.portion_label && (
            <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {menu.portion_label}
            </span>
          )}
        </div>
        {item?.description && (
          <p className="text-xs text-fm-muted mt-0.5 line-clamp-1">{item.description}</p>
        )}
        {menu.last_verified_at && (
          <p className="text-[10px] text-gray-400 mt-1">
            Xác minh: {menu.last_verified_at}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:block">
          {verificationBadge(menu.verification_status)}
        </div>
        <div className="text-right">
          <span className="font-bold text-fm-text text-sm sm:text-base">
            {new Intl.NumberFormat('vi-VN').format(menu.price)}
          </span>
          <span className="text-xs text-fm-muted ml-0.5">đ</span>
        </div>
      </div>
    </div>
  );
};
