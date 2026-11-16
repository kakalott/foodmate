import { PlaceRestaurant, RecommendationRequest, RecommendationResponse, WeatherData } from '../types';
import { weatherService } from './weatherService';
import { placesService } from './placesService';
import { dbService } from './dataService';

// Bộ nhớ đệm ngắn hạn (Ring Buffer) lưu 10 fact vừa sinh gần nhất để chống trùng lặp hoàn toàn
const recentRouteFacts: string[] = [];

function rememberFact(fact: string) {
  if (!fact) return;
  recentRouteFacts.unshift(fact);
  if (recentRouteFacts.length > 10) {
    recentRouteFacts.pop();
  }
}

// Kho tàng 15+ Sự thật kỳ quặc, dị hợm, nổ não về thế giới ẩm thực khi offline
const MIND_BLOWING_FOOD_FACTS = [
  'Kẹo cao su từng được làm từ nhựa cây chicle của người Maya cổ đại, nhai để chống đói và thơm miệng!',
  'Mù tạt Wasabi thật làm từ rễ cây Wasabia japonica cực hiếm và đắt; 95% wasabi ngoài hàng thực chất là cải ngựa nhuộm xanh!',
  'Mật ong là thực phẩm duy nhất không bao giờ hỏng; các nhà khảo cổ đã ăn thử mật ong 3.000 năm tuổi trong lăng mộ Ai Cập vẫn ngon!',
  'Cà rốt nguyên bản có màu tím và vàng; người Hà Lan thế kỷ 17 đã lai tạo ra màu cam để tri ân Hoàng gia Oranje!',
  'Phô mai Casu Marzu của Ý chứa giòi sống lúc nhúc và có thể nhảy cao tới 15cm khi bạn chuẩn bị đưa vào miệng!',
  'Kem ốc quế ra đời năm 1904 tại Mỹ vì một người bán kem hết bát đựng, liền mượn bánh quế của quầy bên cạnh cuộn lại!',
  'Khoai tây chiên (French Fries) thực ra bắt nguồn từ nước Bỉ vào thế kỷ 17, khi dòng sông đóng băng khiến dân làng thái khoai chiên thay cá!',
  'Quả dưa hấu ruột vàng ngọt hơn dưa hấu đỏ và đã được người dân Ai Cập cổ đại trồng từ hơn 5.000 năm trước!',
  'Sô-cô-la từng được người Aztec và Maya dùng làm tiền tệ; 1 hạt cacao đổi được 1 quả cà chua, 100 hạt đổi được 1 con gà!',
  'Pizza Margherita có 3 màu đại diện cờ Ý: đỏ của sốt cà chua, trắng của phô mai mozzarella và xanh của lá húng tây basil!',
  'Chuối là loại quả mọng (berry) theo định nghĩa thực vật học, trong khi dâu tây thì lại không phải là quả mọng!',
  'Ớt cay thực chất không tạo ra nhiệt độ nóng; chất capsaicin chỉ đánh lừa các thụ thể thần kinh trên lưỡi rằng miệng đang bị bỏng!',
  'Quả táo có thể nổi trên mặt nước vì trong cấu trúc của một quả táo có tới 25% thể tích là không khí!',
  'Cà phê chồn đắt đỏ là nhờ hạt cà phê được lên men tự nhiên qua đường tiêu hóa của loài cầy hương hoang dã!',
  'Bánh quy may mắn (Fortune Cookie) không phải xuất xứ từ Trung Quốc, mà do những người nhập cư Nhật Bản sáng tạo tại Mỹ!',
];

function getRandomFallbackFact(): string {
  const available = MIND_BLOWING_FOOD_FACTS.filter((f) => !recentRouteFacts.includes(f));
  const pool = available.length > 0 ? available : MIND_BLOWING_FOOD_FACTS;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  rememberFact(picked);
  return picked;
}

