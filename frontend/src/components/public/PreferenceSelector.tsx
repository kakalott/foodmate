import React from 'react';
import { usePreferenceStore } from '../../store/preferenceStore';
import { Utensils, HeartHandshake } from 'lucide-react';

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: '🌱 Đồ chay' },
  { id: 'no-pork', label: '🚫 Không thịt lợn' },
  { id: 'no-beef', label: '🥩 Không thịt bò' },
  { id: 'no-spicy', label: '🌶️ Không cay' },
  { id: 'low-carb', label: '🥗 Ít tinh bột' },
];

const CATEGORY_OPTIONS = [
  { id: 'pho-bun', label: '🍜 Phở & Bún' },
  { id: 'com', label: '🍚 Cơm bình dân' },
  { id: 'banh-mi', label: '🥖 Bánh mì' },
  { id: 'bun-dau', label: '🥢 Bún đậu mẹt' },
  { id: 'do-nuong', label: '🍢 Đồ nướng vỉa hè' },
  { id: 'giai-khat', label: '☕ Trà & Cà phê' },
];

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
      selected
        ? 'bg-[#BFE8D5] border-[#46564E]/40 text-[#46564E] shadow-xs ring-1 ring-[#46564E]/30'
        : 'bg-white border-[#E8E2D8] text-fm-muted hover:border-[#46564E]/30 hover:text-fm-text',
    ].join(' ')}
  >
    {label}
  </button>
);

export const PreferenceSelector: React.FC = () => {
  const { dietaryPreferences, preferredCategories, toggleDietaryPreference, togglePreferredCategory } =
    usePreferenceStore();

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-bold text-fm-text mb-2 flex items-center gap-2">
          <HeartHandshake size={16} className="text-emerald-600" />
          <span>Yêu cầu dinh dưỡng & Thói quen</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={dietaryPreferences.includes(opt.id)}
              onClick={() => toggleDietaryPreference(opt.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-fm-text mb-2 flex items-center gap-2">
          <Utensils size={16} className="text-amber-600" />
          <span>Loại món ăn yêu thích</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={preferredCategories.includes(opt.id)}
              onClick={() => togglePreferredCategory(opt.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
