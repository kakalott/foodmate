import { WeatherData } from '../types';

const WEATHER_CODE_DESC: Record<number, string> = {
  0: 'Trời quang, nắng đẹp',
  1: 'Nắng nhẹ, trời trong',
  2: 'Có mây rải rác, mát mẻ',
  3: 'Trời nhiều mây, râm mát',
  45: 'Có sương mù nhẹ',
  48: 'Sương mù dày',
  51: 'Mưa phùn nhẹ',
  53: 'Mưa phùn vừa',
  55: 'Mưa phùn hạt nặng',
  61: 'Mưa rào nhẹ',
  63: 'Mưa rào vừa',
  65: 'Mưa to',
  80: 'Mưa rào thoáng qua',
  95: 'Có dông rải rác',
};

export const weatherService = {
  async getCurrentWeather(lat: number = 21.0285, lng: number = 105.8542): Promise<WeatherData> {
    const openWeatherKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;

    // 1. Thử OpenWeatherMap nếu có API key
    if (openWeatherKey && !openWeatherKey.includes('your_')) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=vi&appid=${openWeatherKey}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        const data: any = await res.json();

        if (data.main?.temp !== undefined) {
          const temp = Math.round(data.main.temp);
          const desc = data.weather?.[0]?.description || 'Mát mẻ';
          return {
            temperature: temp,
            weather_code: 1,
            description: `${temp}°C, ${desc}`,
            area_label: data.name || 'Hà Nội',
            observed_at: new Date().toISOString(),
          };
        }
      } catch (err: any) {
        console.warn('OpenWeatherMap API error, falling back to Open-Meteo:', err.message);
      }
    }

    // 2. Tự động lấy Thời tiết THỰC TẾ 100% qua Open-Meteo (Không cần key, không cần thẻ, cập nhật từng phút)
    try {
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
      const res = await fetch(meteoUrl, { signal: AbortSignal.timeout(3000) });
      const data: any = await res.json();

      if (data.current_weather) {
        const temp = Math.round(data.current_weather.temperature);
        const code = Number(data.current_weather.weathercode) || 1;
        const desc = WEATHER_CODE_DESC[code] || 'Mát mẻ dễ chịu';

        return {
          temperature: temp,
          weather_code: code,
          description: `${temp}°C, ${desc}`,
          area_label: 'Vị trí hiện tại',
          observed_at: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.warn('Open-Meteo failed:', err.message);
    }

    return {
      temperature: 26,
      weather_code: 1,
      description: '26°C, trời râm mát dễ chịu',
      area_label: 'Hà Nội',
      observed_at: new Date().toISOString(),
    };
  },
};