// AI Commentator Fallback khi offline hoặc chưa cấu hình API Key
function getCommentatorAdvice(dish: string, weather: WeatherData, timeStr: string): string {
  const temp = Math.round(weather.temperature);
  const isColdOrCool = temp <= 25;
  const isRain = weather.weather_code >= 51 && weather.weather_code <= 82;
  const lower = dish.toLowerCase();

  if (lower.includes('pizza')) {
    return isColdOrCool || isRain
      ? `Lúc ${timeStr} thời tiết ${temp}°C se lạnh thế này mà bào một cái **Pizza** ngập phô mai kéo sợi thì nhức nách bạn ơi! Quanh đây có mấy tiệm làm pizza cực đỉnh nè.`
      : `Bây giờ ${timeStr} mà rủ hội cạ cứng làm một mâm **Pizza** phô mai giòn rụm với ly nước mát lạnh thì hết sảy! Mình gom ngay mấy quán gần chỗ bạn đây.`;
  }

  if (lower.includes('sushi') || lower.includes('nhật')) {
    return `Ui thèm **${dish}** thì gu ăn uống của bạn chuẩn bài luôn rồi! Tươi ngon thanh mát lại sang xịn, để mình chỉ ngay mấy quán chuẩn vị Nhật quanh đây nhé!`;
  }

  if (lower.includes('lẩu')) {
    return isColdOrCool || isRain
      ? `Trời mưa lạnh ${temp}°C thế này mà quây quần bên nồi **${dish}** chua cay xì xụp thì nhất bạn rồi! Quanh bạn có mấy quán lẩu bao phê luôn nè.`
      : `Làm một nồi **${dish}** lai rai cùng bạn bè thì chuẩn bài luôn! Quanh đây có nhiều quán ngon lắm đó.`;
  }

  if (isColdOrCool || isRain) {
    return `Thời tiết ${temp}°C mát mẻ thế này mà thưởng thức món **${dish}** nóng sốt thì ấm bụng vô cùng! Mình tìm thấy ngay các quán làm món này chuẩn vị quanh bạn đây.`;
  }

  return `Ui tự dưng thèm **${dish}** giống bạn ghê, tầm ${timeStr} đói lòng mà làm món này thì chuẩn bài luôn! Quanh đây có mấy quán làm món này đỉnh lắm nha.`;
}

// Fallback Fun fact theo món
function getDishFunFact(dish: string): string | null {
  const lower = dish.toLowerCase();
  if (lower.includes('pizza')) {
    return 'Bạn có biết: Pizza Margherita ban đầu được sáng tạo ở Napoli với 3 màu sắc đại diện cho quốc kỳ Ý (đỏ cà chua, trắng mozzarella, xanh húng quế)!';
  }
  if (lower.includes('phở')) {
    return 'Bạn có biết: Phở xuất hiện từ đầu thế kỷ 20 tại miền Bắc và được CNN nhiều lần bình chọn trong top những món nước ngon nhất thế giới!';
  }
  if (lower.includes('bún chả')) {
    return 'Bạn có biết: Bún chả ngon nhất là khi chả viên được nướng bằng kẹp tre trên than hoa hồng đượm, dậy mùi thơm của hành củ nướng!';
  }
  if (lower.includes('bánh mì')) {
    return 'Bạn có biết: Bánh mì Việt Nam bắt nguồn từ bánh baguette của Pháp, nhưng được biến tấu với lớp vỏ giòn rụm và ruột xốp nhẹ đặc trưng!';
  }
  if (lower.includes('sushi')) {
    return 'Bạn có biết: Nguyên bản thời cổ đại, sushi là phương pháp ủ cá lên men trong cơm để bảo quản chứ không ăn tươi sống như ngày nay!';
  }
  if (lower.includes('lẩu')) {
    return 'Bạn có biết: Lẩu bắt nguồn từ văn hóa ăn uống cộng đồng của người phương Đông, tượng trưng cho sự ấm cúng và sum vầy gia đình!';
  }
  return `Bạn có biết: ${dish} là món ăn được rất nhiều tín đồ sành ăn yêu thích nhờ hương vị đặc trưng khó quên!`;
}

// Fallback khi không có Textbox và AI offline
function getDefaultDishes(weather: WeatherData, timeStr: string): { comment: string; dishes: string[] } {
  const temp = Math.round(weather.temperature);
  const isColdOrRain = temp <= 25 || (weather.weather_code >= 51 && weather.weather_code <= 82);

  if (isColdOrRain) {
    return {
      comment: `Lúc ${timeStr} trời se lạnh mát mẻ ${temp}°C, xì xụp một bát bún phở hoặc quây quần bên mâm lẩu/nướng thì chuẩn bài luôn!`,
      dishes: ['Phở bò tái lăn', 'Cơm rang dưa bò', 'Bánh tráng nướng'],
    };
  }

  return {
    comment: `Bây giờ là ${timeStr}, thời tiết ${temp}°C dễ chịu, làm một đĩa cơm tấm thơm lừng hay bát bún chả thanh mát thì hết nước chấm!`,
    dishes: ['Bún chả Hà Nội', 'Cơm tấm sườn bì', 'Bánh xèo nem lụi'],
  };
}

