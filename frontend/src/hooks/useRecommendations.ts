import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '../services/api';
import type { RecommendationRequest, RecommendationResponse } from '../types';

export const useRecommendations = (request: RecommendationRequest | null) => {
  return useQuery({
    queryKey: [
      'recommendations',
      request?.lat,
      request?.lng,
      request?.budget_min,
      request?.budget_max,
      request?.preferred_categories?.join(','),
      request?.dietary_preferences?.join(','),
    ],
    queryFn: async (): Promise<RecommendationResponse | null> => {
      if (!request) return null;
      try {
        const data = await recommendationsApi.get(request);
        return data;
      } catch (err) {
        console.warn('Backend recommendation error:', err);
        return null;
      }
    },
    staleTime: 0,
  });
};
