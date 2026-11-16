import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { RecommendationsPage } from './pages/public/RecommendationsPage';

// Admin Route Explorer (Ẩn hoàn toàn, chỉ truy cập qua URL bí mật /minh)
import { RouteExplorerPage } from './pages/admin/RouteExplorerPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Trang chủ nhập Ngân sách, Sở thích, bấm "Hôm nay ăn gì?" */}
        <Route path="/" element={<HomePage />} />

        {/* Trang hiển thị lời khuyên ẩm thực & danh sách quán ăn */}
        <Route path="/recommend" element={<RecommendationsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />

        {/* URL bí mật dành cho Admin xem Route Explorer */}
        <Route path="/minh" element={<RouteExplorerPage />} />
      </Route>

      {/* Chuyển hướng tất cả đường dẫn cũ hoặc không hợp lệ về Trang chủ */}
      <Route path="/manage/*" element={<Navigate to="/" replace />} />
      <Route path="/manage" element={<Navigate to="/" replace />} />
      <Route path="/manager" element={<Navigate to="/" replace />} />
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
      <Route path="/admin" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