export const geminiService = {
  // LUỒNG 1: Có Textbox - Đóng vai người bạn sành ăn, kèm Fun Fact nếu là món ăn
  async generateCommentaryAndFact(
    searchQuery: string,
    weather: WeatherData,
    timeStr: string
  ): Promise<{ comment: string; fun_fact: string | null }> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (apiKey) {
      try {
        const weatherDesc = `${weather.temperature}°C, ${weather.description}`;
        const prompt = `Đóng vai người bạn sành ăn. User muốn ăn '${searchQuery}' lúc ${timeStr}, thời tiết ${weatherDesc}. Hãy bình luận 1 câu vui vẻ, dí dỏm tán thành lựa chọn này.
ĐỒNG THỜI: Nếu '${searchQuery}' là một món ăn, hãy chọn ngẫu nhiên 1 chủ đề (Nguồn gốc lịch sử, Dinh dưỡng, Sự thật thú vị) và viết 1 fact cực ngắn (dưới 30 chữ) bắt đầu bằng 'Bạn có biết:'. Nếu không phải món ăn, để fun_fact là null.
Trả về định dạng JSON: { "comment": "Câu bình luận...", "fun_fact": "Bạn có biết: ... hoặc null" }`;

        console.log('Payload to Gemini (Commentary & Fact Mode - Có Textbox):\n', prompt);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.95,
                response_mime_type: 'application/json',
              },
            }),
          }
        );

        const data: any = await res.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Gemini Response (Commentary & Fact):\n', rawJsonText || data);

        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText);
          const comment = parsed.comment?.trim() || getCommentatorAdvice(searchQuery, weather, timeStr);
          const fun_fact = parsed.fun_fact ? parsed.fun_fact.trim() : null;
          return { comment, fun_fact };
        }
      } catch (err) {
        console.warn('Gemini commentary & fact failed, using fallback:', err);
      }
    }

    return {
      comment: getCommentatorAdvice(searchQuery, weather, timeStr),
      fun_fact: getDishFunFact(searchQuery),
    };
  },

  // LUỒNG 2: Không Textbox - AI tự suy luận sáng tạo 3 món ăn khác biệt hoàn toàn (JSON { comment, dishes })
  async generateAiSuggestionWithoutTextbox(
    weather: WeatherData,
    timeStr: string
  ): Promise<{ comment: string; dishes: string[] }> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (apiKey) {
      try {
        const weatherDesc = `${weather.temperature}°C, ${weather.description}`;
        const prompt = `Đóng vai người bạn sành ăn, cực kỳ sáng tạo. Lúc này là ${timeStr}, thời tiết ${weatherDesc}. User không biết ăn gì. Hãy sáng tạo 1 câu dạo đầu tự nhiên và nghĩ ra chính xác 3 món ăn khác biệt hoàn toàn (đừng gò bó món truyền thống) cực kỳ phù hợp lúc này. Đừng lặp lại các đề xuất cũ. Trả về định dạng JSON: { "comment": "Câu dạo đầu...", "dishes": ["Món A", "Món B", "Món C"] }`;

        console.log('Payload to Gemini (Suggestion Mode - Không Textbox):\n', prompt);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.95,
                response_mime_type: 'application/json',
              },
            }),
          }
        );

        const data: any = await res.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Gemini JSON Response (Không Textbox):\n', rawJsonText || data);

        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText);
          const comment = (parsed.comment || '').trim();
          let dishes: string[] = Array.isArray(parsed.dishes) ? parsed.dishes : [];
          // Lấy chính xác tối đa 3 món
          dishes = dishes.slice(0, 3);

          if (dishes.length > 0) {
            return {
              comment: comment || getCommentatorAdvice(dishes.join(' & '), weather, timeStr),
              dishes,
            };
          }
        }
      } catch (err) {
        console.warn('Gemini suggestion without textbox failed, using fallback:', err);
      }
    }

    return getDefaultDishes(weather, timeStr);
  },

  // LUỒNG TÌM ĐƯỜNG: Sinh fact "nổ não", kỳ dị, bất ngờ về ẩm thực thế giới
  // KHÔNG gò bó vào quán hay món ăn hiện tại, CHỐNG TRÙNG LẶP với danh sách đã sinh gần đây
  async generateRouteFact(restaurantName?: string, dishName?: string): Promise<string> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (apiKey) {
      try {
        const historyConstraint = recentRouteFacts.length > 0
          ? `\nTUYỆT ĐỐI TRÁNH lặp lại hoặc có chủ đề tương tự các fact sau đây:\n- ${recentRouteFacts.join('\n- ')}`
          : '';

        const prompt = `Hãy đóng vai một chuyên gia ẩm thực kỳ quặc và hài hước. Người dùng đang trên đường đi ăn.
Nhiệm vụ: Hãy chia sẻ 1 sự thật CỰC KỲ BẤT NGỜ, KỲ DỊ hoặc "NỔ NÃO" (mind-blowing / bizarre food fact) về ẩm thực trên thế giới (Ví dụ: nguồn gốc kỳ quái của một món ăn nổi tiếng, thói quen ăn uống quái dị của một nền văn hóa, thực phẩm từng làm tiền tệ, sinh vật kỳ lạ thành đặc sản, hoặc hiểu lầm tai hại về đồ ăn).
YÊU CẦU:
1. KHÔNG cần bám sát quán '${restaurantName || 'quán ăn'}' hay món '${dishName || 'món ăn'}'. Tự do chọn chủ đề quái lạ nhất.
2. KHÔNG nói đạo lý dinh dưỡng nhàm chán (kiểu ăn rau sáng mắt, uống nước đẹp da).
3. Độ dài: Cực kỳ ngắn gọn, sắc bén (dưới 30 từ tiếng Việt), bắt đầu bằng giọng điệu bất ngờ (VD: "Bạn có biết...", "Sự thật nổ não:...").
${historyConstraint}
Trả về định dạng JSON duy nhất: { "route_fact": "..." }`;

        console.log('Payload to Gemini (Mind-Blowing Route Fact Mode):\n', prompt);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 1.0, // Đẩy mức sáng tạo lên cao nhất để fact luôn mới mẻ
                response_mime_type: 'application/json',
              },
            }),
          }
        );

        const data: any = await res.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText);
          if (parsed.route_fact && parsed.route_fact.trim()) {
            const fact = parsed.route_fact.trim();
            rememberFact(fact);
            return fact;
          }
        }
      } catch (err) {
        console.warn('Gemini mind-blowing route fact failed, using fallback:', err);
      }
    }

    return getRandomFallbackFact();
  },

  async getRecommendations(req: RecommendationRequest): Promise<RecommendationResponse> {
    const userLat = typeof req.lat === 'number' ? req.lat : 21.0285;
    const userLng = typeof req.lng === 'number' ? req.lng : 105.8542;
    const rawDish = (req.specific_dish || req.specificDish || '').trim();

    // 1. Xác định thời gian thực tế
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 2. Lấy thời tiết hiện tại
    let weather: WeatherData;
    try {
      weather = await weatherService.getCurrentWeather(userLat, userLng);
    } catch {
      weather = {
        temperature: 24,
        weather_code: 2,
        description: 'Mát mẻ dễ chịu',
        area_label: 'Hà Nội',
        observed_at: new Date().toISOString(),
      };
    }

    let commentary = '';
    let fun_fact: string | null = null;
    let finalDishes: string[] = [];
    let places: PlaceRestaurant[] = [];

    // ==========================================
    // LUỒNG 1: CÓ TEXTBOX (Định hướng trực tiếp)
    // ==========================================
    if (rawDish) {
      finalDishes = [rawDish];

      // Chạy song song: Google Places API tìm kiếm và Gemini bình luận + fun fact
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

      // Bước 2: Backend xử lý ĐA LUỒNG với Promise.all gọi song song Google Places API cho từng món
      const placePromises = finalDishes.map((dish) =>
        placesService.searchGooglePlaces(dish, userLat, userLng)
      );
      const placesArrays = await Promise.all(placePromises);

      // Bước 3: Gom kết quả Top đầu từ mỗi món, lọc trùng lặp place_id
      const mergedPlaces: PlaceRestaurant[] = [];
      const seenIds = new Set<string>();

      placesArrays.forEach((arr) => {
        const topOfDish = arr.slice(0, 4);
        for (const p of topOfDish) {
          if (!seenIds.has(p.place_id)) {
            seenIds.add(p.place_id);
            mergedPlaces.push(p);
          }
        }
      });

      // Sắp xếp ưu tiên quán có rating cao
      mergedPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      places = mergedPlaces;
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

    // 6. Trả về kết quả kèm fun_fact
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
