# DECISIONS.md

## ADR-001 — LangGraph

Use LangGraph for interview orchestration because the interview has conditional state transitions and follow-ups.

## ADR-002 — Separate frontend/backend

Keep Next.js and FastAPI as separate applications.

## ADR-003 — Deterministic constraints

The application, not the LLM, enforces the minimum 8 questions and 4 curriculum days.

## ADR-004 — RAG

Use RAG only where it improves curriculum/topic retrieval. Structured candidate data remains the source of truth.