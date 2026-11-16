import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferenceState {
  budgetMin: number;
  budgetMax: number;
  dietaryPreferences: string[];
  dislikedItems: string[];
  preferredCategories: string[];
  specificDish: string;
  locationLat: number | null;
  locationLng: number | null;
  locationLabel: string;

  setBudget: (min: number, max: number) => void;
  setSpecificDish: (dish: string) => void;
  toggleDietaryPreference: (pref: string) => void;
  toggleDislikedItem: (item: string) => void;
  togglePreferredCategory: (cat: string) => void;
  setLocation: (lat: number, lng: number, label?: string) => void;
  clearLocation: () => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  budgetMin: 20000,
  budgetMax: 100000,
  dietaryPreferences: [] as string[],
  dislikedItems: [] as string[],
  preferredCategories: [] as string[],
  specificDish: '',
  locationLat: null,
  locationLng: null,
  locationLabel: '',
};

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setBudget: (min, max) => set({ budgetMin: min, budgetMax: max }),

      setSpecificDish: (dish) => set({ specificDish: dish }),

      toggleDietaryPreference: (pref) => {
        const current = get().dietaryPreferences;
        set({
          dietaryPreferences: current.includes(pref)
            ? current.filter((p) => p !== pref)
            : [...current, pref],
        });
      },

      toggleDislikedItem: (item) => {
        const current = get().dislikedItems;
        set({
          dislikedItems: current.includes(item)
            ? current.filter((i) => i !== item)
            : [...current, item],
        });
      },

      togglePreferredCategory: (cat) => {
        const current = get().preferredCategories;
        set({
          preferredCategories: current.includes(cat)
            ? current.filter((c) => c !== cat)
            : [...current, cat],
        });
      },

      setLocation: (lat, lng, label = '') =>
        set({ locationLat: lat, locationLng: lng, locationLabel: label }),

      clearLocation: () =>
        set({ locationLat: null, locationLng: null, locationLabel: '' }),

      reset: () => set(DEFAULT_STATE),
    }),
    { name: 'fm-preferences' }
  )
);
