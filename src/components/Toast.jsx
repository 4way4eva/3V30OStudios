import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error:   XCircle,
  info:    Info,
};

const STYLES = {
  success: 'border-green-500/40 bg-green-950/80',
  warning: 'border-yellow-500/40 bg-yellow-950/80',
  error:   'border-red-500/40 bg-red-950/80',
  info:    'border-blue-500/40 bg-blue-950/80',
};

const ICON_COLORS = {
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error:   'text-red-400',
  info:    'text-blue-400',
};

const ToastItem = ({ toast }) => {
  const { removeToast } = useAppStore();
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-xl
        ${STYLES[toast.type] || STYLES.info}
        animate-in slide-in-from-right-4 duration-300`}
      role="alert"
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_COLORS[toast.type] || ICON_COLORS.info}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-white font-semibold text-sm mb-0.5">{toast.title}</div>
        )}
        <div className="text-gray-300 text-sm">{toast.message}</div>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-gray-500 hover:text-gray-300 transition"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const Toast = () => {
  const { toasts } = useAppStore();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default Toast;
