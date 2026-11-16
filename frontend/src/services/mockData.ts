import type { Restaurant, RouteLog, WeatherData, Recommendation, AnalyticsData } from '../types';

export const MOCK_WEATHER: WeatherData = {
  temperature: 24,
  weather_code: 1, // Sunny/Fair
  description: 'Nắng nhẹ, trời se lạnh dễ chịu',
  area_label: 'Hà Nội',
  observed_at: new Date().toISOString(),
};

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-2',
    name: 'Bún chả Hương Liên (Bún chả Obama)',
    description: 'Quán bún chả nổi tiếng từng đón tiếp Tổng thống Barack Obama và đầu bếp Anthony Bourdain năm 2016.',
    address: '24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng, Hà Nội',
    lat: 21.0189,
    lng: 105.8524,
    phone: '024 3943 4106',
    opening_hours_json: { mon_sun: '08:00 - 20:30' },
    status: 'active',
    rating: 4.9,
    review_count: 2850,
    created_at: '2026-01-12T08:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    categories: [{ id: 'cat-2', name: 'Phở & Bún', slug: 'pho-bun' }, { id: 'cat-1', name: 'Bình dân', slug: 'binh-dan' }],
    menus: [
      {
        id: 'menu-2-1',
        restaurant_id: 'rest-2',
        menu_item_id: 'item-2-1',
        price: 55000,
        currency: 'VND',
        portion_label: 'Suất đặc biệt',
        availability_status: 'available',
        verification_status: 'verified',
        source_id: 'src-admin',
        last_verified_at: '2026-03-01',
        menu_item: { id: 'item-2-1', name: 'Bún chả đặc biệt', description: 'Chả miếng, chả băm nướng than hoa thơm lừng kèm rau sống', status: 'active' }
      },
      {
        id: 'menu-2-2',
        restaurant_id: 'rest-2',
        menu_item_id: 'item-2-2',
        price: 35000,
        currency: 'VND',
        portion_label: '1 chiếc lớn',
        availability_status: 'available',
        verification_status: 'verified',
        source_id: 'src-admin',
        last_verified_at: '2026-03-01',
        menu_item: { id: 'item-2-2', name: 'Nem hải sản / Nem cua bể', description: 'Nem rán giòn rụm nhân hải sản tươi', status: 'active' }
      }
    ]
  },
  {
    id: 'rest-6',
    name: 'Cà phê Giảng (Cà phê trứng)',
    description: 'Nơi khai sinh ra món cà phê trứng trứ danh từ năm 1946, béo ngậy ngọt dịu hoà quyện với hương cà phê robusta.',
    address: '39 Nguyễn Hữu Huân, Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    lat: 21.0322,
    lng: 105.8542,
    phone: '098 989 22 99',
    opening_hours_json: { mon_sun: '07:00 - 22:00' },
    status: 'active',
    rating: 4.9,
    review_count: 4100,
    created_at: '2026-01-28T08:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    categories: [{ id: 'cat-5', name: 'Giải khát', slug: 'giai-khat' }],
    menus: [
      {
        id: 'menu-6-1',
        restaurant_id: 'rest-6',
        menu_item_id: 'item-6-1',
        price: 35000,
        currency: 'VND',
        portion_label: 'Cốc nóng/đá',
        availability_status: 'available',
        verification_status: 'verified',
        source_id: 'src-admin',
        last_verified_at: '2026-03-12',
        menu_item: { id: 'item-6-1', name: 'Cà phê trứng truyền thống', description: 'Lòng đỏ trứng đánh bông xốp mịn cùng mật ong trên nền cà phê nóng thơm lừng', status: 'active' }
      }
    ]
  },
  {
    id: 'rest-1',
    name: 'Phở Thìn Lò Đúc',
    description: 'Quán phở bò tái lăn trứ danh Hà Nội với nước dùng béo ngậy, ngập tràn hành hoa xắt nhỏ thơm nức mũi.',
    address: '13 Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội',
    lat: 21.0182,
    lng: 105.8573,
    phone: '024 3821 2709',
    opening_hours_json: { mon_sun: '06:00 - 20:30' },
    status: 'active',
    rating: 4.8,
    review_count: 1420,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    categories: [{ id: 'cat-2', name: 'Phở & Bún', slug: 'pho-bun' }, { id: 'cat-1', name: 'Bình dân', slug: 'binh-dan' }],
    menus: [
      {
        id: 'menu-1-1',
        restaurant_id: 'rest-1',
        menu_item_id: 'item-1-1',
        price: 70000,
        currency: 'VND',
        portion_label: 'Bát tiêu chuẩn',
        availability_status: 'available',
        verification_status: 'verified',
        source_id: 'src-admin',
        last_verified_at: '2026-03-10',
        menu_item: { id: 'item-1-1', name: 'Phở Bò Tái Lăn', description: 'Bò xào lăn lửa lớn với tỏi, gừng và hành hoa', status: 'active' }
      },
      {
        id: 'menu-1-2',
        restaurant_id: 'rest-1',
        menu_item_id: 'item-1-2',
        price: 10000,
        currency: 'VND',
        portion_label: 'Đĩa (3 cái)',
        availability_status: 'available',
        verification_status: 'verified',
        source_id: 'src-admin',
        last_verified_at: '2026-03-10',
        menu_item: { id: 'item-1-2', name: 'Quẩy giòn', description: 'Quẩy giòn ăn kèm phở nóng', status: 'active' }
      }
    ]
  },
  {
    id: 'rest-3',
    name: 'Bánh mì 25',
    description: 'Quán bánh mì kẹp phố cổ được khách du lịch và người bản địa yêu thích, vỏ giòn ruột mềm pate thơm.',
    address: '25 Hàng Cá, Hàng Đào, Hoàn Kiếm, Hà Nội',
    lat: 21.0357,
    lng: 105.8499,
    phone: '097 766 88 95',
    opening_hours_json: { mon_sun: '07:00 - 21:00' },
    status: 'active',
    rating: 4.8,
    review_count: 3200,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    categories: [{ id: 'cat-1', name: 'Bình dân', slug: 'binh-dan' }, { id: 'cat-3', name: 'Đồ ăn nhanh', slug: 'fast-food' }],
    menus: [
      {
        id: 'menu-3-1',
        restaurant_id: 'rest-3',
        menu_item_id: 'item-3-1',
        price: 35000,
        currency: 'VND',
        portion_label: 'Chiếc',
        availability_status: 'available',
        verification_status: 'verified',
        source_id: 'src-admin',
        last_verified_at: '2026-03-05',
        menu_item: { id: 'item-3-1', name: 'Bánh mì Thập cẩm Pate Xá xíu', description: 'Pate gan béo ngậy, thịt xá xíu, dưa góp, rau mùi, sốt đặc biệt', status: 'active' }
      }
    ]
  },
  {
    id: 'rest-5',
    name: 'Cơm tấm Sườn Bì Chả Phương Anh',
    description: 'Quán cơm tấm bình dân hương vị miền Nam giữa lòng Hà Nội, miếng sườn nướng mật ong mềm mọng.',
    address: '119 Phùng Hưng, Hàng Bông, Hoàn Kiếm, Hà Nội',
    lat: 21.0315,
    lng: 105.8449,
    phone: '091 222 55 66',
    opening_hours_json: { mon_sun: '09:30 - 21:30' },
    status: 'active',
    rating: 4.7,
    review_count: 760,
    created_at: '2026-01-25T08:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    categories: [{ id: 'cat-4', name: 'Cơm', slug: 'com' }, { id: 'cat-1', name: 'Bình dân', slug: 'binh-dan' }],
    menus: [
      {
        id: 'menu-5-1',
        restaurant_id: 'rest-5',
        menu_item_id: 'item-5-1',
        price: 50000,
        currency: 'VND',
        portion_label: 'Dĩa tiêu chuẩn',
        availability_status: 'available',
        verification_status: 'verified',
        source_id: 'src-admin',
        last_verified_at: '2026-03-11',
        menu_item: { id: 'item-5-1', name: 'Cơm tấm sườn bì chả trứng', description: 'Cơm gạo tấm, sườn nướng mỡ hành, bì heo thính, chả trứng hấp, trứng ốp la', status: 'active' }
      }
    ]
  },
  {
    id: 'rest-4',
    name: 'Bún đậu Mẹt Cây Bàng',
    description: 'Quán bún đậu mắm tôm chuẩn vị với đậu rán giòn ngoài mềm trong, chả cốm dẻo quánh và dồi rán.',
    address: '129 Đại La, Trương Định, Hai Bà Trưng, Hà Nội',
    lat: 20.9996,
    lng: 105.8458,
    phone: '098 333 44 55',
    opening_hours_json: { mon_sun: '10:00 - 21:00' },
    status: 'active',
    rating: 4.6,
    review_count: 890,
    created_at: '2026-01-20T08:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    categories: [{ id: 'cat-1', name: 'Bình dân', slug: 'binh-dan' }, { id: 'cat-2', name: 'Phở & Bún', slug: 'pho-bun' }],
    menus: [
      {
        id: 'menu-4-1',
        restaurant_id: 'rest-4',
        menu_item_id: 'item-4-1',
        price: 45000,
        currency: 'VND',
        portion_label: 'Mẹt đầy đủ',
        availability_status: 'available',
        verification_status: 'verified',
        source_id: 'src-admin',
        last_verified_at: '2026-03-08',
        menu_item: { id: 'item-4-1', name: 'Bún đậu mẹt đầy đủ', description: 'Bún lá, đậu mơ rán lướt ván, thịt luộc chân giò, chả cốm, nem rán, dồi sụn', status: 'active' }
      }
    ]
  }
];

