import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '../services/api';
import type { WeatherData } from '../types';

export const useWeather = (lat?: number, lng?: number) => {
  return useQuery<WeatherData>({
    queryKey: ['weather', lat, lng],
    queryFn: async () => {
      const res = await weatherApi.getCurrent(lat, lng);
      if (res) return res;
      throw new Error('Không thể tải thời tiết');
    },
    staleTime: 5 * 60 * 1000, // Làm mới sau 5 phút
    refetchOnWindowFocus: true,
  });
};
