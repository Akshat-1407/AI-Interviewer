import React, { useRef, useEffect } from 'react';
import { CheckCircle, Loader2, ArrowRight, BookMarked } from 'lucide-react';

export default function InterviewRoom({
  selectedCandidate,
  curriculum,
  messages,
  selectedDays,
  currentQuestionIdx,
  isTyping,
  inputValue,
  setInputValue,
  onSendMessage
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll chat feed on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const activeDayIndex = selectedDays.length === 0 
    ? 0 
    : currentQuestionIdx === 0 
      ? 0 
      : Math.min(selectedDays.length - 1, Math.floor((currentQuestionIdx - 1) / 2));
  
  const activeDayNum = selectedDays[activeDayIndex] || 1;
  const activeDayDetails = curriculum?.days?.find(d => d.day === activeDayNum);

  return (
    <div className="py-2 flex-1 flex flex-col lg:flex-row gap-6 min-h-0 w-full animate-fadeIn">
      
      {/* Sidebar Profile & Progress Map */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 min-h-0">
        
        {/* Quick Info Card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/65 rounded-2xl p-4 shadow-sm shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-slate-100 text-xs">
                {selectedCandidate.member.name.split(' ').map(x => x[0]).join('')}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-150 text-sm sm:text-base leading-snug">{selectedCandidate.member.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{selectedCandidate.member.jobRole}</p>
            </div>
          </div>
          <div className="w-full bg-slate-950/80 border border-slate-850 p-3 rounded-xl text-slate-400 text-xs flex justify-between font-semibold">
            <span>Questions Asked:</span>
            <span className="font-extrabold text-indigo-400">{Math.min(8, currentQuestionIdx)} / 8</span>
          </div>
          <div className="mt-3.5 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850 p-[1px]">
            <div 
              className="bg-gradient-to-r from-indigo-555 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${(Math.min(8, currentQuestionIdx) / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Day Timeline Roadmap */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/65 rounded-2xl p-4 flex flex-col max-h-[220px] lg:max-h-none lg:flex-1 overflow-hidden shadow-sm shrink-0 lg:shrink">
          <h4 className="font-bold text-[10px] text-slate-500 tracking-wider uppercase mb-4 flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-indigo-400" />
            Assessment Checklist
          </h4>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {selectedDays.map((dayNum, idx) => {
              const dayData = curriculum?.days?.find(d => d.day === dayNum);
              const isActive = idx === activeDayIndex;
              const isCompleted = idx < activeDayIndex;
              
              return (
                <div 
                  key={dayNum}
                  className={`p-3 rounded-xl border transition-all duration-300 flex gap-3 relative ${
                    isActive 
                      ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-100 shadow-[0_0_15px_rgba(99,102,241,0.05)]' 
                      : isCompleted 
                        ? 'bg-slate-950/20 border-slate-900 text-slate-500' 
                        : 'bg-slate-950/10 border-slate-950 text-slate-450'
                  }`}
                >
                  <div className="mt-0.5 relative z-10">
                    {isCompleted ? (
                      <div className="p-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                    ) : isActive ? (
                      <div className="p-0.5 bg-indigo-555/10 border border-indigo-500/30 rounded-md">
                        <div className="w-3.5 h-3.5 rounded-full border border-indigo-400 border-t-transparent animate-spin shrink-0" />
                      </div>
                    ) : (
                      <div className="p-0.5 bg-slate-950 border border-slate-855 rounded-md">
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-800 shrink-0" />
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden relative z-10">
                    <span className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">DAY {dayNum}</span>
                    <span className="block text-xs font-bold truncate mt-0.5">
                      {dayData?.title || `Day ${dayNum}`}
                    </span>
                    {isActive && dayData && (
                      <span className="block text-[9px] text-indigo-400 mt-1 font-semibold flex items-center gap-1 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        Active Assessment
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-slate-900/50 backdrop-blur-md border border-slate-800/65 rounded-2xl flex flex-col overflow-hidden shadow-sm min-h-[450px] lg:h-[600px] justify-between">
        
        {/* Header Topic Detail Banner */}
        <div className="bg-slate-950 p-4 border-b border-slate-900 flex items-center justify-between shadow-sm shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-800/50 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">
                Curriculum Topic
              </span>
              <span className="text-slate-550 text-[10px] font-semibold">• Day {activeDayNum}</span>
            </div>
            <h4 className="font-bold text-slate-200 mt-1.5 text-sm sm:text-base tracking-tight leading-snug">
              {activeDayDetails?.title || 'Loading day details...'}
            </h4>
          </div>
          {activeDayDetails && (
            <div className="text-right hidden sm:block shrink-0">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">KEY OBJECTIVE</span>
              <span className="text-xs text-slate-300 font-semibold block truncate max-w-[150px]" title={activeDayDetails.objectives?.[0]}>
                {activeDayDetails.objectives?.[0]}
              </span>
            </div>
          )}
        </div>

        {/* Chat turns list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/20">
          {messages.map((msg, index) => {
            const isAgent = msg.role === 'interviewer';
            return (
              <div 
                key={index}
                className={`flex ${isAgent ? 'justify-start' : 'justify-end'} animate-fadeIn`}
              >
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border shadow-sm ${
                  isAgent 
                    ? 'bg-slate-900/80 border-slate-800/80 text-slate-100 rounded-tl-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]' 
                    : 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 text-white rounded-tr-none shadow-[0_4px_12px_rgba(99,102,241,0.1)]'
                }`}>
                  {/* Sender */}
                  <span className={`block text-[9px] uppercase font-bold mb-1 tracking-widest ${
                    isAgent ? 'text-indigo-400' : 'text-indigo-200'
                  }`}>
                    {isAgent ? 'AI Interviewer' : selectedCandidate.member.name}
                  </span>
                  
                  <p className="whitespace-pre-line text-xs sm:text-sm font-medium">{msg.text}</p>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm">
                <span className="block text-[9px] uppercase font-bold mb-2 tracking-widest text-indigo-400">
                  AI Interviewer
                </span>
                <div className="flex gap-1.5 items-center py-1 px-3 bg-slate-950 rounded-xl border border-slate-855">
                  <span className="w-1.5 h-1.5 bg-indigo-550 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-550 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-550 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-slate-400 ml-2 font-semibold">Formulating response...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* User Answer Submit Section */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/50 backdrop-blur-md shrink-0">
          <form onSubmit={onSendMessage} className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Provide details showing your conceptual and practical understanding of this day's objectives..."
                rows="2"
                disabled={isTyping}
                className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 text-slate-100 disabled:opacity-50 resize-none font-sans shadow-inner placeholder:text-slate-650"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendMessage();
                  }
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-855 hover:scale-[1.02] border border-indigo-550 text-white font-bold p-3.5 rounded-xl transition duration-300 shrink-0 shadow-lg hover:shadow-indigo-500/10 active:scale-95"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </form>
          <div className="flex justify-between text-[9px] text-slate-500 mt-2 px-1 font-medium">
            <span>Press Enter to submit, Shift+Enter for new line.</span>
            <span>Enforces minimum 8 questions and 4 topics.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
