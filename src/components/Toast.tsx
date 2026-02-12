'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  fading: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, fading: false }]);

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3700);
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-vm-success shrink-0" />,
    error: <XCircle className="w-5 h-5 text-vm-error shrink-0" />,
    info: <Info className="w-5 h-5 text-vm-info shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3" aria-live="polite" role="region">
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="status"
            className={`
              bg-white/95 backdrop-blur-sm border border-vm-border rounded-2xl px-5 py-3.5 text-sm text-vm-text font-medium
              shadow-xl shadow-black/8 max-w-sm flex items-center gap-3
              ${toast.fading ? 'animate-fade-out' : 'animate-slide-in'}
            `}
          >
            {icons[toast.type]}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
