-- ============================================================
-- FoodMate AI — Demo Seed Data for Hanoi Pilot
-- ============================================================

INSERT INTO restaurants (id, name, description, address, lat, lng, phone, website, opening_hours_json, status)
VALUES
('rest-1', 'Phở Thìn Lò Đúc', '[DEMO] Quán phở bò tái lăn trứ danh Hà Nội với nước dùng béo ngậy, ngập tràn hành hoa xắt nhỏ thơm nức mũi.', '13 Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội', 21.0182, 105.8573, '024 3821 2709', 'https://phothinloduc.vn', '{"mon_sun": "06:00 - 20:30"}', 'active'),
('rest-2', 'Bún chả Hương Liên (Bún chả Obama)', '[DEMO] Quán bún chả nổi tiếng từng đón tiếp Tổng thống Barack Obama và đầu bếp Anthony Bourdain năm 2016.', '24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng, Hà Nội', 21.0189, 105.8524, '024 3943 4106', 'https://facebook.com/bunchahuonglien', '{"mon_sun": "08:00 - 20:30"}', 'active'),
('rest-3', 'Bánh mì 25', '[DEMO] Quán bánh mì kẹp phố cổ được khách du lịch và người bản địa yêu thích, vỏ giòn ruột mềm pate thơm.', '25 Hàng Cá, Hàng Đào, Hoàn Kiếm, Hà Nội', 21.0357, 105.8499, '097 766 88 95', 'https://banhmi25.net', '{"mon_sun": "07:00 - 21:00"}', 'active'),
('rest-4', 'Bún đậu Mẹt Cây Bàng', '[DEMO] Quán bún đậu mắm tôm chuẩn vị với đậu rán giòn ngoài mềm trong, chả cốm dẻo quánh và dồi rán.', '129 Đại La, Trương Định, Hai Bà Trưng, Hà Nội', 20.9996, 105.8458, '098 333 44 55', NULL, '{"mon_sun": "10:00 - 21:00"}', 'active'),
('rest-5', 'Cơm tấm Sườn Bì Chả Phương Anh', '[DEMO] Quán cơm tấm bình dân hương vị miền Nam giữa lòng Hà Nội, miếng sườn nướng mật ong mềm mọng.', '119 Phùng Hưng, Hàng Bông, Hoàn Kiếm, Hà Nội', 21.0315, 105.8449, '091 222 55 66', NULL, '{"mon_sun": "09:30 - 21:30"}', 'active'),
('rest-6', 'Cà phê Giảng (Cà phê trứng)', '[DEMO] Nơi khai sinh ra món cà phê trứng trứ danh từ năm 1946, béo ngậy ngọt dịu hoà quyện với hương cà phê robusta.', '39 Nguyễn Hữu Huân, Lý Thái Tổ, Hoàn Kiếm, Hà Nội', 21.0322, 105.8542, '098 989 22 99', 'https://cafegiang.vn', '{"mon_sun": "07:00 - 22:00"}', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_items (id, restaurant_id, name, description, price, portion_label, verification_status, last_verified_at)
VALUES
('menu-1-1', 'rest-1', 'Phở Bò Tái Lăn', 'Bò xào lăn lửa lớn với tỏi, gừng và hành hoa', 70000, 'Bát tiêu chuẩn', 'verified', '2026-03-10'),
('menu-1-2', 'rest-1', 'Quẩy giòn', 'Quẩy giòn ăn kèm phở nóng', 10000, 'Đĩa (3 cái)', 'verified', '2026-03-10'),
('menu-2-1', 'rest-2', 'Bún chả đặc biệt', 'Chả miếng, chả băm nướng than hoa thơm lừng kèm rau sống', 55000, 'Suất đặc biệt', 'verified', '2026-03-01'),
('menu-2-2', 'rest-2', 'Nem hải sản / Nem cua bể', 'Nem rán giòn rụm nhân hải sản tươi', 35000, '1 chiếc lớn', 'verified', '2026-03-01'),
('menu-3-1', 'rest-3', 'Bánh mì Thập cẩm Pate Xá xíu', 'Pate gan béo ngậy, thịt xá xíu, dưa góp, rau mùi', 35000, 'Chiếc', 'verified', '2026-03-05'),
('menu-4-1', 'rest-4', 'Bún đậu mẹt đầy đủ', 'Bún lá, đậu mơ rán lướt ván, thịt luộc, chả cốm, nem rán, dồi sụn', 45000, 'Mẹt đầy đủ', 'verified', '2026-03-08'),
('menu-5-1', 'rest-5', 'Cơm tấm sườn bì chả trứng', 'Cơm gạo tấm, sườn nướng mật ong, bì thính, chả trứng hấp, trứng ốp la', 50000, 'Dĩa tiêu chuẩn', 'verified', '2026-03-11'),
('menu-6-1', 'rest-6', 'Cà phê trứng truyền thống', 'Lòng đỏ trứng đánh bông xốp mịn cùng mật ong trên nền cà phê nóng thơm lừng', 35000, 'Cốc nóng/đá', 'verified', '2026-03-12')
ON CONFLICT (id) DO NOTHING;
