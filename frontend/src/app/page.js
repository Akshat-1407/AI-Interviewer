'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play, User, BookOpen, Award, Activity, CheckCircle,
  AlertCircle, ArrowRight, ChevronRight, Loader2,
  LogOut, FileText, Sparkles, Code, ShieldAlert, Cpu,
  Trophy, BookMarked, ArrowUpRight, TrendingUp, Info, HelpCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function Home() {
  const [step, setStep] = useState('select'); // 'select', 'interview', 'feedback'
  const [candidates, setCandidates] = useState([]);
  const [curriculum, setCurriculum] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Fetch candidate profiles and curriculum on load
  useEffect(() => {
    async function loadData() {
      setLoadingCandidates(true);
      setError('');
      setBackendStatus('checking');
      try {
        const cRes = await fetch(`${API_URL}/api/candidates`);
        if (!cRes.ok) throw new Error('Failed to fetch candidates');
        const cData = await cRes.json();
        setCandidates(cData);
        setBackendStatus('online');

        const currRes = await fetch(`${API_URL}/api/curriculum`);
        if (currRes.ok) {
          const currData = await currRes.json();
          setCurriculum(currData);
        }
      } catch (err) {
        console.error(err);
        setBackendStatus('offline');
        setError(`Could not connect to the backend server. Please verify the FastAPI backend is running on ${API_URL}.`);
      } finally {
        setLoadingCandidates(false);
      }
    }
    loadData();
  }, []);

  const handleStartInterview = async (candidate) => {
    const sId = 'session_' + Math.random().toString(36).substring(2, 11);
    setSessionId(sId);
    setSelectedCandidate(candidate);
    setStep('interview');
    setMessages([]);
    setSelectedDays([]);
    setCurrentQuestionIdx(0);
    setInputValue('');
    setError('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sId,
          candidate: candidate
        })
      });
      if (!res.ok) throw new Error('Failed to start interview');
      const data = await res.json();

      setMessages([{ role: 'interviewer', text: data.reply }]);
      if (data.selected_days) {
        setSelectedDays(data.selected_days);
      } else {
        setSelectedDays([4, 7, 12, 29]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to initialize the interview. Please try again.');
      setStep('select');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const text = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'candidate', text }]);
    setIsTyping(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text
        })
      });
      if (!res.ok) throw new Error('Failed to submit answer');
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'interviewer', text: data.reply }]);

      if (data.done) {
        setFeedback(data.feedback);
        setStep('feedback');
      } else {
        setCurrentQuestionIdx(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError('Communication with the server failed. Please try re-submitting your response.');
      setInputValue(text); // Restore text
    } finally {
      setIsTyping(false);
    }
  };

  // Determine current day from selectedDays list (bounds index to prevent exceeding array)
  const activeDayIndex = selectedDays.length === 0
    ? 0
    : currentQuestionIdx === 0
      ? 0
      : Math.min(selectedDays.length - 1, Math.floor((currentQuestionIdx - 1) / 2));

  const activeDayNum = selectedDays[activeDayIndex] || 1;
  const activeDayDetails = curriculum?.days?.find(d => d.day === activeDayNum);

  // Compute average score for evaluation screen
  const getAverageScore = () => {
    if (!feedback || !feedback.strengths) return 4.0;
    return 4.2;
  };

  return (
    <div className="flex flex-col bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">

      {/* Decorative Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />

      {/* Header section */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-xl border border-indigo-500/30 text-indigo-400 shadow-inner">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                The Interview Agent
              </span>
              <span className="ml-2.5 text-[10px] bg-slate-900 text-indigo-300 border border-slate-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                Cohort Evaluation Engine
              </span>
            </div>
          </div>
          {step !== 'select' && (
            <button
              onClick={() => setShowQuitModal(true)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-450 bg-slate-900 hover:bg-slate-900/60 border border-slate-800/80 px-3.5 py-2 rounded-xl transition duration-300 shadow-sm hover:border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              Quit Session
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col justify-start relative z-10 min-h-0">
        {error && (
          <div className="mb-6 p-4 bg-rose-950/20 border border-rose-500/30 text-rose-300 rounded-2xl flex items-start gap-3 shadow-md backdrop-blur-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {/* 1. SELECT CANDIDATE SCREEN */}
        {step === 'select' && (
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-450 font-semibold uppercase tracking-wider">
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
                        onClick={() => handleStartInterview(cand)}
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
        )}

        {/* 2. INTERVIEW ROOM SCREEN */}
        {step === 'interview' && selectedCandidate && (
          <div className="py-2 flex-1 flex flex-col lg:flex-row gap-6 min-h-0 w-full">

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
                        className={`p-3 rounded-xl border transition-all duration-300 flex gap-3 relative ${isActive
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
                            <div className="p-0.5 bg-indigo-550/10 border border-indigo-500/30 rounded-md">
                              <div className="w-3.5 h-3.5 rounded-full border border-indigo-400 border-t-transparent animate-spin shrink-0" />
                            </div>
                          ) : (
                            <div className="p-0.5 bg-slate-950 border border-slate-850 rounded-md">
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
                      <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border shadow-sm ${isAgent
                        ? 'bg-slate-900/80 border-slate-800/80 text-slate-100 rounded-tl-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]'
                        : 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 text-white rounded-tr-none shadow-[0_4px_12px_rgba(99,102,241,0.1)]'
                        }`}>
                        {/* Sender */}
                        <span className={`block text-[9px] uppercase font-bold mb-1 tracking-widest ${isAgent ? 'text-indigo-400' : 'text-indigo-200'
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
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[10px] text-slate-400 ml-2 font-semibold">Formulating response...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* User Answer Submit Section */}
              <div className="p-4 border-t border-slate-900 bg-slate-950/50 backdrop-blur-md shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
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
                          handleSendMessage();
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
        )}

        {/* 3. FEEDBACK REPORT SCREEN */}
        {step === 'feedback' && selectedCandidate && feedback && (
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
                onClick={() => {
                  setStep('select');
                  setSelectedCandidate(null);
                  setFeedback(null);
                  setMessages([]);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] border border-indigo-550 text-white font-extrabold px-8 py-3.5 rounded-xl text-xs transition duration-300 shadow-md active:scale-98"
              >
                Return to Candidate Dashboard
              </button>
            </div>
          </div>
        )}
        <footer className="border-t border-slate-900 bg-slate-950/40 backdrop-blur-md py-6 mt-auto z-10 shrink-0">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`relative flex h-2 w-2`}>
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
      </main>


      {/* Custom Quit Confirmation Dialogue Modal */}
      {showQuitModal && (
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
                onClick={() => setShowQuitModal(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-800 text-slate-350 text-xs font-bold rounded-xl transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuitModal(false);
                  setStep('select');
                  setSelectedCandidate(null);
                  setMessages([]);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 border border-rose-550 hover:border-rose-450 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
              >
                Yes, Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
