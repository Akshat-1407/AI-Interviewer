'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, User, BookOpen, Award, Activity, CheckCircle, 
  AlertCircle, ArrowRight, ChevronRight, Loader2, 
  LogOut, FileText, Sparkles, Code, ShieldAlert, Cpu
} from 'lucide-react';

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
  
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Fetch candidates and curriculum from backend on mount
  useEffect(() => {
    async function loadData() {
      setLoadingCandidates(true);
      setError('');
      try {
        const cRes = await fetch('http://127.0.0.1:8000/api/candidates');
        if (!cRes.ok) throw new Error('Failed to fetch candidates');
        const cData = await cRes.ok ? await cRes.json() : [];
        setCandidates(cData);

        const currRes = await fetch('http://127.0.0.1:8000/api/curriculum');
        if (currRes.ok) {
          const currData = await currRes.json();
          setCurriculum(currData);
        }
      } catch (err) {
        console.error(err);
        setError('Could not connect to the backend server. Please verify the FastAPI backend is running on http://127.0.0.1:8000.');
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
      const res = await fetch('http://127.0.0.1:8000/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sId,
          candidate: candidate
        })
      });
      if (!res.ok) throw new Error('Start interview endpoint error');
      const data = await res.json();
      
      setMessages([{ role: 'interviewer', text: data.reply }]);
      if (data.selected_days) {
        setSelectedDays(data.selected_days);
      } else {
        // Fallback fallback
        setSelectedDays([7, 12, 16, 22]);
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
      const res = await fetch('http://127.0.0.1:8000/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text
        })
      });
      if (!res.ok) throw new Error('Error sending response');
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
      // Restore answer input so user doesn't lose it
      setInputValue(text);
    } finally {
      setIsTyping(false);
    }
  };

  // Determine current day from selectedDays list
  const activeDayIndex = Math.max(0, Math.floor((currentQuestionIdx) / 2));
  const activeDayNum = selectedDays[activeDayIndex] || 1;
  const activeDayDetails = curriculum?.days?.find(d => d.day === activeDayNum);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                The Interview Agent
              </span>
              <span className="ml-2 text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full uppercase font-semibold">
                Cohort v1
              </span>
            </div>
          </div>
          {step !== 'select' && (
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to end this interview? All current progress will be lost.')) {
                  setStep('select');
                  setSelectedCandidate(null);
                  setMessages([]);
                }
              }}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Quit Session
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col justify-center">
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">{error}</div>
          </div>
        )}
        

        {/* 1. SELECT CANDIDATE STEP */}
        {step === 'select' && (
          <div className="py-6 flex-1 flex flex-col">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h1 className="text-3xl font-extrabold tracking-tight mb-3 sm:text-4xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Conduct Technical Assessments
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Select a member of the 31-day AI Cohort to evaluate. The agent constructs a personalized, multi-turn interview focusing on their completed, skip-prone, and struggled topics.
              </p>
            </div>

            {loadingCandidates ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p className="text-slate-400 text-sm">Retrieving candidate profiles...</p>
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
                      className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Candidate Bio Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-sm shrink-0">
                              {m.name.split(' ').map(x => x[0]).join('')}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition">
                                {m.name}
                              </h3>
                              <p className="text-xs text-slate-400">{m.jobRole}</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                            {m.id}
                          </span>
                        </div>

                        {/* Experience and details */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4 text-slate-400">
                          <div>
                            <span className="block text-[10px] text-slate-500 font-medium">EXPERIENCE</span>
                            <span className="font-semibold text-slate-200">{m.yearsExperience} Years</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 font-medium">EDUCATION</span>
                            <span className="font-semibold text-slate-200 truncate block" title={m.education}>{m.education}</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Curriculum Progress</span>
                            <span className="text-indigo-400 font-bold">{passedMissions}/{totalMissions} days ({completionPercentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Core Cohort Signals */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          <span className="text-[10px] bg-slate-950 text-emerald-400 px-2 py-1 rounded-md border border-slate-800">
                            commits: {cand.signals.commitDays}d
                          </span>
                          <span className="text-[10px] bg-slate-950 text-cyan-400 px-2 py-1 rounded-md border border-slate-800">
                            firstTry: {cand.signals.missionsFirstTry}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleStartInterview(cand)}
                        className="w-full bg-slate-850 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-slate-100 py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 group-hover:bg-slate-800 group-hover:text-indigo-300 group-hover:border-indigo-500/20 group-hover:hover:bg-indigo-600 group-hover:hover:text-slate-100 transition duration-300"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Assess Candidate
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. INTERVIEW ROOM STEP */}
        {step === 'interview' && selectedCandidate && (
          <div className="py-2 flex-1 flex flex-col md:flex-row gap-6 h-[calc(100vh-6rem)] min-h-[500px]">
            
            {/* Left Sidebar: Profile & Progress Info */}
            <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
              
              {/* Candidate Quick Stats */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-sm">
                    {selectedCandidate.member.name.split(' ').map(x => x[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{selectedCandidate.member.name}</h3>
                    <p className="text-xs text-slate-400">{selectedCandidate.member.jobRole}</p>
                  </div>
                </div>
                <div className="w-full bg-slate-950 p-2.5 rounded-lg text-slate-400 text-xs flex justify-between">
                  <span>Questions Asked:</span>
                  <span className="font-semibold text-slate-200">{Math.min(8, currentQuestionIdx)} / 8</span>
                </div>
                <div className="mt-3 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(Math.min(8, currentQuestionIdx) / 8) * 100}%` }}
                  />
                </div>
              </div>

              {/* Curriculum Day Roadmap */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden">
                <h4 className="font-bold text-xs text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                  Assessment Curriculum
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {selectedDays.map((dayNum, idx) => {
                    const dayData = curriculum?.days?.find(d => d.day === dayNum);
                    const isActive = idx === activeDayIndex;
                    const isCompleted = idx < activeDayIndex;
                    
                    return (
                      <div 
                        key={dayNum}
                        className={`p-3 rounded-xl border transition flex gap-3 ${
                          isActive 
                            ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-100' 
                            : isCompleted 
                              ? 'bg-slate-950/40 border-slate-900 text-slate-500' 
                              : 'bg-slate-950/20 border-slate-950 text-slate-400'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : isActive ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-800 shrink-0" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] text-slate-500 font-semibold uppercase">DAY {dayNum}</span>
                          <span className="block text-xs font-bold truncate">
                            {dayData?.title || `Day ${dayNum}`}
                          </span>
                          {isActive && dayData && (
                            <span className="block text-[10px] text-indigo-300 mt-1 italic font-medium">
                              Focus: {dayData.type}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side: Chat Area */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
              {/* Active Day Banner */}
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-800">
                    Day {activeDayNum} Assessment
                  </span>
                  <h4 className="font-bold text-slate-200 mt-1 text-sm sm:text-base">
                    {activeDayDetails?.title || 'Loading day details...'}
                  </h4>
                </div>
                {activeDayDetails && (
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 block">KEY TOOLS</span>
                    <span className="text-xs text-slate-300 font-medium">{activeDayDetails.tools?.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Scrollable Conversation Turn Window */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => {
                  const isAgent = msg.role === 'interviewer';
                  return (
                    <div 
                      key={index}
                      className={`flex ${isAgent ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border ${
                        isAgent 
                          ? 'bg-slate-950 border-slate-800 text-slate-100 rounded-tl-none' 
                          : 'bg-indigo-650 border-indigo-500 text-white rounded-tr-none'
                      }`}>
                        {/* Sender Label */}
                        <span className={`block text-[10px] uppercase font-bold mb-1 tracking-wider ${
                          isAgent ? 'text-indigo-400' : 'text-indigo-200'
                        }`}>
                          {isAgent ? 'Interviewer Agent' : selectedCandidate.member.name}
                        </span>
                        
                        {/* Text */}
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <span className="block text-[10px] uppercase font-bold mb-2 tracking-wider text-indigo-400">
                        Interviewer Agent
                      </span>
                      <div className="flex gap-1.5 items-center py-1 px-2 bg-slate-900 rounded-lg">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[10px] text-slate-400 ml-1.5">Generating questions & evaluations...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Answer submission textbox */}
              <div className="p-4 border-t border-slate-850 bg-slate-950/40">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your response with technical details..."
                      rows="2"
                      disabled={isTyping}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 text-slate-100 disabled:opacity-50 resize-none font-sans"
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
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-850 hover:scale-[1.02] border border-indigo-550 text-white font-bold p-3.5 rounded-xl transition duration-300 shrink-0"
                  >
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </button>
                </form>
                <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-1">
                  <span>Press Enter to send, Shift+Enter for new line.</span>
                  <span>Ensure your answers contain evidence-based details.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. FINAL FEEDBACK & REPORT STEP */}
        {step === 'feedback' && selectedCandidate && feedback && (
          <div className="py-6 flex-1 flex flex-col max-w-4xl mx-auto w-full">
            
            {/* Header Success Section */}
            <div className="text-center mb-8">
              <div className="inline-flex p-3.5 bg-emerald-600/10 rounded-full border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
                <Award className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                Assessment Completed
              </h1>
              <p className="text-slate-400 text-sm">
                Technical Interview Report for <span className="font-bold text-slate-200">{selectedCandidate.member.name}</span> ({selectedCandidate.member.jobRole})
              </p>
            </div>

            {/* Assessment Feedback Report Card */}
            <div className="space-y-6">
              
              {/* Summary Block */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950/20 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Executive Summary
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {feedback.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths Card */}
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase mb-4 flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {feedback.strengths?.map((str, idx) => (
                      <li key={idx} className="text-slate-300 text-xs flex gap-2.5 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Gaps Card */}
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase mb-4 flex items-center gap-2 text-amber-400">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Identified Gaps
                  </h3>
                  <ul className="space-y-3">
                    {feedback.gaps?.map((gap, idx) => (
                      <li key={idx} className="text-slate-300 text-xs flex gap-2.5 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Next Roadmap Steps */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase mb-4 flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Recommended Next Steps
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {feedback.next?.map((nxt, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex gap-3 items-center group hover:border-indigo-500/30 transition"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <span className="text-slate-300 text-xs leading-snug">{nxt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back button */}
              <div className="text-center pt-4">
                <button
                  onClick={() => {
                    setStep('select');
                    setSelectedCandidate(null);
                    setFeedback(null);
                    setMessages([]);
                  }}
                  className="bg-indigo-650 hover:bg-indigo-600 border border-indigo-550 text-slate-100 font-bold px-6 py-3 rounded-xl text-xs hover:scale-[1.02] transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
          <p>Built for the 31-day AI Cohort interview flow.</p>
          <p>Uses backend candidate, curriculum, and interview state data only.</p>
        </div>
      </footer>
    </div>
  );
}
