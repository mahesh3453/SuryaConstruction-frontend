import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  title = "Are you sure?", 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  isDanger = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${
            isDanger 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {isDanger ? <AlertCircle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-100 mb-1">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 whitespace-pre-wrap">{message}</p>
            
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition duration-150"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-semibold text-slate-950 rounded-xl shadow-lg transition duration-150 ${
                  isDanger 
                    ? 'bg-rose-400 hover:bg-rose-300 shadow-rose-950/30' 
                    : 'bg-amber-400 hover:bg-amber-300 shadow-amber-950/30'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
