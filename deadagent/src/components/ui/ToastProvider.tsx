'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
};

const COLORS: Record<ToastType, string> = {
  success: 'border-emerald-500/40 text-emerald-400',
  error: 'border-red-500/40 text-red-400',
  info: 'border-sky-500/40 text-sky-400',
  warning: 'border-amber-500/40 text-amber-400',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Start exit animation after 3s, remove after 3.3s
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    }, 3000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 bg-[#0A0A0B] border ${COLORS[t.type]} rounded-sm px-5 py-3 shadow-2xl ${
              t.exiting ? 'toast-exit' : 'toast-enter'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px]`}>{ICONS[t.type]}</span>
            <span className="font-sans text-[11px] text-[#e4e2e1] tracking-wide">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
