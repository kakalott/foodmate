/**
 * =========================================================================
 * FOODMATE - GOOGLE APPS SCRIPT SERVERLESS BACKEND PROXY (0 ĐỒNG, 0 VISA)
 * =========================================================================
 * Tính năng:
 * 1. doPost(e):
 *    - Nhận tọa độ GPS (lat, lng), món user tìm (query) từ Frontend.
 *    - Gọi API Open-Meteo lấy thời tiết thực tế (100% Free, không cần Key).
 *    - Gọi Google Gemini API bảo mật (Key giấu trong Script, không lộ trên client).
 *    - Ghi log tự động vào trang tính 'Search_Logs'.
 *    - Trả về lời chúc món ăn, sự thật thú vị và danh sách 3 món gợi ý.
 * 2. doGet(e):
 *    - Đọc dữ liệu từ bảng 'Search_Logs' để phục vụ bản đồ Admin (#/minh).
 * =========================================================================
 */

// Cấu hình API Key (Bạn có thể điền trực tiếp ở đây hoặc dùng Script Properties)
var GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || 'AQ.Ab8RN6I5GLfL6LmsiYgQ2--Y4PZNI1ajPbbronrv9tn7XZ67gQ';

// ─── 1. XỬ LÝ GET REQUEST (Admin Map #/minh) ───────────────────────────────
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Search_Logs');
    
    if (!sheet) {
      return createJsonResponse([]);
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse([]);
    }

    var logs = [];
    // Bỏ qua dòng tiêu đề (index 0)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var lat = parseFloat(row[2]);
      var lng = parseFloat(row[3]);
      if (!isNaN(lat) && !isNaN(lng)) {
        logs.push({
          id: 'gas-' + i,
          timestamp: row[0],
          session_id: row[1] || 'anonymous',
          lat: lat,
          lng: lng,
          query: row[4] || '',
          suggested: row[5] || '',
          weather: row[6] || ''
        });
      }
    }

    return createJsonResponse(logs);
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  }
}

