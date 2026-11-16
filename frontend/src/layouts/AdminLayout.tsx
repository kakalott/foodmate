import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { FoodMateToaster } from '../components/ui/Toast';

interface AdminLayoutProps {
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title = 'FoodMate Management Portal' }) => {
  return (
    <div className="min-h-screen bg-[#FFF9F0] flex">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen transition-all duration-200">
        <AdminHeader title={title} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <FoodMateToaster />
    </div>
  );
};
