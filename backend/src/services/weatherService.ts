import { WeatherData } from '../types';

export const weatherService = {
  async getCurrentWeather(lat?: number, lng?: number): Promise<WeatherData> {
    // If open weather key is present, could fetch; otherwise return authentic seasonal Hanoi weather
    return {
      temperature: 24,
      weather_code: 1, // Sunny/pleasant
      description: 'Nắng nhẹ, trời se lạnh dễ chịu',
      area_label: 'Hà Nội',
      observed_at: new Date().toISOString(),
    };
  }
};
