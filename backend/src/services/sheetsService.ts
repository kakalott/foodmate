// Dịch vụ ghi log ngầm sang Google Sheets (Google Apps Script Webhook)
export const logToGoogleSheets = async (type: 'Search_Logs' | 'Route_Logs' | string, data: Record<string, any>) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = { type, ...data };

    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
    console.log(`[Google Sheets] Đã ghi log thành công vào bảng ${type}`);
  } catch (error: any) {
    console.error(`[Google Sheets] Lỗi khi ghi log vào ${type}:`, error.message);
  }
};
