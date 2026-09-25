import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useApp();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    error: 'bg-rose-50 border-rose-300 text-rose-900',
    info: 'bg-blue-50 border-blue-300 text-blue-900',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  return (
    <div
      id="toast-notification"
      className="fixed bottom-5 right-5 z-50 max-w-md w-full shadow-lg rounded-xl transition-all duration-300 transform translate-y-0"
    >
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
        <button
          id="btn-close-toast"
          onClick={clearToast}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
