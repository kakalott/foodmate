import { PlaceRestaurant, RecommendationRequest, RecommendationResponse, WeatherData } from '../types';
import { weatherService } from './weatherService';
import { placesService } from './placesService';
import { dbService } from './dataService';

// Danh sách các model Flash Lite tối ưu nhất cho Free Tier
// Tự động xoay tua để không bao giờ bị 429 hay 404
const FLASH_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
];

async function callGeminiApi(apiKey: string, prompt: string, isJson: boolean = true): Promise<string> {
  let lastError: any = null;

  for (const model of FLASH_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 1.0,
              topP: 0.95,
              ...(isJson ? { response_mime_type: 'application/json' } : {}),
            },
          }),
        }
      );

      const data: any = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        return rawText;
      }

      if (data?.error) {
        lastError = data.error;
        console.warn(`[Gemini Flash] Model ${model} gặp lỗi:`, data.error.message);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Flash] Model ${model} fetch failed:`, err.message);
    }
  }

  throw new Error(
    `Gemini API lỗi: ${lastError?.message || 'Không có phản hồi từ máy chủ Gemini'}`
  );
}

export const geminiService = {
  // LUỒNG 1: Có Textbox - Đóng vai chuyên gia bí ẩn ẩm thực kỳ quái thế giới
  async generateCommentaryAndFact(
    searchQuery: string,
    weather: WeatherData,
    timeStr: string
  ): Promise<{ comment: string; fun_fact: string | null }> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (!apiKey) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ.');
    }

    const weatherDesc = `${weather.temperature}°C, ${weather.description}`;
    const prompt = `
Bối cảnh: Người dùng muốn ăn món '${searchQuery}', lúc này là ${timeStr}, thời tiết đang ${weatherDesc}.
Nhiệm vụ 1: Đóng vai người bạn dí dỏm, bình luận 1 câu thật tự nhiên (dưới 20 chữ) để tán thành lựa chọn này.
Nhiệm vụ 2: Đóng vai một chuyên gia săn lùng những bí ẩn ẩm thực kỳ quái nhất thế giới. Nếu '${searchQuery}' là một món ăn hoặc nguyên liệu hợp lệ, hãy tìm ra 1 sự thật "nổ não", kỳ cục, hoặc cực kỳ hiếm người biết về nó (dưới 40 chữ). 

Yêu cầu BẮT BUỘC cho Nhiệm vụ 2:
- TUYỆT ĐỐI KHÔNG dùng kiến thức đại trà (ví dụ cấm nói: pizza xuất xứ từ Ý, cà rốt sáng mắt, trà sữa nhiều đường...).
- Hãy tự động random ngẫu nhiên 1 trong vô vàn góc độ sau để không bao giờ lặp lại: một tai nạn lịch sử tạo ra món đó, một định luật hóa học kỳ lạ khi nấu, một quốc gia từng bỏ tù người ăn món này, hoặc một kỷ lục Guinness điên rồ.
- Nếu '${searchQuery}' không phải đồ ăn, trả về fun_fact là null.

Trả về đúng định dạng JSON:
{
  "comment": "Câu bình luận ở nhiệm vụ 1",
  "fun_fact": "💡 Bạn có biết: [Sự thật nổ não ở nhiệm vụ 2]"
}
`;

    const rawJsonText = await callGeminiApi(apiKey, prompt, true);
    const parsed = JSON.parse(rawJsonText);
    const comment = parsed.comment?.trim() || `Tuyệt vời, món ${searchQuery} rất hợp lúc này!`;
    let fun_fact = parsed.fun_fact ? parsed.fun_fact.trim() : null;
    if (fun_fact && !fun_fact.startsWith('💡')) {
      fun_fact = `💡 ${fun_fact}`;
    }
    return { comment, fun_fact };
  },

  // LUỒNG 2: Không Textbox - AI tự suy luận sáng tạo 3 món ăn khác biệt hoàn toàn (JSON { comment, dishes })
  async generateAiSuggestionWithoutTextbox(
    weather: WeatherData,
    timeStr: string
  ): Promise<{ comment: string; dishes: string[] }> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (!apiKey) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ.');
    }

    const weatherDesc = `${weather.temperature}°C, ${weather.description}`;
    const prompt = `Đóng vai người bạn sành ăn, cực kỳ sáng tạo. Lúc này là ${timeStr}, thời tiết ${weatherDesc}. User không biết ăn gì. Hãy sáng tạo 1 câu dạo đầu ngắn gọn, vui vẻ và nghĩ ra chính xác 3 loại món ăn khác biệt hoàn toàn (ví dụ: một món nước, một món khô/cơm, một món ăn vặt hoặc ẩm thực quốc tế) cực kỳ phù hợp lúc này.
