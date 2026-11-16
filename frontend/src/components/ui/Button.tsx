import React from 'react';
import { LoaderCircle } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-fm-primary text-fm-text hover:brightness-95 active:brightness-90 shadow-sm',
  secondary:
    'bg-fm-secondary text-fm-text hover:brightness-95 active:brightness-90 shadow-sm',
  outline:
    'border-2 border-fm-primary text-fm-text bg-transparent hover:bg-fm-primary/20',
  ghost: 'bg-transparent text-fm-text hover:bg-fm-primary/10',
  danger: 'bg-red-400 text-white hover:bg-red-500 active:bg-red-600 shadow-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-[10px]',
  md: 'px-5 py-2.5 text-base rounded-btn',
  lg: 'px-7 py-3 text-lg rounded-btn',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fm-primary focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
};
