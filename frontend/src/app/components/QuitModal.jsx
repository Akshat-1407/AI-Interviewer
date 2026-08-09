import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function QuitModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-scaleUp">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              Quit Interview Session?
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed mt-1">
              Are you sure you want to end this interview? All current progress for this candidate will be lost.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-800 text-slate-350 text-xs font-bold rounded-xl transition duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 border border-rose-550 hover:border-rose-450 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
          >
            Yes, Quit
          </button>
        </div>
      </div>
    </div>
  );
}
