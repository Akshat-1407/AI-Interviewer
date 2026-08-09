import React from 'react';

export default function Footer({ backendStatus }) {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/40 backdrop-blur-md py-6 mt-auto z-10 shrink-0">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {backendStatus === 'online' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : backendStatus === 'offline' ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600 animate-pulse"></span>
              )}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              FastAPI Backend: {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Checking...'}
            </span>
          </div>
          <span className="text-slate-700 text-xs">|</span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            SQLite Checkpoint System Active
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">Next.js 16</span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">FastAPI</span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">LangGraph</span>
        </div>

        <p className="text-[10px] text-slate-650 font-medium">
          &copy; 2026 The Interview Agent. AI Cohort Assessments.
        </p>
      </div>
    </footer>
  );
}
