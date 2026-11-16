import React from 'react';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  hover = false,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={[
        'bg-white rounded-card shadow-soft border border-gray-100',
        hover
          ? 'cursor-pointer transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-0.5'
          : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {header && (
        <div className="px-5 py-4 border-b border-gray-100 font-semibold text-fm-text">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-card">
          {footer}
        </div>
      )}
    </div>
  );
};
