import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={[
            'absolute z-50 mt-2 min-w-[180px] bg-white rounded-card shadow-lg border border-gray-100',
            'animate-slide-up origin-top',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
        >
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {item.divider && <div className="my-1 border-t border-gray-100" />}
              <button
                className={[
                  'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left',
                  'transition-colors hover:bg-fm-bg',
                  item.danger ? 'text-red-500 hover:bg-red-50' : 'text-fm-text',
                ].join(' ')}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export { ChevronDown };
