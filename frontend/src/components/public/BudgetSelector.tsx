import React from 'react';
import { usePreferenceStore } from '../../store/preferenceStore';
import { Wallet } from 'lucide-react';

const formatVND = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export const BudgetSelector: React.FC = () => {
  const { budgetMin, budgetMax, setBudget } = usePreferenceStore();

  const presets = [
    { label: 'Dưới 35k (Tiết kiệm)', min: 0, max: 35000 },
    { label: '35k – 60k (Bình dân)', min: 35000, max: 60000 },
    { label: '60k – 100k (Thoải mái)', min: 60000, max: 100000 },
    { label: 'Trên 100k (Ăn no nê)', min: 100000, max: 250000 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-fm-text flex items-center gap-2">
          <Wallet size={16} className="text-amber-500" />
          <span>Ngân sách dự kiến cho một người</span>
        </label>
        <span className="text-xs font-semibold text-emerald-800 bg-[#BFE8D5] px-2.5 py-0.5 rounded-full">
          {formatVND(budgetMin)} – {formatVND(budgetMax)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((p) => {
          const isSelected = budgetMin === p.min && budgetMax === p.max;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setBudget(p.min, p.max)}
              className={[
                'px-3 py-2.5 rounded-btn text-xs font-semibold transition-all border text-center',
                isSelected
                  ? 'bg-[#BFE8D5] text-[#46564E] border-[#46564E]/40 shadow-xs ring-1 ring-[#46564E]/30'
                  : 'bg-white border-[#E8E2D8] text-fm-muted hover:bg-[#FFF9F0] hover:text-fm-text',
              ].join(' ')}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