LƯU Ý QUAN TRỌNG: Tên món ăn trong mảng 'dishes' PHẢI là tên ngắn gọn (dưới 4 từ tiếng Việt, ví dụ: "Bún ốc sườn", "Cơm rang dưa bò", "Bánh tráng nướng") để hệ thống bản đồ định vị chính xác quán ăn xung quanh.
Trả về định dạng JSON: { "comment": "Câu dạo đầu...", "dishes": ["Tên món 1", "Tên món 2", "Tên món 3"] }`;

    const rawJsonText = await callGeminiApi(apiKey, prompt, true);
    const parsed = JSON.parse(rawJsonText);
    const comment = (parsed.comment || '').trim();
    let dishes: string[] = Array.isArray(parsed.dishes) ? parsed.dishes : [];
    dishes = dishes.slice(0, 3);

    if (dishes.length === 0) {
      throw new Error('Gemini không trả về danh sách món ăn hợp lệ.');
    }

    return { comment, dishes };
  },

  // LUỒNG TÌM ĐƯỜNG: Sinh fact "nổ não", kỳ dị, bất ngờ về ẩm thực thế giới
  async generateRouteFact(restaurantName?: string, dishName?: string): Promise<string> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (!apiKey) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ.');
    }

    const prompt = `Hãy đóng vai một chuyên gia ẩm thực kỳ quặc và hài hước. Người dùng đang trên đường đi ăn tại '${restaurantName || 'quán ăn'}' (${dishName || 'món ngon'}).
