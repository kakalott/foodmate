import React, { useRef } from 'react';

interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string[];
  onToggle: (id: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ chips, selected, onToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      style={{ scrollbarWidth: 'none' }}
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onToggle(chip.id)}
          className={[
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
            selected.includes(chip.id)
              ? 'bg-fm-primary border-fm-primary text-fm-text'
              : 'bg-white border-gray-200 text-fm-text/70 hover:border-fm-primary',
          ].join(' ')}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
};
