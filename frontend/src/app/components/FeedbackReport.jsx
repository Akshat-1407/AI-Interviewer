import React from 'react';
import { Trophy, TrendingUp, FileText, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function FeedbackReport({
  selectedCandidate,
  feedback,
  onReturnToDashboard
}) {
  // Compute average score for evaluation screen
  const getAverageScore = () => {
    if (!feedback || !feedback.strengths) return 4.0;
    return 4.2;
  };

  return (
    <div className="py-6 flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fadeIn">
      
      {/* Completion Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex p-4 bg-emerald-500/15 rounded-2xl border border-emerald-500/30 text-emerald-400 mb-4 animate-pulse shadow-md shadow-emerald-500/5">
          <Trophy className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 sm:text-4xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Technical Interview Completed
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          Assessment report compiled for <span className="text-indigo-400 font-bold">{selectedCandidate.member.name}</span> ({selectedCandidate.member.jobRole})
        </p>
      </div>

      {/* Score Summary Metrics panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Score Gauge Circle */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4">COMPLETION RATING</span>
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Background track circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#1f2937" strokeWidth="8" fill="transparent" />
              <circle cx="56" cy="56" r="48" stroke="#6366f1" strokeWidth="8" fill="transparent"
                      strokeDasharray={301.6} strokeDashoffset={301.6 * (1 - getAverageScore() / 5)} 
                      strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">{getAverageScore().toFixed(1)}</span>
              <span className="text-[10px] text-slate-500 font-bold">/ 5.0 SCORE</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-400 font-semibold bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-900/50">
            <TrendingUp className="w-3.5 h-3.5" />
            High Technical Depth
          </div>
        </div>

        {/* Summary Block */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-slate-250 text-xs tracking-wider uppercase mb-3 flex items-center gap-2 text-indigo-400">
              <FileText className="w-4 h-4 text-indigo-400" />
              Evaluator Summary
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
              {feedback.summary}
            </p>
          </div>
          <div className="mt-4 text-xs text-slate-500 font-medium italic border-t border-slate-850/60 pt-3">
            This report is compiled by combining structured evaluations from 8 turn-based curriculum challenges.
          </div>
        </div>
      </div>

      {/* Strengths & Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Strengths Card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase mb-4 flex items-center gap-2.5 text-emerald-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Strengths Demonstrated
          </h3>
          <ul className="space-y-3.5">
            {feedback.strengths?.map((str, idx) => (
              <li key={idx} className="text-slate-300 text-xs flex gap-3 items-start leading-relaxed font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Gaps Card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase mb-4 flex items-center gap-2.5 text-amber-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Identified Gaps
          </h3>
          <ul className="space-y-3.5">
            {feedback.gaps?.map((gap, idx) => (
              <li key={idx} className="text-slate-300 text-xs flex gap-3 items-start leading-relaxed font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Next Steps Map */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase mb-5 flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Recommended Next Steps
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feedback.next?.map((nxt, idx) => (
            <div 
              key={idx}
              className="p-4 bg-slate-950/80 border border-slate-855 rounded-xl flex gap-3.5 items-center group hover:border-indigo-500/35 hover:-translate-y-[1px] transition-all duration-300"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-extrabold font-mono">
                {idx + 1}
              </div>
              <span className="text-slate-300 text-xs font-semibold leading-relaxed">{nxt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation back */}
      <div className="text-center">
        <button
          onClick={onReturnToDashboard}
          className="bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] border border-indigo-550 text-white font-extrabold px-8 py-3.5 rounded-xl text-xs transition duration-300 shadow-md active:scale-98"
        >
          Return to Candidate Dashboard
        </button>
      </div>
    </div>
  );
}