// ─── 2. XỬ LÝ POST REQUEST (User Recommendation & Logging) ─────────────────
function doPost(e) {
  try {
    var contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    }

    var action = contents.action || contents.type;

    // Gợi ý món ăn + ghi log tự động
    if (action === 'recommend' || contents.lat || contents.query) {
      return handleRecommendation(contents);
    }

    // Ghi log đơn thuần từ hệ thống cũ
    if (action === 'Search_Logs' || contents.type === 'Search_Logs') {
      logSearchToSheet(contents);
      return createJsonResponse({ success: true, message: 'Logged to Search_Logs' });
    }

    return createJsonResponse({ success: false, message: 'Invalid action' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

// ─── 3. LOGIC XỬ LÝ GỢI Ý & AI ──────────────────────────────────────────────
function handleRecommendation(contents) {
  var lat = contents.lat || 21.0285;
  var lng = contents.lng || 105.8542;
  var query = contents.query || contents.specific_dish || '';
  var sessionId = contents.session_id || ('sess_' + new Date().getTime());

  // BƯỚC A: Lấy thời tiết thực tế từ Open-Meteo (Miễn phí 100%, không cần thẻ, không cần Key)
  var weatherInfo = getRealWeather(lat, lng);

  // BƯỚC B: Gọi Gemini AI để đề xuất 3 món ăn chuẩn vị
  var aiResult = callGeminiAI(lat, lng, weatherInfo.description, query);

  // BƯỚC C: Ghi nhận vết chân người dùng vào Google Sheets
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Search_Logs');
    if (!sheet) {
      sheet = ss.insertSheet('Search_Logs');
      sheet.appendRow(['Timestamp', 'Session ID', 'Latitude', 'Longitude', 'Query', 'Suggested Dishes', 'Weather']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }
    sheet.appendRow([
      new Date(),
      sessionId,
      lat,
      lng,
      query || 'Khám phá hôm nay ăn gì',
      aiResult.dishes.join(', '),
      weatherInfo.description
    ]);
  } catch (sheetErr) {
    Logger.log('Lỗi ghi sheet: ' + sheetErr);
  }

  // BƯỚC D: Định dạng dữ liệu trả về cho Frontend
  var places = aiResult.dishes.map(function(dishName, index) {
    return {
      place_id: 'gas-place-' + index,
      name: dishName,
      address: 'Món ăn đề xuất phù hợp thời tiết hôm nay',
      lat: lat,
      lng: lng,
      rating: 4.8
    };
  });

  var responsePayload = {
    success: true,
    ai_message: aiResult.comment,
    intro_message: aiResult.comment,
    comment: aiResult.comment,
    fun_fact: aiResult.fun_fact,
    dishes: aiResult.dishes,
    recommended_dishes: aiResult.dishes,
    places: places,
    google_places_results: places,
    weather: {
      temperature: weatherInfo.temperature,
      weather_code: 1,
      description: weatherInfo.description,
      area_label: 'Khu vực của bạn',
      observed_at: new Date().toISOString()
    }
  };

  return createJsonResponse(responsePayload);
}

// ─── 4. LẤY THỜI TIẾT THẬT QUA OPEN-METEO ──────────────────────────────────
function getRealWeather(lat, lng) {
  try {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng + '&current_weather=true';
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var data = JSON.parse(response.getContentText());
    var temp = Math.round(data.current_weather.temperature);
    var code = data.current_weather.weathercode;

    var desc = 'mát mẻ dễ chịu';
    if (code === 0) desc = 'trời nắng quang đãng';
    else if (code <= 3) desc = 'trời có mây rải rác';
    else if (code >= 51 && code <= 67) desc = 'trời có mưa phùn';
    else if (code >= 80) desc = 'trời có mưa rào';

    return {
      temperature: temp,
      description: temp + '°C, ' + desc
    };
  } catch (e) {
    return {
      temperature: 28,
      description: '28°C, mát mẻ dễ chịu'
    };
  }
}

// ─── 5. GỌI GEMINI API BẰNG URLFETCHAPP ─────────────────────────────────────
function callGeminiAI(lat, lng, weatherDesc, userQuery) {
  // Dự phòng model Flash để đảm bảo không dính hạn mức 429
  var models = ['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-flash-lite-latest'];
  var apiKey = GEMINI_API_KEY;

  var userPrompt = 'Bạn là FoodMate, người bạn đồng hành ẩm thực chân thành, vui vẻ cho giới trẻ, học sinh sinh viên và dân văn phòng tại Việt Nam.\n' +
    'Thời tiết hiện tại: ' + weatherDesc + '.\n';

  if (userQuery && userQuery.trim().length > 0) {
    userPrompt += 'Người dùng muốn ăn món hoặc phong cách: "' + userQuery.trim() + '". Hãy gợi ý 3 biến thể hoặc món ăn cực kỳ phù hợp.\n';
  } else {
    userPrompt += 'Người dùng chưa biết ăn gì. Dựa vào thời tiết, hãy đề xuất 3 món ăn chuẩn bài nhất hôm nay.\n';
  }

  userPrompt += '\nTrả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm Markdown ```json hoặc text thừa ngoài JSON) với cấu trúc sau:\n' +
    '{\n' +
    '  "comment": "Lời khuyên ngắn gọn, dí dỏm, truyền cảm hứng ăn uống (tối đa 2 câu).",\n' +
    '  "fun_fact": "Một sự thật thú vị hoặc nguồn gốc bất ngờ về món ăn được đề xuất.",\n' +
    '  "dishes": ["Tên món 1", "Tên món 2", "Tên món 3"]\n' +
    '}';

  for (var i = 0; i < models.length; i++) {
    var modelName = models[i];
    try {
      var endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;
      var payload = {
        contents: [
          {
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json'
        }
      };

      var res = UrlFetchApp.fetch(endpoint, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      var resCode = res.getResponseCode();
      if (resCode === 200) {
        var resJson = JSON.parse(res.getContentText());
        var rawText = resJson.candidates[0].content.parts[0].text;
        // Dọn sạch markdown nếu có
        var cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        var parsed = JSON.parse(cleanJson);
        if (parsed.dishes && parsed.dishes.length >= 3) {
          return {
            comment: parsed.comment || 'Thời tiết này ăn mấy món này là chuẩn bài luôn!',
            fun_fact: parsed.fun_fact || 'Món nước luôn giữ nhiệt tốt và giúp cơ thể sảng khoái hơn.',
            dishes: parsed.dishes.slice(0, 3)
          };
        }
      }
    } catch (apiError) {
      Logger.log('Lỗi gọi model ' + modelName + ': ' + apiError);
    }
  }

  // Fallback an toàn nếu API quá tải
  return {
    comment: 'Thời tiết ' + weatherDesc + ', cùng FoodMate thưởng thức những món ấm nóng này nhé!',
    fun_fact: 'Bún chả Hà Nội từng được cựu Tổng thống Obama và đầu bếp Anthony Bourdain tấm tắc khen ngợi.',
    dishes: userQuery ? [userQuery, 'Bún bò Huế', 'Cơm rang dưa bò'] : ['Phở bò nóng hổi', 'Bún chả Hà Nội', 'Bánh cuốn nóng']
  };
}

// ─── 6. HELPER GHI LOG SEARCH VÀO SHEET ─────────────────────────────────────
function logSearchToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Search_Logs');
  if (!sheet) {
    sheet = ss.insertSheet('Search_Logs');
    sheet.appendRow(['Timestamp', 'Session ID', 'Latitude', 'Longitude', 'Query', 'Suggested Dishes', 'Weather']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }
  sheet.appendRow([
    new Date(),
    data.session_id || 'anonymous',
    data.lat || '',
    data.lng || '',
    data.query || '',
    (data.suggested_dishes || []).join(', '),
    data.weather || ''
  ]);
}

// ─── 7. HELPER TẠO JSON OUTPUT ─────────────────────────────────────────────
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