Nhiệm vụ: Hãy chia sẻ 1 sự thật CỰC KỲ BẤT NGỜ, KỲ DỊ hoặc "NỔ NÃO" (mind-blowing / bizarre food fact) về ẩm thực trên thế giới (Ví dụ: nguồn gốc kỳ quái của một món ăn nổi tiếng, thói quen ăn uống quái dị của một nền văn hóa, thực phẩm từng làm tiền tệ, sinh vật kỳ lạ thành đặc sản, hoặc hiểu lầm tai hại về đồ ăn).
YÊU CẦU:
1. KHÔNG cần bám sát quán '${restaurantName || 'quán ăn'}' hay món '${dishName || 'món ăn'}'. Tự do chọn chủ đề quái lạ nhất.
2. KHÔNG nói đạo lý dinh dưỡng nhàm chán (kiểu ăn rau sáng mắt, uống nước đẹp da).
3. Độ dài: Cực kỳ ngắn gọn, sắc bén (dưới 30 từ tiếng Việt), bắt đầu bằng giọng điệu bất ngờ (VD: "Bạn có biết...", "Sự thật nổ não:...").
Trả về định dạng JSON duy nhất: { "route_fact": "..." }`;

    const rawJsonText = await callGeminiApi(apiKey, prompt, true);
    const parsed = JSON.parse(rawJsonText);
    if (parsed.route_fact && parsed.route_fact.trim()) {
      return parsed.route_fact.trim();
    }

    throw new Error('Không thể tạo fact chỉ đường từ Gemini.');
  },

  async getRecommendations(req: RecommendationRequest): Promise<RecommendationResponse> {
    const anyReq = req as any;
    const userLat = typeof req.lat === 'number' ? req.lat : (typeof anyReq.origin_lat === 'number' ? anyReq.origin_lat : 21.0285);
    const userLng = typeof req.lng === 'number' ? req.lng : (typeof anyReq.origin_lng === 'number' ? anyReq.origin_lng : 105.8542);
    const rawDish = (req.specific_dish || req.specificDish || anyReq.textbox_value || anyReq.text || '').trim();

    // 1. Xác định thời gian thực tế
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 2. Lấy thời tiết hiện tại
    const weather = await weatherService.getCurrentWeather(userLat, userLng);

    let commentary = '';
    let fun_fact: string | null = null;
    let finalDishes: string[] = [];
    let places: PlaceRestaurant[] = [];

    // ==========================================
    // LUỒNG 1: CÓ TEXTBOX (Định hướng trực tiếp 100% bằng chuỗi người dùng nhập)
    // ==========================================
    if (rawDish) {
      finalDishes = [rawDish];

      // Chạy song song: TrackAsia API tìm kiếm trực tiếp bằng rawDish và Gemini sinh commentary + fun fact
      const [placesRes, commentAndFactRes] = await Promise.all([
        placesService.searchGooglePlaces(rawDish, userLat, userLng),
        geminiService.generateCommentaryAndFact(rawDish, weather, timeStr),
      ]);

      places = placesRes;
      commentary = commentAndFactRes.comment;
      fun_fact = commentAndFactRes.fun_fact;
    }
    // ==========================================
    // LUỒNG 2: KHÔNG CÓ TEXTBOX (AI Đề xuất 3 món - Đa luồng Multi-query)
    // ==========================================
    else {
      // Bước 1: Gemini tự suy luận và chọn chính xác 3 món ăn { comment, dishes }
      const aiResult = await geminiService.generateAiSuggestionWithoutTextbox(weather, timeStr);
      commentary = aiResult.comment;
      finalDishes = aiResult.dishes;

      // Bước 2: Backend xử lý ĐA LUỒNG với Promise.all gọi song song TrackAsia cho từng món
      const placePromises = finalDishes.map((dish) =>
        placesService.searchGooglePlaces(dish, userLat, userLng)
      );
      const placesArrays = await Promise.all(placePromises);

      // Bước 3: Gom kết quả Top đầu từ mỗi món, lọc trùng lặp place_id
      const mergedPlaces: PlaceRestaurant[] = [];
      const seenIds = new Set<string>();

      placesArrays.forEach((arr) => {
        const topOfDish = arr.slice(0, 3);
        for (const p of topOfDish) {
          if (!seenIds.has(p.place_id)) {
            seenIds.add(p.place_id);
            mergedPlaces.push(p);
          }
        }
      });

      // Sắp xếp ưu tiên quán gần nhất
      mergedPlaces.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
      places = mergedPlaces.slice(0, 6);
    }

    // 5. Ghi log tìm kiếm & Tự động lưu tọa độ xuất phát của người dùng (Bản đồ User)
    try {
      await Promise.all([
        dbService.saveSearchLog({
          weather_context: `${weather.temperature}°C - ${weather.description}`,
          budget: 'Không áp dụng',
          suggested_dishes: finalDishes,
        }),
        dbService.saveUserLocation({
          lat: userLat,
          lng: userLng,
          session_id: req.session_id || 'guest_sess_' + Math.random().toString(36).substring(2, 7),
          query: rawDish || finalDishes.join(', '),
        }),
      ]);
      console.log(`📍 [BẢN ĐỒ USER] Đã lưu tọa độ bắt đầu: lat=${userLat}, lng=${userLng}, session=${req.session_id}, query=${rawDish || finalDishes.join(', ')}`);
    } catch (saveErr) {
      console.warn('Lỗi ghi log / lưu tọa độ xuất phát:', saveErr);
    }

    // 6. Trả về kết quả
    return {
      intro_message: commentary,
      ai_message: commentary,
      message: commentary,
      fun_fact,
      recommended_dishes: finalDishes,
      dishes: finalDishes,
      google_places_results: places,
      places: places,
      weather,
    };
  },
};
