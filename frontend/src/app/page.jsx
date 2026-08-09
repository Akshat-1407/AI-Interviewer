'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

import Header from './components/Header';
import Footer from './components/Footer';
import QuitModal from './components/QuitModal';
import CandidateSelector from './components/CandidateSelector';
import InterviewRoom from './components/InterviewRoom';
import FeedbackReport from './components/FeedbackReport';

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
  const [theme, setTheme] = useState('dark');

  // Sync theme selection to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

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

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">

      {/* Decorative Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />

      {/* Header section */}
      <Header
        step={step}
        onQuitClick={() => setShowQuitModal(true)}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
      />

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
          <>
            <CandidateSelector
              candidates={candidates}
              loadingCandidates={loadingCandidates}
              showInfoPanel={showInfoPanel}
              setShowInfoPanel={setShowInfoPanel}
              onStartInterview={handleStartInterview}
            />

            {/* Footer bar */}
            <Footer backendStatus={backendStatus} />
          </>
        )}

        {/* 2. INTERVIEW ROOM SCREEN */}
        {step === 'interview' && selectedCandidate && (
            <InterviewRoom
              selectedCandidate={selectedCandidate}
              curriculum={curriculum}
              messages={messages}
              selectedDays={selectedDays}
              currentQuestionIdx={currentQuestionIdx}
              isTyping={isTyping}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={handleSendMessage}
          />
        )}

        {/* 3. FEEDBACK REPORT SCREEN */}
        {step === 'feedback' && selectedCandidate && feedback && (
          <FeedbackReport
            selectedCandidate={selectedCandidate}
            feedback={feedback}
            onReturnToDashboard={() => {
              setStep('select');
              setSelectedCandidate(null);
              setFeedback(null);
              setMessages([]);
            }}
          />
        )}
      </main>

      {/* Custom Quit Confirmation Dialogue Modal */}
      <QuitModal
        isOpen={showQuitModal}
        onClose={() => setShowQuitModal(false)}
        onConfirm={() => {
          setShowQuitModal(false);
          setStep('select');
          setSelectedCandidate(null);
          setMessages([]);
        }}
      />
    </div>
  );
}
