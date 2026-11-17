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

// Fallback Fun fact theo món - Kho bí ẩn dị hợm, nổ não, không rập khuôn theo từ khóa món
const DISH_MYSTERY_FALLBACKS: Record<string, string[]> = {
  pizza: [
    'Năm 2001, Pizza Hut từng chi hơn 1 triệu USD để đưa một chiếc pizza lên Trạm Vũ trụ Quốc tế ISS cho phi hành gia thưởng thức!',
    'Vào thế kỷ 18 ở Napoli, pizza từng bị tầng lớp quý tộc coi là món ăn kinh tởm và bẩn thỉu chỉ dành cho dân bần cùng!',
    'Kỷ lục chiếc pizza lớn nhất thế giới có diện tích tới 1.261 m² và hoàn toàn không chứa gluten!',
    'Một số nhà khoa học đã chứng minh toán học: Một chiếc pizza đường kính 45cm có diện tích bề mặt lớn hơn hai chiếc pizza đường kính 30cm gộp lại!'
  ],
  phở: [
    'Phi hành gia Phạm Tuân từng mang nước dùng phở đóng gói đông khô lên vũ trụ trong chuyến bay lịch sử năm 1980!',
    'Hương thơm gây nghiện đặc trưng của phở đến từ phản ứng Maillard giữa xương bò nướng cháy cạnh và hợp chất anethole trong đại hồi quế!',
    'Thời bao cấp từng có món "phở không người lái" — tức là bát phở hoàn toàn không có thịt nhưng người ta vẫn xếp hàng từ 4 giờ sáng để ăn nước dùng!'
  ],
  'bún chả': [
    'Kỹ thuật kẹp chả bằng thanh tre tươi nướng than hoa tạo ra một lớp tinh dầu tre tự nhiên ngấm vào thịt mà vỉ sắt hiện đại không tài nào bắt chước được!',
    'Năm 2016, cố đầu bếp lừng danh Anthony Bourdain đã chiêu đãi Tổng thống Obama món bún chả và hoá đơn huyền thoại chỉ hết vỏn vẹn 6 USD!'
  ],
  'bánh mì': [
    'Bánh mì Việt Nam giòn rỗng ruột khác biệt hẳn baguette Pháp là nhờ thợ bánh thời xưa dùng lò gạch kín giữ hơi nước cực cao và pha bột gạo vào bột mì!',
    'Năm 2011, từ "Banh mi" đã chính thức được đưa nguyên bản vào từ điển Oxford mà không cần dịch là sandwich hay baguette!'
  ],
  sushi: [
    'Sushi nguyên bản hàng ngàn năm trước (Narezushi) là món cá ủ lên men chua với cơm trong cả năm trời, và người ta vứt bỏ hết cơm đi chỉ ăn cá!',
    'Đầu bếp làm sushi truyền thống tại Nhật phải mất tới 3 năm đầu chỉ để học mỗi một việc là... vo gạo và nấu cơm sushi đạt chuẩn!'
  ],
  lẩu: [
    'Tổ tiên của nồi lẩu bắt nguồn từ các chiến binh Mông Cổ thời Thành Cát Tư Hãn, họ dùng ngay mũ sắt lộn ngược làm nồi đun nước sôi giữa thảo nguyên tuyết phủ!',
    'Tại Trùng Khánh, có một nồi lẩu khổng lồ giữ kỷ lục Guinness chứa được hàng tấn nước dùng và cùng lúc phục vụ cho 56 người ngồi ăn xung quanh!'
  ]
};

function getDishFunFact(dish: string): string | null {
  const lower = dish.toLowerCase();
  for (const [key, facts] of Object.entries(DISH_MYSTERY_FALLBACKS)) {
    if (lower.includes(key)) {
      return facts[Math.floor(Math.random() * facts.length)];
    }
  }

  // Nếu không khớp từ khóa cụ thể, rút ngẫu nhiên 1 sự thật bất ngờ từ kho fact ẩm thực thế giới
  return getRandomFallbackFact();
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
  // LUỒNG 1: Có Textbox - Đóng vai chuyên gia bí ẩn ẩm thực kỳ quái thế giới (Master Prompt: Nhiệm vụ 1 & 2)
  async generateCommentaryAndFact(
    searchQuery: string,
    weather: WeatherData,
    timeStr: string
  ): Promise<{ comment: string; fun_fact: string | null }> {
    const apiKey = await dbService.getEffectiveApiKey('gemini');

    if (apiKey) {
      try {
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

        console.log('Payload to Gemini (Commentary & Fact Mode - Master Prompt Có Textbox):\n', prompt);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 1.0, // Mức cao nhất để tạo tính ngẫu nhiên, chống rập khuôn
                topP: 0.95,       // Mở rộng vốn từ vựng và ý tưởng được phép sử dụng
                topK: 64,
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
          let fun_fact = parsed.fun_fact ? parsed.fun_fact.trim() : null;
          if (fun_fact && !fun_fact.startsWith('💡')) {
            fun_fact = `💡 ${fun_fact}`;
          }
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
    const anyReq = req as any;
    const userLat = typeof req.lat === 'number' ? req.lat : (typeof anyReq.origin_lat === 'number' ? anyReq.origin_lat : 21.0285);
    const userLng = typeof req.lng === 'number' ? req.lng : (typeof anyReq.origin_lng === 'number' ? anyReq.origin_lng : 105.8542);
    const rawDish = (req.specific_dish || req.specificDish || anyReq.textbox_value || anyReq.text || '').trim();

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
