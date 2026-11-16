import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, displayName);
      toast.success('Đăng ký tài khoản thành công!');
      navigate('/');
    } catch {
      // handled by store
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-card border border-[#E8E2D8] shadow-soft max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <span className="text-3xl">🍲</span>
        <h2 className="text-2xl font-bold text-[#46564E] mt-2">Tạo tài khoản mới</h2>
        <p className="text-xs text-fm-muted mt-1">Đồng hành cùng FoodMate khám phá ẩm thực</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-btn px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên hiển thị của bạn"
          type="text"
          value={displayName}
          onChange={(e) => {
            clearError();
            setDisplayName(e.target.value);
          }}
          leftIcon={<User size={15} />}
          placeholder="Nguyễn Văn Ẩm Thực"
          required
        />
        <Input
          label="Địa chỉ Email"
          type="email"
          value={email}
          onChange={(e) => {
            clearError();
            setEmail(e.target.value);
          }}
          leftIcon={<Mail size={15} />}
          placeholder="ban@email.com"
          required
        />
        <Input
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => {
            clearError();
            setPassword(e.target.value);
          }}
          leftIcon={<Lock size={15} />}
          placeholder="Tối thiểu 6 ký tự"
          minLength={6}
          required
        />
        <Button type="submit" className="w-full justify-center text-sm font-bold py-3" loading={isLoading}>
          Đăng ký tài khoản
        </Button>
      </form>

      <p className="text-center text-xs text-fm-muted mt-5">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-emerald-700 font-bold hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
};
