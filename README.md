# 🍜 FoodMate AI — Website Gợi Ý Món Ăn & Quán Ăn Bình Dân

> Hệ thống gợi ý ẩm thực bình dân thông minh dựa trên thời tiết, vị trí, ngân sách và sở thích cá nhân; tích hợp Chatbot AI, bản đồ lộ trình và giao diện **Route Explorer** chuyên biệt.

---

## 🎨 Phong Cách Thiết Kế — Cute Minimal Pastel Modern UI
Giao diện tuân thủ 100% quy chuẩn thiết kế:
- **Tone màu pastel sáng nhẹ:**
  - Background chính: `#FFF9F0`
  - Primary: `#BFE8D5` (Pastel Mint)
  - Secondary: `#FFCBAE` (Pastel Peach)
  - Accent: `#FFE6A7` (Pastel Warm Yellow)
  - Additional: `#D9D2F5` (Pastel Lavender)
  - Text chính: `#46564E` (Dark Slate Green)
  - Text phụ: `#718096`
- **Typography:** Be Vietnam Pro, Nunito (hỗ trợ tiếng Việt trọn vẹn)
- **Quy chuẩn bo góc:** Card radius 20px, Button radius 14px, Input radius 13px, Modal 22px
- **Biểu tượng:** Bộ icon nét đơn giản bo tròn từ Lucide React
- **Đổ bóng:** Shadow nhẹ, mềm mại (`shadow-soft`)

---

## 📱 Cấu Trúc Chức Năng

### 1. Giao Diện Người Dùng (Public / User)
- **Trang chủ (`/`):** Lời chào cá nhân hóa, widget thời tiết theo thời gian thực (nhiệt độ, tình trạng), định vị GPS một lần, bộ chọn ngân sách và sở thích ăn uống, nút CTA "Hôm nay ăn gì?".
- **Trang đề xuất (`/recommendations`):** Hiển thị danh sách quán ăn/món ăn phù hợp nhất, kèm bảng lý giải chi tiết từ AI (Grounded AI — không bịa dữ liệu).
- **Trang tìm quán (`/restaurants`):** Tìm kiếm tự do theo từ khóa, lọc theo chip danh mục (Phở & Bún, Cơm, Bánh mì, Đồ nướng, Giải khát), phân trang.
- **Trang chi tiết quán (`/restaurants/:id`):** Thông tin quán, địa chỉ, giờ mở cửa, số điện thoại, bản đồ vị trí Leaflet, bảng thực đơn & giá xác minh, nút "Tìm đường".
- **Chatbot AI (`/chatbot`):** Trò chuyện hỏi đáp về món ăn, giải thích đề xuất dựa trên dữ liệu thật đã xác minh.
- **Bản đồ chỉ đường (`/map`):** Lấy vị trí GPS một lần (hoặc chọn điểm mốc xuất phát nếu từ chối GPS), vẽ tuyến đường polyline từ A đến B, ước tính thời gian & khoảng cách.
- **Báo cáo sai sót (`/report`):** Form gửi phản hồi về giá, địa chỉ hoặc giờ mở cửa cho Admin.

### 2. Giao Diện Quản Trị (Admin / Open Management Portal at `/admin` & `/manage`)
- **Dashboard (`/admin`):** Thống kê số quán, số món, lượt tìm kiếm, lượt đề xuất AI và nhật ký hoạt động.
- **Quản lý quán ăn (`/admin/restaurants`):** Bảng dữ liệu có tìm kiếm, lọc, form thêm/sửa/xóa quán.
- **Menu & Bảng giá (`/admin/menus`):** Quản lý giá từng món, nút phê duyệt xác minh giá trực tiếp.
- **Nguồn dữ liệu (`/admin/sources`):** Minh bạch nguồn thu thập (Admin khảo sát, Google Places, đóng góp người dùng).
- **Hàng chờ xác thực (`/admin/verification`):** Duyệt yêu cầu cập nhật giá từ cộng đồng trước khi đưa vào tập gợi ý AI.
- **Cấu hình AI (`/admin/ai-settings`):** Tùy chỉnh Model, Temperature, System Prompt chống hallucination.
- **Thống kê (`/admin/analytics`):** Phân tích xu hướng món ăn, quận huyện được quan tâm và tỷ lệ phương tiện di chuyển.
- ⭐ **Route Explorer (`/admin/routes`):** 
  - Bố cục 3 khu vực chuyên biệt: Danh sách route bên trái, Bản đồ lớn trung tâm (Leaflet Marker A/B + Polyline đề xuất), Panel chi tiết kỹ thuật bên phải.
  - Tuân thủ quy tắc riêng tư: Không theo dõi GPS liên tục, ghi chú rõ "Tuyến đường được đề xuất từ API (không phải GPS tracking thực tế)".
  - Hỗ trợ bộ lọc theo ngày, quán, phương tiện và xuất CSV an toàn.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

### Yêu Cầu Môi Trường
- Node.js version 18.0 trở lên
- npm 9.0 trở lên

### 1. Khởi động Backend (Port 3001)
```bash
cd backend
npm install
npm run build
npm start
# Hoặc chạy chế độ phát triển: npm run dev
```
Backend sẽ khởi chạy tại: `http://localhost:3001` (Tích hợp sẵn bộ nhớ đệm dữ liệu mẫu Hà Nội, sẵn sàng phục vụ API ngay cả khi chưa có Supabase key).

### 2. Khởi động Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:5173`

---

## 🔐 Cấu Hình Biến Môi Trường (`.env`)

Tạo file `.env` tại thư mục `backend/`:
```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
WEATHER_API_KEY=your_weather_api_key
GOOGLE_MAPS_KEY=your_google_maps_api_key
GOOGLE_ROUTES_KEY=your_google_routes_key
NODE_ENV=development
```

Tạo file `.env` tại thư mục `frontend/`:
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 🚀 Triển Khai Lên Production (Deploy)

- **Frontend:** Triển khai trên **Vercel** hoặc **Netlify**. Thiết lập Build command: `npm run build`, Output directory: `dist`.
- **Backend:** Triển khai trên **Render**, **Railway** hoặc **Vercel Serverless Functions**.
- **Database:** Tạo project trên **Supabase**, vào SQL Editor và chạy nội dung file `backend/migrations/001_init.sql` và `backend/migrations/002_seed.sql`.
