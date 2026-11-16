# 📋 Ma Trận Triển Khai & Kiểm Thử — FoodMate AI

> Tiến độ triển khai toàn bộ dự án theo tài liệu Đặc tả và Master Prompt.

---

## ✅ Trạng Thái Hoàn Thành Các Giai Đoạn (100% Completed)

| Giai đoạn | Nội dung công việc | Trạng thái | Kiểm thử |
|---|---|:---:|:---:|
| **Phase 0: Nền tảng** | Cấu trúc Monorepo, React + Vite + TS, Express + TS, Tailwind CSS pastel palette, CSS variables, Types definition | **Hoàn thành** | Build Passed |
| **Phase 1: Giao diện Cute Minimal** | Theme pastel (#FFF9F0, #BFE8D5, #FFCBAE, #FFE6A7, #D9D2F5), Typography Be Vietnam Pro & Nunito, Components bo góc | **Hoàn thành** | Responsive Tested |
| **Phase 2: Chức năng Người dùng** | Trang chủ, Thời tiết thời gian thực, Bộ lọc ngân sách, Bộ chọn sở thích, Đề xuất món ăn, Chi tiết quán, Thực đơn & giá | **Hoàn thành** | End-to-End OK |
| **Phase 3: Bản đồ & Định tuyến** | GPS một lần bằng `getCurrentPosition()`, fallback điểm mốc, Leaflet map, vẽ polyline, tính khoảng cách & thời gian | **Hoàn thành** | Functional OK |
| **Phase 4: Trợ lý AI & Chatbot** | Chatbot hỏi đáp ngữ cảnh, Grounded AI không bịa dữ liệu, giải thích đề xuất dựa trên dữ liệu thật | **Hoàn thành** | Grounding OK |
| **Phase 5: Route Explorer (Trọng tâm)** | Bố cục 3 cột (Danh sách - Bản đồ lớn - Panel chi tiết), Marker A/B, Polyline API, Legend chuẩn, bộ lọc, xuất CSV | **Hoàn thành** | Verified OK |
| **Phase 6: Quản trị Quản lý (Admin/Open)** | Dashboard số liệu, Quản lý quán CRUD, Quản lý menu & bảng giá, Nguồn dữ liệu minh bạch, Hàng chờ xác thực, Phân tích | **Hoàn thành** | Full CRUD OK |
| **Phase 7: Backend & Database** | REST APIs đầy đủ, Supabase SQL schema 4-17 bảng, Seed data Hà Nội, Mock Adapter dự phòng, Error Handling | **Hoàn thành** | Build Passed |

---

## 🎯 Ma Trận Truy Xuất Yêu Cầu (Traceability Matrix)

| Mã yêu cầu | Mô tả | Giao diện / Trang | API Endpoint | Bảng DB |
|---|---|---|---|---|
| **U01** | Lời chào, thời tiết, ngân sách, CTA "Hôm nay ăn gì?" | `HomePage.tsx` | `/api/weather/current` | `weather_logs` |
| **U02** | Widget thời tiết tự động theo khu vực | `WeatherWidget.tsx` | `/api/weather/current` | `weather_logs` |
| **U03** | Đề xuất món & lý giải AI | `RecommendationsPage.tsx` | `/api/recommendations` | `menu_items` |
| **U04** | Tìm quán theo danh mục, từ khóa | `RestaurantsPage.tsx` | `/api/restaurants` | `restaurants` |
| **U05** | Chi tiết quán, menu, giá xác minh, mini map | `RestaurantDetailPage.tsx` | `/api/restaurants/:id` | `restaurants`, `menu_items` |
| **U06** | Chatbot AI hỏi đáp thực đơn | `ChatbotPage.tsx` | `/api/chat` | `restaurants` |
| **U07** | Tìm đường, GPS một lần, lộ trình API | `MapRoutingPage.tsx` | `/api/routes` | `route_logs` |
| **U08** | Báo cáo dữ liệu sai | `ReportPage.tsx` | `/api/reports` | `reports` |
| **M01** | Admin Dashboard tổng quan | `DashboardPage.tsx` | `/api/admin/analytics` | Toàn bộ bảng |
| **M02** | Quản lý quán ăn (CRUD) | `AdminRestaurantsPage.tsx` | `/api/admin/restaurants` | `restaurants` |
| **M03** | Quản lý Menu & Xác minh giá | `MenuManagementPage.tsx` | `/api/admin/restaurants` | `menu_items` |
| **M04** | **Route Explorer (3 khu vực)** | `RouteExplorerPage.tsx` | `/api/admin/routes` | `route_logs` |
| **M05** | Nguồn dữ liệu & Minh bạch | `DataSourcesPage.tsx` | `/api/admin/sources` | `restaurant_sources` |
| **M06** | Hàng chờ kiểm duyệt giá | `VerificationQueuePage.tsx`| `/api/admin/verification`| `data_verification_logs`|
| **M07** | Cấu hình AI & Prompt | `AISettingsPage.tsx` | `/api/admin/ai-settings` | Cấu hình |
| **M08** | Thống kê & Phân tích xu hướng | `AnalyticsPage.tsx` | `/api/admin/analytics` | `route_logs` |
