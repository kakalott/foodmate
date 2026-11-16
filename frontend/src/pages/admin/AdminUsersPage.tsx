import React, { useState } from 'react';
import { Users, ShieldCheck, UserCheck, Key, Lock } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

interface UserItem {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  created_at: string;
}

const MOCK_USERS: UserItem[] = [
  {
    id: 'user-1',
    email: 'admin@foodmate.ai',
    display_name: 'Quản trị viên FoodMate',
    role: 'admin',
    status: 'active',
    created_at: '2026-01-01',
  },
  {
    id: 'user-2',
    email: 'moderator@foodmate.ai',
    display_name: 'Kiểm duyệt viên Hà Nội',
    role: 'admin',
    status: 'active',
    created_at: '2026-02-10',
  },
  {
    id: 'user-3',
    email: 'user@foodmate.ai',
    display_name: 'Nguyễn Văn Ẩm Thực',
    role: 'user',
    status: 'active',
    created_at: '2026-03-01',
  },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState(MOCK_USERS);

  const handleToggleRole = (id: string, currentRole: 'admin' | 'user') => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: nextRole } : u));
    toast.success(`Đã cập nhật vai trò thành: ${nextRole.toUpperCase()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-card border border-[#E8E2D8] shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#46564E]">Quản lý Tài khoản & Phân quyền RBAC</h2>
            <span className="bg-[#BFE8D5] text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Bảo mật hệ thống
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fm-muted mt-0.5">
            Quản trị quyền truy cập Admin, xem nhật ký audit log và điều phối nhân sự vận hành.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card border border-[#E8E2D8] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200/80 text-fm-muted font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tên hiển thị</th>
                <th className="py-3 px-4">Địa chỉ Email</th>
                <th className="py-3 px-4">Vai trò (Role)</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày tham gia</th>
                <th className="py-3 px-4 text-right">Phân quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-fm-text">
                    {u.display_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-[#FFE6A7] text-amber-900' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role === 'admin' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                      {u.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success">Hoạt động</Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                    {u.created_at}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleRole(u.id, u.role)}
                      className="text-xs text-fm-muted hover:text-fm-text bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-btn transition-colors border border-gray-200"
                    >
                      {u.role === 'admin' ? 'Hạ xuống User' : 'Nâng cấp Admin'}
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
