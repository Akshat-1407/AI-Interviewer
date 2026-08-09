import React from 'react';
import { Play, Activity, Trophy, Info, Loader2 } from 'lucide-react';

export default function CandidateSelector({
  candidates,
  loadingCandidates,
  showInfoPanel,
  setShowInfoPanel,
  onStartInterview
}) {
  return (
    <div className="py-2 flex-1 flex flex-col">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Technical Assessments
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Select a member of the 31-day AI Cohort. The agent evaluates achievements and constructs a personalized, multi-turn interview covering core skills and gaps.
        </p>
      </div>

      {/* Top Explanation Info Panel */}
      {showInfoPanel && (
        <div className="mb-8 p-5 bg-gradient-to-r from-indigo-950/30 via-cyan-950/10 to-slate-900/40 border border-indigo-500/20 rounded-2xl flex items-start gap-4 shadow-md relative overflow-hidden backdrop-blur-sm animate-fadeIn">
          <div className="absolute top-0 right-0 p-1">
            <button 
              onClick={() => setShowInfoPanel(false)}
              className="text-xs text-slate-500 hover:text-slate-350 p-2 hover:bg-slate-900/60 rounded-lg transition"
              title="Dismiss information panel"
            >
              ✕
            </button>
          </div>
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-xl shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2 pr-6">
            <h3 className="text-sm font-bold text-slate-155 tracking-tight flex items-center gap-1.5">
              How it works: The Assessment Workflow
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This AI Technical Interviewer is designed specifically for evaluating developers completing the 31-day AI curriculum. Based on the candidate's actual completion records, skipped modules, and struggle rates, the engine plans a customized **4-day curriculum topic route** and administers **8 distinct question turns**.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-455 font-semibold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Dynamic Difficulty Adaptation
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-455" />
                Contextual Guide & Challenge followups
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Evidence-Based Feedbacks
              </div>
            </div>
          </div>
        </div>
      )}

      {loadingCandidates ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-full mb-4 animate-bounce">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Retrieving active profiles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => {
            const m = cand.member;
            const passedMissions = cand.missions.filter(x => x.passed).length;
            const totalMissions = cand.missions.length;
            const completionPercentage = Math.round((passedMissions / totalMissions) * 100) || 0;
            
            return (
              <div 
                key={m.id}
                className="group bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px] shrink-0">
                        <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-slate-100 text-xs">
                          {m.name.split(' ').map(x => x[0]).join('')}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition duration-200 text-sm sm:text-base">
                          {m.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{m.jobRole}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-950 text-indigo-300 font-bold px-2.5 py-1 rounded-lg border border-slate-800 tracking-wider">
                      {m.id}
                    </span>
                  </div>

                  {/* Experience Grid Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 mb-5">
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">EXPERIENCE</span>
                      <span className="font-bold text-slate-200 mt-0.5 block">{m.yearsExperience} Years</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">EDUCATION</span>
                      <span className="font-bold text-slate-200 mt-0.5 truncate block" title={m.education}>{m.education}</span>
                    </div>
                  </div>

                  {/* Progress Bar Gauge */}
                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Curriculum Progress</span>
                      <span className="text-indigo-400">{passedMissions}/{totalMissions} days ({completionPercentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60 p-[1px]">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-sm" 
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="flex items-center gap-1 text-[10px] bg-slate-950 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-800/60 font-semibold">
                      <Activity className="w-3 h-3 shrink-0" />
                      commits: {cand.signals.commitDays}d
                    </div>
                    <div className="flex items-center gap-1 text-[10px] bg-slate-950 text-cyan-400 px-2.5 py-1 rounded-lg border border-slate-800/60 font-semibold">
                      <Trophy className="w-3 h-3 shrink-0" />
                      firstTry: {cand.signals.missionsFirstTry}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onStartInterview(cand)}
                  className="w-full bg-slate-900/60 group-hover:bg-indigo-600 border border-slate-800 group-hover:border-indigo-500 text-slate-300 group-hover:text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-300 shadow-inner group-hover:-translate-y-[1px]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Assess Profile
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
