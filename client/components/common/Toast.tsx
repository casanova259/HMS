import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/formatting';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const typeConfig: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-50 border-green-200',
    border: 'border-l-4 border-l-green-500',
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    border: 'border-l-4 border-l-red-500',
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    border: 'border-l-4 border-l-blue-500',
    icon: <Info className="w-5 h-5 text-blue-600" />,
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    border: 'border-l-4 border-l-yellow-500',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  },
};

export const Toast = ({
  id,
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const config = typeConfig[type];

  return (
    <div
      className={cn(
        'fixed top-4 right-4 flex items-start gap-3 p-4 rounded-lg shadow-lg transform transition-all duration-200 z-50',
        config.bg,
        config.border,
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      )}
    >
      {config.icon}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(id), 200);
        }}
        className="p-1 hover:bg-black/10 rounded transition-colors"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};

// Toast container to manage multiple toasts
interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: ToastType }>;
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  );
};

// Custom hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: ToastType }>>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
    warning: (message: string) => showToast(message, 'warning'),
  };
};
