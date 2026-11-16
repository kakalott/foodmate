import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-fm-text">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fm-text/50">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            'w-full border rounded-input px-3 py-2.5 text-fm-text placeholder:text-fm-text/40',
            'bg-white transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-fm-primary focus:border-transparent',
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-200 hover:border-fm-primary/50',
            props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
            leftIcon ? 'pl-9' : '',
            rightIcon ? 'pr-9' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fm-text/50">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {hint && !error && <p className="text-fm-text/50 text-xs">{hint}</p>}
    </div>
  );
};
