import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/public/Navbar';
import { Footer } from '../components/public/Footer';
import { FoodMateToaster } from '../components/ui/Toast';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-fm-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FoodMateToaster />
    </div>
  );
};
