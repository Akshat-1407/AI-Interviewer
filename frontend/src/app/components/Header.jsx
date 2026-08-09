import React from 'react';
import { Cpu, LogOut, Sun, Moon } from 'lucide-react';

export default function Header({ step, onQuitClick, theme, onToggleTheme }) {
  return (
    <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 shadow-sm shrink-0">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-xl border border-indigo-500/30 text-indigo-400 shadow-inner">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-cyan-300 via-indigo-300 to-cyan-300 bg-clip-text text-transparent tracking-tight">
              The Interview Agent
            </span>
            <span className="ml-2.5 text-[10px] bg-slate-900 text-indigo-300 border border-slate-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
              Cohort Evaluation Engine
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleTheme}
            className="p-2.5 text-slate-400 hover:text-indigo-455 bg-slate-900 hover:bg-slate-900/60 border border-slate-800/80 px-2.5 py-2 rounded-xl transition duration-300 shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {step !== 'select' && (
            <button 
              onClick={onQuitClick}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-455 bg-slate-900 hover:bg-slate-900/60 border border-slate-800/80 px-3.5 py-2 rounded-xl transition duration-300 shadow-sm hover:border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              Quit Session
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