export const MOCK_ROUTE_LOGS: RouteLog[] = [
  {
    id: 'route-log-101',
    session_id: 'sess_hanoi_8f29c1',
    user_id: 'demo-user-uuid',
    restaurant_id: 'rest-1',
    origin_lat: 21.0285,
    origin_lng: 105.8542,
    destination_lat: 21.0182,
    destination_lng: 105.8573,
    distance_meters: 1650,
    duration_seconds: 420,
    travel_mode: 'driving',
    provider: 'Google Routes API',
    consent_id: 'consent_9921',
    created_at: '2026-03-16T09:15:00Z',
    restaurant: MOCK_RESTAURANTS[2],
    route_polyline: '21.0285,105.8542;21.0255,105.8550;21.0215,105.8562;21.0182,105.8573',
  },
  {
    id: 'route-log-102',
    session_id: 'sess_hanoi_3b91a4',
    user_id: 'guest_sess_4412',
    restaurant_id: 'rest-2',
    origin_lat: 21.0333,
    origin_lng: 105.8450,
    destination_lat: 21.0189,
    destination_lng: 105.8524,
    distance_meters: 2200,
    duration_seconds: 600,
    travel_mode: 'driving',
    provider: 'Google Routes API',
    consent_id: 'consent_9922',
    created_at: '2026-03-16T11:30:00Z',
    restaurant: MOCK_RESTAURANTS[0],
    route_polyline: '21.0333,105.8450;21.0280,105.8480;21.0220,105.8505;21.0189,105.8524',
  },
  {
    id: 'route-log-103',
    session_id: 'sess_hanoi_77e4d2',
    user_id: 'guest_sess_8910',
    restaurant_id: 'rest-3',
    origin_lat: 21.0290,
    origin_lng: 105.8520,
    destination_lat: 21.0357,
    destination_lng: 105.8499,
    distance_meters: 1100,
    duration_seconds: 780,
    travel_mode: 'walking',
    provider: 'Google Routes API',
    consent_id: 'consent_9923',
    created_at: '2026-03-16T12:45:00Z',
    restaurant: MOCK_RESTAURANTS[3],
    route_polyline: '21.0290,105.8520;21.0320,105.8510;21.0345,105.8502;21.0357,105.8499',
  }
];

