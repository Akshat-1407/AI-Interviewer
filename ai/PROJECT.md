# PROJECT.md

## The Interview Agent

Build an AI interviewer for the 31-day AI Cohort.

### Core goal

Conduct realistic personalized technical interviews using:

- curriculum
- candidate profiles
- interview history

### Requirements

- 8+ questions
- 4+ curriculum days
- adaptive follow-ups
- conversation context
- difficulty adaptation
- structured evaluation
- evidence-based final feedback

### Stack

Backend: FastAPI + Python + LangChain + LangGraph

Frontend: Next.js + React + TypeScript + Tailwind + shadcn/ui

Optional: Chroma + SQLite

### Architecture

```text
Frontend
   ↓
FastAPI
   ↓
Interview Engine
   ↓
LangGraph
   ↓
LLM + Curriculum/Candidate Data
```

The LLM generates/evaluates language.

Application logic controls interview state and constraints.