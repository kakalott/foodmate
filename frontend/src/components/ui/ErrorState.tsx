import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Đã xảy ra lỗi, vui lòng thử lại',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="text-red-400 mb-3" size={48} />
      <p className="text-fm-text font-medium mb-2">Oops!</p>
      <p className="text-fm-text/60 text-sm mb-5 max-w-xs">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} leftIcon={<RefreshCw size={16} />}>
          Thử lại
        </Button>
      )}
    </div>
  );
};
