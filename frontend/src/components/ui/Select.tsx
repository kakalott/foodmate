import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-fm-text">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={[
          'w-full border rounded-input px-3 py-2.5 text-fm-text bg-white',
          'transition-all duration-150 cursor-pointer appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-fm-primary focus:border-transparent',
          error ? 'border-red-400' : 'border-gray-200 hover:border-fm-primary/50',
          props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};
