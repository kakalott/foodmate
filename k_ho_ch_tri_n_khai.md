# KẾ HOẠCH TRIỂN KHAI FOODMATE AI (PHIÊN BẢN WEB MỞ TỐI GIẢN)

Kế hoạch này vạch ra các bước thực hiện cụ thể để hoàn thiện dự án mà không cần hệ thống tài khoản người dùng, tối ưu thời gian và đơn giản hóa logic.

## Giai đoạn 1: Khởi tạo và Cấu hình Nền tảng (Day 1)
*   **Mục tiêu:** Chạy được cấu trúc thư mục cơ bản cho cả Frontend và Backend.
*   **Công việc chi tiết:**
    1.  Tạo repository, setup React + Vite + TypeScript + TailwindCSS cho Frontend.
    2.  Setup Node.js + Express (hoặc cấu hình Serverless API trên Vercel/Supabase Edge Functions).
    3.  Tạo file `.env` chuẩn bị cho các biến môi trường (Gemini, Google Maps, Weather).
    4.  Định nghĩa routing cơ bản trên Frontend: `/` (Trang chủ), `/search` (Tìm kiếm), `/restaurant/:id` (Chi tiết), `/manage` (Trang quản lý mở).

## Giai đoạn 2: Cơ sở dữ liệu (Database) (Day 2)
*   **Mục tiêu:** Hoàn thiện bảng dữ liệu và có dữ liệu mẫu (Seed data).
*   **Công việc chi tiết:**
    1.  Tạo project trên Supabase (bỏ qua phần Auth).
    2.  Chạy SQL script tạo 4 bảng chính: `restaurants`, `menu_items`, `route_logs`, `reports`.
    3.  Tắt RLS (Row Level Security) hoặc set policy public allow all để bất kỳ ai cũng có thể đọc/ghi (phù hợp với tính chất web mở test/MVP).
    4.  Viết script seed data: Tạo 10-15 quán ăn mẫu tại khu vực Hà Nội kèm theo menu và giá thực tế.

## Giai đoạn 3: Xây dựng Giao diện Người dùng (Frontend - Public) (Day 3-4)
*   **Mục tiêu:** Xây dựng luồng UX cho người dùng tra cứu thức ăn.
*   **Công việc chi tiết:**
    1.  **Trang chủ:** Dựng UI hiển thị thời tiết (kết nối Weather API public giả lập hoặc thật), ô nhập ngân sách, và chọn sở thích.
    2.  **Chi tiết quán:** Dựng trang hiển thị thông tin quán, danh sách món ăn, và bản đồ mini (tích hợp thư viện Leaflet hoặc Google Maps).
    3.  **Tích hợp vị trí:** Viết hàm gọi `navigator.geolocation.getCurrentPosition()` khi người dùng bấm "Tìm đường". Gọi Routes API để lấy polyline và lưu vào bảng `route_logs`.

## Giai đoạn 4: Tích hợp AI (Gemini) (Day 5)
*   **Mục tiêu:** Hệ thống tự động đề xuất quán ăn dựa trên ngữ cảnh và giải thích được lý do.
*   **Công việc chi tiết:**
    1.  Tạo Backend Endpoint `/api/recommend`.
    2.  Viết logic Query: Lọc DB theo ngân sách và vị trí -> lấy ra Top 10 quán phù hợp.
    3.  Viết Master Prompt gửi cho Gemini: Đưa JSON của 10 quán này + ngữ cảnh thời tiết/yêu cầu người dùng vào Prompt. Yêu cầu AI trả về JSON 3 quán tốt nhất kèm theo `reason` (lý do).
    4.  Hiển thị kết quả từ AI lên UI Frontend và tích hợp cửa sổ chat nhỏ (Chatbot) dùng chung logic query giới hạn trong danh sách quán.

## Giai đoạn 5: Xây dựng Giao diện Quản lý (Management - Mở) (Day 6-7)
*   **Mục tiêu:** Có nơi để chỉnh sửa dữ liệu và xem lịch sử route trực quan.
*   **Công việc chi tiết:**
    1.  Tạo giao diện tại route `/manage` (ẩn trên menu chính nhưng ai biết link đều vào được).
    2.  **Tab Dữ liệu:** Viết form Thêm/Sửa/Xóa đơn giản cho `restaurants` và `menu_items`.
    3.  **Tab Route Explorer:** 
        *   Fetch danh sách từ `route_logs`.
        *   Hiển thị danh sách bên trái.
        *   Bên phải là bản đồ. Khi click vào 1 log, vẽ marker A, marker B và polyline lên bản đồ. Focus bản đồ vừa vặn với tuyến đường đó.

## Giai đoạn 6: Kiểm thử và Triển khai (Day 8)
*   **Mục tiêu:** Launch sản phẩm MVP.
*   **Công việc chi tiết:**
    1.  Kiểm tra trên Mobile và Desktop (Responsive).
    2.  Test trường hợp người dùng từ chối cấp quyền vị trí (phải cho phép nhập địa chỉ thủ công).
    3.  Test giới hạn Token của Gemini và xử lý lỗi khi API quá tải.
    4.  Deploy Frontend lên Vercel/Netlify. Deploy Backend/Database lên Supabase/Render.
    5.  Bàn giao URL sản phẩm.