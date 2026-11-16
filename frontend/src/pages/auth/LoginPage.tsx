import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch {
      // handled by auth store
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass)
      .then(() => {
        toast.success(`Đăng nhập thành công với tài khoản ${demoEmail}!`);
        if (demoEmail.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-card border border-[#E8E2D8] shadow-soft max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <span className="text-3xl">🍜</span>
        <h2 className="text-2xl font-bold text-[#46564E] mt-2">Đăng nhập FoodMate</h2>
        <p className="text-xs text-fm-muted mt-1">Lưu quán ăn yêu thích và đồng bộ tùy chọn của bạn</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-btn px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Địa chỉ Email"
          type="email"
          value={email}
          onChange={(e) => {
            clearError();
            setEmail(e.target.value);
          }}
          leftIcon={<Mail size={15} />}
          placeholder="admin@foodmate.ai"
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
          placeholder="••••••••"
          required
        />
        <Button type="submit" className="w-full justify-center text-sm font-bold py-3" loading={isLoading}>
          Đăng nhập
        </Button>
      </form>

      {/* Quick Demo Login Credentials */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-[11px] font-bold text-fm-muted uppercase tracking-wider text-center mb-2.5">
          Tài khoản Demo thử nghiệm nhanh:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@foodmate.ai', 'admin')}
            className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-btn text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <ShieldCheck size={14} /> Admin Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('user@foodmate.ai', 'user123')}
            className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-btn text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <User size={14} /> User Demo
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-fm-muted mt-5">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-emerald-700 font-bold hover:underline">
          Đăng ký miễn phí
        </Link>
      </p>
    </div>
  );
};