export const MOCK_ANALYTICS: AnalyticsData = {
  total_restaurants: 48,
  active_restaurants: 42,
  total_menu_items: 186,
  verified_items: 142,
  total_routes: 328,
  total_recommendations: 1250,
  total_reports: 5,
  pending_verifications: 8,
};

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    restaurant: MOCK_RESTAURANTS[0],
    menu_items: MOCK_RESTAURANTS[0].menus!,
    explanation: 'Bún chả nướng than hoa thơm lừng với nước chấm chua ngọt ấm nóng và rau sống tươi mát. Quán đạt 4.9 sao từ hơn 2.800 thực khách và mức giá rất bình dân chỉ 55.000đ.',
    suitability_factors: [
      'Đánh giá cực cao: 4.9 sao (2.850 đánh giá)',
      'Hương vị chua ngọt thanh nhẹ',
      'Giá bình dân hợp lý (55.000đ)',
      'Thực đơn có chứng thực nguồn gốc'
    ],
    score: 98
  },
  {
    restaurant: MOCK_RESTAURANTS[2],
    menu_items: MOCK_RESTAURANTS[2].menus!,
    explanation: 'Thời tiết Hà Nội đang se lạnh (24°C), một bát phở bò tái lăn nóng hổi béo ngậy ngập tràn hành hoa là lựa chọn hoàn hảo để làm ấm cơ thể (đạt 4.8 sao).',
    suitability_factors: [
      'Đánh giá 4.8 sao từ thực khách bản địa',
      'Phù hợp thời tiết mát mẻ / se lạnh',
      'Đúng khoảng ngân sách 50.000đ - 100.000đ',
      'Giá đã được kiểm tra trực tiếp'
    ],
    caveats: ['Quán đông vào giờ cao điểm (11h30 - 12h30)', 'Chỗ để xe máy hạn chế trên phố Lò Đúc'],
    score: 95
  },
  {
    restaurant: MOCK_RESTAURANTS[3],
    menu_items: MOCK_RESTAURANTS[3].menus!,
    explanation: 'Nếu bạn cần một bữa ăn nhanh gọn, tiện lợi mà vẫn đậm đà thơm ngon, Bánh mì 25 (4.8 sao) với pate béo ngậy và thịt xá xíu đậm đà chỉ với 35.000đ là lựa chọn tiết kiệm và ngon miệng.',
    suitability_factors: [
      'Đánh giá 4.8 sao từ hơn 3.200 đánh giá',
      'Tiết kiệm ngân sách (< 40.000đ)',
      'Thời gian chuẩn bị nhanh (< 5 phút)',
      'Vị trí phố cổ thuận tiện đi lại'
    ],
    score: 91
  }
];
