// Dịch vụ ghi log ngầm sang Google Sheets (Google Apps Script Webhook)
export const logToGoogleSheets = async (type: 'Search_Logs' | 'Route_Logs' | string, data: Record<string, any>) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(`[Google Sheets] Bỏ qua ghi log ${type}: Chưa cấu hình GOOGLE_SHEETS_WEBHOOK_URL trong .env`);
    return;
  }

  try {
    const payload = { type, ...data };
    console.log(`[Google Sheets] Đang gửi payload tới ${type}:`, JSON.stringify(payload));

    const res = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
    const resText = await res.text();
    console.log(`[Google Sheets] Đã ghi log thành công vào bảng ${type}. Phản hồi:`, resText);
  } catch (error: any) {
    console.error(`[Google Sheets] Lỗi khi ghi log vào ${type}:`, error.message);
  }
};
