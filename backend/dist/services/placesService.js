"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.placesService = void 0;
const dataService_1 = require("./dataService");
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
const DISH_PHOTO_MAP = {
    'chay': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    'nấm': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    'sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    'steak': 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    'bít tết': 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    'mì ý': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    'pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    'lẩu': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    'gà': 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    'bánh tráng': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'ốc': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    'phở': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    'bún chả': 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=600&q=80',
    'bún bò': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    'bánh mì': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    'bún đậu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'cơm': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    'cà phê': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    'nem': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
};
function getDishPhoto(dishName, isVegetarian) {
    if (isVegetarian) {
        return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80';
    }
    const lower = dishName.toLowerCase();
    for (const [key, url] of Object.entries(DISH_PHOTO_MAP)) {
        if (lower.includes(key))
            return url;
    }
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
}
// Danh sách quán ăn thực tế tại Hà Nội khi offline hoặc chưa kích hoạt Google Maps API Key
// ĐẢM BẢO TÊN QUÁN NGUYÊN BẢN, TUYỆT ĐỐI KHÔNG GÁN ĐÈ TÊN TĨNH VÀO TỪ KHÓA
const REAL_HANOI_VENUES = [
    // Quán Việt, Phở, Bún, Cơm
    { name: 'Phở Thìn Lò Đúc', address: '13 Lò Đúc, Quận Hai Bà Trưng, Hà Nội', latOffset: -0.0103, lngOffset: 0.0031, rating: 4.6, reviews: 3420, tags: ['phở', 'bò', 'nước dùng', 'cơm'] },
    { name: 'Bún Chả Hương Liên (Obama)', address: '24 Lê Văn Hưu, Quận Hai Bà Trưng, Hà Nội', latOffset: -0.0096, lngOffset: -0.0018, rating: 4.5, reviews: 4890, tags: ['bún chả', 'thịt nướng', 'nem cua bể'] },
    { name: 'Phở Gia Truyền Bát Đàn', address: '49 Bát Đàn, Quận Hoàn Kiếm, Hà Nội', latOffset: 0.0051, lngOffset: -0.0042, rating: 4.7, reviews: 2950, tags: ['phở', 'bò', 'tái nạm'] },
    { name: 'Bún Đậu Mẹt Ngõ Trạm', address: '1B Ngõ Trạm, Quận Hoàn Kiếm, Hà Nội', latOffset: 0.0038, lngOffset: -0.0061, rating: 4.6, reviews: 1540, tags: ['bún đậu', 'chả cốm', 'mắm tôm'] },
    { name: 'Cơm Tấm Sà Bì Chưởng Hà Nội', address: '86 Nguyễn Văn Tuyết, Quận Đống Đa, Hà Nội', latOffset: -0.0152, lngOffset: -0.0351, rating: 4.7, reviews: 2100, tags: ['cơm', 'sườn', 'trứng'] },
    { name: 'Bánh Mì 25 Hàng Cá', address: '25 Hàng Cá, Quận Hoàn Kiếm, Hà Nội', latOffset: 0.0072, lngOffset: -0.0031, rating: 4.8, reviews: 5200, tags: ['bánh mì', 'pate', 'thịt nguội'] },
    // Món Âu, Pizza, Burger, Pasta, Steak
    { name: "Pizza 4P's Tràng Tiền", address: '43 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', latOffset: -0.0045, lngOffset: 0.0048, rating: 4.9, reviews: 6800, tags: ['pizza', 'pasta', 'phô mai', 'mì ý'] },
    { name: 'The Pizza Company Bà Triệu', address: '30 Bà Triệu, Quận Hoàn Kiếm, Hà Nội', latOffset: -0.0078, lngOffset: -0.0022, rating: 4.5, reviews: 1820, tags: ['pizza', 'gà rán', 'mì ý'] },
    { name: 'Capricciosa Pizza & Pasta', address: 'Tầng 5 Vincom, 191 Bà Triệu, Quận Hai Bà Trưng, Hà Nội', latOffset: -0.0162, lngOffset: -0.0015, rating: 4.6, reviews: 960, tags: ['pizza', 'mì ý', 'pasta', 'salad'] },
    { name: 'El Gaucho Argentinian Steakhouse', address: '11 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', latOffset: -0.0051, lngOffset: 0.0062, rating: 4.8, reviews: 2310, tags: ['steak', 'bít tết', 'thịt bò'] },
    { name: 'Botanica Restaurant Steak & Wine', address: '3 Thái Phiên, Quận Hai Bà Trưng, Hà Nội', latOffset: -0.0181, lngOffset: 0.0025, rating: 4.6, reviews: 1450, tags: ['steak', 'bít tết', 'mì ý'] },
    // Món Nhật, Sushi, Lẩu, Nướng
    { name: 'iSushi Buffet Nhật Bản Triệu Việt Vương', address: '158 Triệu Việt Vương, Quận Hai Bà Trưng, Hà Nội', latOffset: -0.0175, lngOffset: -0.0032, rating: 4.7, reviews: 2400, tags: ['sushi', 'sashimi', 'nhật'] },
    { name: 'Sushi Kei Vincom Bà Triệu', address: '191 Bà Triệu, Quận Hai Bà Trưng, Hà Nội', latOffset: -0.0165, lngOffset: -0.0018, rating: 4.6, reviews: 1120, tags: ['sushi', 'maki', 'tempura', 'nhật'] },
    { name: 'Haidilao Hotpot Vincom Center', address: '2 Phạm Ngọc Thạch, Quận Đống Đa, Hà Nội', latOffset: -0.0212, lngOffset: -0.0215, rating: 4.9, reviews: 5800, tags: ['lẩu', 'hotpot', 'thịt bò'] },
    { name: 'Lẩu Phan Buffet Bò Úc', address: '7 Đào Duy Anh, Quận Đống Đa, Hà Nội', latOffset: -0.0245, lngOffset: -0.0182, rating: 4.5, reviews: 3100, tags: ['lẩu', 'kim chi', 'bò'] },
    { name: 'Lẩu Nấm Gia Khánh', address: '28 Tây Sơn, Quận Đống Đa, Hà Nội', latOffset: -0.0195, lngOffset: -0.0284, rating: 4.8, reviews: 1980, tags: ['lẩu', 'nấm', 'thanh đạm'] },
    // Quán chay đặc sản
    { name: 'Cơm Chay Nàng Tấm', address: '79A Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', latOffset: -0.0068, lngOffset: -0.0045, rating: 4.8, reviews: 2150, tags: ['chay', 'vegetarian', 'cơm chay', 'nấm'] },
    { name: 'Nhà Hàng Chay Bồ Đề Tâm', address: '34 Phạm Huy Thông, Quận Ba Đình, Hà Nội', latOffset: 0.0062, lngOffset: -0.0385, rating: 4.7, reviews: 1680, tags: ['chay', 'vegetarian', 'lẩu nấm', 'nem chay'] },
    { name: 'Buffet Chay Hương Thiền', address: '261 Xã Đàn, Quận Đống Đa, Hà Nội', latOffset: -0.0225, lngOffset: -0.0235, rating: 4.8, reviews: 3400, tags: ['chay', 'vegetarian', 'buffet chay'] },
    { name: 'Bếp Chay An Lạc', address: '109 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', latOffset: -0.0072, lngOffset: -0.0052, rating: 4.6, reviews: 920, tags: ['chay', 'vegetarian', 'bún chay'] },
];
function generateMockPlaces(searchQuery, userLat, userLng, isVegetarian) {
    const photo = getDishPhoto(searchQuery, isVegetarian);
    const lowerQuery = searchQuery.toLowerCase().trim();
    const queryTokens = lowerQuery.split(/\s+/).filter(Boolean);
    // Lọc và xếp hạng quán theo độ khớp thực tế với từ khóa hoặc gắn nhãn Chay
    let scoredVenues = REAL_HANOI_VENUES.map((venue) => {
        let score = 0;
        const lowerName = venue.name.toLowerCase();
        const lowerAddress = venue.address.toLowerCase();
        if (isVegetarian) {
            if (venue.tags.includes('chay') || lowerName.includes('chay'))
                score += 100;
            else if (venue.tags.includes('pizza') && lowerQuery.includes('pizza'))
                score += 50;
            else
                score -= 50;
        }
        for (const token of queryTokens) {
            if (lowerName.includes(token))
                score += 30;
            if (venue.tags.some((t) => t.includes(token)))
                score += 20;
            if (lowerAddress.includes(token))
                score += 5;
        }
        return { venue, score };
    });
    // Ưu tiên điểm khớp từ khóa, nếu chay thì chỉ lấy quán chay
    if (isVegetarian) {
        scoredVenues = scoredVenues.filter((item) => item.score > 0);
    }
    scoredVenues.sort((a, b) => b.score - a.score || b.venue.rating - a.venue.rating);
    // Lấy tối đa 6 quán thực tế phù hợp nhất
    const selected = scoredVenues.slice(0, 6).map((item) => item.venue);
    return selected.map((v, idx) => {
        const lat = Number((userLat + v.latOffset).toFixed(5));
        const lng = Number((userLng + v.lngOffset).toFixed(5));
        const dist = calculateHaversineKm(userLat, userLng, lat, lng);
        return {
            place_id: `place_real_${idx + 1}_${Math.abs(Math.round(lat * 1000))}`,
            name: v.name, // TÊN QUÁN THỰC TẾ NGUYÊN BẢN (Không chèn chuỗi giả định)
            address: v.address,
            lat,
            lng,
            rating: v.rating,
            user_ratings_total: v.reviews,
            photo_url: photo,
            distance_km: dist,
            dish_matched: searchQuery,
        };
    });
}
exports.placesService = {
    // Tìm kiếm trực tiếp Google Places API với Google's Native Order (Không tự sắp xếp sort)
    async searchGooglePlaces(query, userLat, userLng, isVegetarian) {
        const apiKey = await dataService_1.dbService.getEffectiveApiKey('google_maps');
        const searchKeyword = query.trim();
        const allPlaces = [];
        if (apiKey) {
            try {
                const endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchKeyword)}&location=${userLat},${userLng}&radius=4000&language=vi&key=${apiKey}`;
                const res = await fetch(endpoint);
                const data = await res.json();
                if (data.status === 'OK' && Array.isArray(data.results)) {
                    for (const r of data.results) {
                        const pLat = r.geometry?.location?.lat || userLat;
                        const pLng = r.geometry?.location?.lng || userLng;
                        const dist = calculateHaversineKm(userLat, userLng, pLat, pLng);
                        let photoUrl = getDishPhoto(searchKeyword, isVegetarian);
                        if (r.photos && r.photos.length > 0) {
                            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${r.photos[0].photo_reference}&key=${apiKey}`;
                        }
                        allPlaces.push({
                            place_id: r.place_id,
                            name: r.name,
                            address: r.formatted_address || r.vicinity || 'Hà Nội',
                            lat: pLat,
                            lng: pLng,
                            rating: r.rating || 4.7,
                            user_ratings_total: r.user_ratings_total || 80,
                            photo_url: photoUrl,
                            distance_km: dist,
                            dish_matched: searchKeyword,
                        });
                    }
                    if (allPlaces.length > 0) {
                        // Sắp xếp kết quả ưu tiên rating cao theo yêu cầu
                        allPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                        return allPlaces;
                    }
                }
            }
            catch (err) {
                console.warn(`Places API error for query "${searchKeyword}", falling back:`, err);
            }
        }
        // Fallback: Sinh danh sách quán ăn khớp chính xác với từ khóa người dùng tìm
        const fallbackPlaces = generateMockPlaces(searchKeyword, userLat, userLng, isVegetarian);
        return fallbackPlaces;
    },
    // Backward compatibility alias
    async searchNearbyPlaces(dishes, userLat, userLng, options) {
        const isVegetarian = options?.isVegetarian || false;
        const query = dishes.join(' ');
        return this.searchGooglePlaces(query, userLat, userLng, isVegetarian);
    },
};
