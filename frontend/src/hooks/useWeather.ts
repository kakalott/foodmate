import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '../services/api';
import { MOCK_WEATHER } from '../services/mockData';

export const useWeather = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ['weather', lat, lng],
    queryFn: async () => {
      try {
        const res = await weatherApi.getCurrent(lat, lng);
        if (res) return res;
      } catch {
        // Fallback to mock weather data
      }
      return MOCK_WEATHER;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    initialData: MOCK_WEATHER,
  });
};
