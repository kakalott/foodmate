import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '../services/api';
import { MOCK_RESTAURANTS } from '../services/mockData';

interface UseRestaurantsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export const useRestaurants = (params: UseRestaurantsParams = {}) => {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: async () => {
      try {
        const res = await restaurantsApi.list(params);
        if (res && res.data && res.data.length > 0) return res;
      } catch {
        // Fallback to mock data
      }

      // Filter mock restaurants
      let list = [...MOCK_RESTAURANTS];
      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter(r => r.name.toLowerCase().includes(s) || r.address.toLowerCase().includes(s));
      }
      if (params.category) {
        list = list.filter(r => r.categories?.some(c => c.slug === params.category || c.id === params.category));
      }
      return {
        data: list,
        total: list.length,
        page: params.page || 1,
        limit: params.limit || 12,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useRestaurant = (id: string | undefined) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await restaurantsApi.getById(id);
        if (res) return res;
      } catch {
        // Fallback
      }
      return MOCK_RESTAURANTS.find(r => r.id === id) || MOCK_RESTAURANTS[0];
    },
    enabled: !!id,
  });
};

export const useRestaurantMenus = (id: string | undefined) => {
  return useQuery({
    queryKey: ['restaurant-menus', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const res = await restaurantsApi.getMenus(id);
        if (res && res.length > 0) return res;
      } catch {
        // Fallback
      }
      const rest = MOCK_RESTAURANTS.find(r => r.id === id);
      return rest?.menus || [];
    },
    enabled: !!id,
  });
};
