# ĐẶC TẢ DỰ ÁN FOODMATE AI (BẢN TỐI GIẢN - WEB MỞ)
*Phiên bản 2.0 | Tối giản, không phân quyền*

## 0. Quy ước và phạm vi tài liệu
Tài liệu này tổng hợp phạm vi FoodMate AI phiên bản rút gọn. Đây là một **ứng dụng web mở (open web)**, không yêu cầu đăng nhập, không có hệ thống tài khoản hay phân quyền. Mọi tính năng bao gồm tra cứu, nhận đề xuất, và cả giao diện quản lý dữ liệu đều được mở công khai (hoặc đặt ở một đường dẫn ẩn mà không cần xác thực).
Mục tiêu MVP: hoạt động tốt trong một khu vực thí điểm tại Hà Nội, ưu tiên dữ liệu quán bình dân có menu/giá được kiểm tra.

## 1. Tổng quan dự án
### 1.1. Mục tiêu
Giúp người dùng quyết định hôm nay nên ăn món gì dựa trên thời tiết, thời điểm, ngân sách, vị trí và sở thích. Tích hợp chatbot giải thích, tra cứu đường đi và một trang quản lý dữ liệu mở.
### 1.2. Đối tượng sử dụng
*   **Người dùng chung (Public User):** Sử dụng tất cả các tính năng của trang web bao gồm xem đề xuất, tìm quán, chat với AI, tìm đường, và đóng góp báo cáo dữ liệu.
*   **Người quản trị (Mở):** Truy cập vào đường dẫn `/manage` để thêm/sửa/xóa dữ liệu quán, menu, xem lịch sử tuyến đường (Route Explorer). Không yêu cầu đăng nhập.

## 2. Phạm vi chức năng
### 2.1. Chức năng phục vụ tra cứu (Frontend)
| Mã | Chức năng | Mô tả / yêu cầu |
|---|---|---|
| U01 | Trang chủ | Lời chào, thời tiết, ô nhập ngân sách, sở thích, và nút “Hôm nay ăn gì?”. |
| U02 | Thời tiết | Lấy dữ liệu từ Weather API; có trạng thái loading, lỗi. |
| U03 | Đề xuất món | Gửi ngữ cảnh (thời tiết, ngân sách, sở thích) cho AI; AI giải thích lựa chọn dựa trên DB. |
| U04 | Tìm quán | Tìm kiếm tự do theo danh mục, khoảng cách, ngân sách. |
| U05 | Chi tiết quán | Hiển thị địa chỉ, tọa độ, giờ hoạt động, menu, giá đã xác minh. |
| U06 | Chatbot AI | Hỏi đáp về món/quán, chỉ dùng dữ liệu có trong hệ thống. |
| U07 | Tìm đường | Lấy vị trí một lần (khi bấm), gọi Routes API và vẽ bản đồ. |
| U08 | Báo lỗi dữ liệu | Form điền báo cáo sai giá, sai giờ mở cửa (không cần tài khoản). |

### 2.2. Chức năng quản trị (Management Dashboard - Mở)
| Mã | Module | Yêu cầu |
|---|---|---|
| M01 | Dashboard | Tổng quan số quán, số món, lượt tìm kiếm. |
| M02 | Quản lý quán | CRUD (Thêm, sửa, xóa) quán ăn, tọa độ, giờ hoạt động. |
| M03 | Quản lý menu | CRUD món ăn, giá bán, cập nhật trạng thái giá. |
| M04 | Route Explorer | Giao diện bản đồ xem lại lịch sử các tuyến đường người dùng đã request (A đến B). |

## 3. Đặc tả Route Explorer (Giao diện xem lịch sử tìm đường)
*   **Chức năng:** Xem lại tuyến đường backend nhận từ Routes API.
*   **Bản đồ:** Hiển thị điểm A (xuất phát), B (quán ăn) và đường polyline do API trả về.
*   **Dữ liệu:** Không lưu GPS liên tục, chỉ lưu log 1 lần khi người dùng bấm "Tìm đường" (gồm tọa độ A, B, thời gian, khoảng cách).

## 4. Quy trình AI đề xuất
1. Nhận yêu cầu: ngân sách, món, thời tiết.
2. Filter Database: Lấy ra danh sách quán phù hợp tiêu chí.
3. Prompt Gemini: Đưa danh sách quán đã lọc vào prompt để AI chọn lọc và viết lời giải thích.
4. Output: AI trả về JSON chứa ID quán và lý do. Không tự bịa thông tin.

## 5. Kiến trúc & Database (Tối giản)
*   **Tech Stack:** React (Vite) + Node.js/Express + Supabase (PostgreSQL) + Gemini API. Không sử dụng Auth.
*   **Database (Các bảng chính):**
    *   `restaurants`: id, name, address, lat, lng, status
    *   `menu_items`: id, restaurant_id, name, price, verified_status
    *   `route_logs`: id, origin_lat, origin_lng, destination_lat, destination_lng, distance, polyline, created_at
    *   `reports`: id, restaurant_id, content, created_at

*(Đã lược bỏ các bảng profiles, users, favorites, sessions, consent để hệ thống hoàn toàn ẩn danh và mở).*