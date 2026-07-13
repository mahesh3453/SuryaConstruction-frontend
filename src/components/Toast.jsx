import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 border rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 max-w-sm w-full md:w-auto border-slate-800">
      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
        type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
      }`}>
        {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      </div>
      
      <div className="flex-1 text-sm font-medium text-slate-200">
        {message}
      </div>

      <button 
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
