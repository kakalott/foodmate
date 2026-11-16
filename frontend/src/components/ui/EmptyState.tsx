import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 text-fm-primary/60 w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-fm-text mb-2">{title}</h3>
      {description && (
        <p className="text-fm-text/60 text-sm max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
};
