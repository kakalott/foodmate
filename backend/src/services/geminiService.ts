import { RecommendationRequest, RecommendationResponse, WeatherData } from '../types';
import { weatherService } from './weatherService';
import { dbService } from './dataService';

// Danh sách các model Flash Lite tối ưu cho Free Tier
const FLASH_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
];

async function callGeminiApi(apiKey: string, prompt: string): Promise<string> {
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
              response_mime_type: 'application/json',
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
  // LUỒNG 1: Có Textbox - Đóng vai chuyên gia ẩm thực dí dỏm, kèm sự thật độc lạ
  async generateCommentaryAndFact(
    searchQuery: string,
    weather: WeatherData,
    timeStr: string
  ): Promise<{ comment: string; fun_fact: string | null; foods: string[] }> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (!apiKey) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ.');
    }

    const weatherDesc = weather.description;
    const prompt = `
Bối cảnh: Người dùng muốn ăn món '${searchQuery}', lúc này là ${timeStr}, thời tiết đang ${weatherDesc}.
Nhiệm vụ 1: Đóng vai người bạn sành ăn dí dỏm, bình luận 1 câu thật tự nhiên (dưới 25 chữ) tán thành lựa chọn này phù hợp với thời tiết.
Nhiệm vụ 2: Đóng vai một chuyên gia săn lùng những bí ẩn ẩm thực kỳ quái nhất thế giới. Tìm ra 1 sự thật "nổ não", kỳ cục hoặc cực kỳ hiếm người biết về '${searchQuery}' (dưới 40 chữ).
Nhiệm vụ 3: Liệt kê chính xác từ 1 đến 3 biến thể/phiên bản ngon nhất của món '${searchQuery}' (Ví dụ nếu tìm 'phở' thì gợi ý: ["Phở bò tái lăn", "Phở gà đùi lá chanh", "Phở xào bắp bò"]).

Trả về đúng định dạng JSON:
{
  "comment": "Câu bình luận ở nhiệm vụ 1",
  "fun_fact": "💡 Bạn có biết: [Sự thật nổ não ở nhiệm vụ 2]",
  "foods": ["Biến thể 1", "Biến thể 2", "Biến thể 3"]
}
`;

    const rawJsonText = await callGeminiApi(apiKey, prompt);
    const parsed = JSON.parse(rawJsonText);
    const comment = parsed.comment?.trim() || `Món ${searchQuery} lúc này là chuẩn bài luôn!`;
    let fun_fact = parsed.fun_fact ? parsed.fun_fact.trim() : null;
    if (fun_fact && !fun_fact.startsWith('💡')) {
      fun_fact = `💡 ${fun_fact}`;
    }
    const foods = Array.isArray(parsed.foods) && parsed.foods.length > 0 ? parsed.foods.slice(0, 3) : [searchQuery];
    return { comment, fun_fact, foods };
  },

  // LUỒNG 2: Không Textbox - AI tự suy luận sáng tạo 3 món ăn khác biệt hoàn toàn
  async generateAiSuggestionWithoutTextbox(
    weather: WeatherData,
    timeStr: string
  ): Promise<{ comment: string; fun_fact: string | null; foods: string[] }> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (!apiKey) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ.');
    }

    const weatherDesc = weather.description;
    const prompt = `Đóng vai người bạn sành ăn dí dỏm. Lúc này là ${timeStr}, thời tiết thực tế là ${weatherDesc}. Người dùng không biết hôm nay nên ăn gì.
Nhiệm vụ:
1. "comment": 1 câu dạo đầu ngắn gọn, vui vẻ và tự nhiên (dưới 25 chữ) dẫn dắt theo thời tiết.
2. "fun_fact": 1 sự thật bất ngờ, kỳ dị hoặc thú vị về thế giới ẩm thực (dưới 35 chữ).
3. "foods": Mảng chứa đúng 3 món ăn khác biệt hoàn toàn cực kỳ hợp lúc này (ví dụ: 1 món nước, 1 món khô/cơm, 1 món ăn vặt hoặc ẩm thực quốc tế). Tên món ngắn gọn dưới 4 từ tiếng Việt.

Trả về đúng định dạng JSON:
{
  "comment": "Câu dạo đầu...",
  "fun_fact": "💡 Bạn có biết: ...",
  "foods": ["Món 1", "Món 2", "Món 3"]
}`;

    const rawJsonText = await callGeminiApi(apiKey, prompt);
    const parsed = JSON.parse(rawJsonText);
    const comment = (parsed.comment || '').trim();
    let fun_fact = parsed.fun_fact ? parsed.fun_fact.trim() : null;
    if (fun_fact && !fun_fact.startsWith('💡')) {
      fun_fact = `💡 ${fun_fact}`;
    }
    let foods: string[] = Array.isArray(parsed.foods) ? parsed.foods : (Array.isArray(parsed.dishes) ? parsed.dishes : []);
    foods = foods.slice(0, 3);

    if (foods.length === 0) {
      throw new Error('Gemini không trả về danh sách món ăn hợp lệ.');
    }

    return { comment, fun_fact, foods };
  },

  async getRecommendations(req: RecommendationRequest): Promise<RecommendationResponse> {
    const anyReq = req as any;
    const userLat = typeof req.lat === 'number' ? req.lat : (typeof anyReq.origin_lat === 'number' ? anyReq.origin_lat : 21.0285);
    const userLng = typeof req.lng === 'number' ? req.lng : (typeof anyReq.origin_lng === 'number' ? anyReq.origin_lng : 105.8542);
    const rawDish = (req.specific_dish || req.specificDish || anyReq.textbox_value || anyReq.text || '').trim();

    // 1. Xác định thời gian thực tế
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 2. Lấy thời tiết THẬT 100% (OpenWeatherMap / Open-Meteo)
    const weather = await weatherService.getCurrentWeather(userLat, userLng);

    let commentary = '';
    let fun_fact: string | null = null;
    let finalFoods: string[] = [];

    // ==========================================
    // LUỒNG 1: CÓ TEXTBOX (Định hướng theo từ khóa món)
    // ==========================================
    if (rawDish) {
      const aiRes = await geminiService.generateCommentaryAndFact(rawDish, weather, timeStr);
      commentary = aiRes.comment;
      fun_fact = aiRes.fun_fact;
      finalFoods = aiRes.foods;
    }
    // ==========================================
    // LUỒNG 2: KHÔNG CÓ TEXTBOX (AI Khám phá 3 món phù hợp thời tiết)
    // ==========================================
    else {
      const aiRes = await geminiService.generateAiSuggestionWithoutTextbox(weather, timeStr);
      commentary = aiRes.comment;
      fun_fact = aiRes.fun_fact;
      finalFoods = aiRes.foods;
    }

    // 3. Chuẩn hóa PlaceRestaurant ảo dùng cho Deep Link (mỗi món tương ứng 1 thẻ Deep Link)
    const deepLinkPlaces = finalFoods.map((food, idx) => ({
      place_id: `deeplink_${idx}_${encodeURIComponent(food)}`,
      name: food,
      address: `Tìm các quán "${food}" gần vị trí của bạn trên Google Maps`,
      lat: userLat,
      lng: userLng,
      dish_matched: food,
      rating: 4.8,
      user_ratings_total: 100,
    }));

    // 4. Bắn Webhook lưu Log vào Google Sheets (bảng Search_Logs)
    try {
      await Promise.all([
        dbService.saveSearchLog({
          weather_context: weather.description,
          budget: 'Không áp dụng',
          suggested_dishes: finalFoods,
        }),
        dbService.saveUserLocation({
          lat: userLat,
          lng: userLng,
          session_id: req.session_id || anyReq.sessionId || 'guest_sess_' + Math.random().toString(36).substring(2, 7),
          query: rawDish || finalFoods.join(', '),
        }),
      ]);
    } catch (saveErr) {
      console.warn('Lỗi ghi log tọa độ:', saveErr);
    }

    // 5. Trả kết quả sạch sẽ về Frontend
    return {
      intro_message: commentary,
      ai_message: commentary,
      message: commentary,
      fun_fact,
      recommended_dishes: finalFoods,
      dishes: finalFoods,
      google_places_results: deepLinkPlaces,
      places: deepLinkPlaces,
      weather,
    };
  },
};
