# TASKS.md

## Phase 1 — Foundation & Data Loading
- [x] Initialize Python backend environment and write `requirements.txt`
- [x] Create `.env.template` and configuration module (`config.py`)
- [x] Implement data loaders (`data_loader.py`) for `curriculum.json` and `candidates.json`
- [x] Implement SQLite session state database module (`database.py`)

## Phase 2 — AI Engine & LangGraph
- [x] Implement the LangGraph workflow (`graph.py`) with nodes for:
  - [x] Answer evaluation (Pydantic schema, scoring, gap identification)
  - [x] Question generation (enforcing 8 questions, 4 days, difficulty adaptation, and follow-ups)
  - [x] Feedback generation (evidence-based, matching the spec schema)
- [x] Write a test simulation script (`tests/simulate_interview.py`) to verify the engine deterministically without UI

## Phase 3 — FastAPI Backend Integration
- [x] Set up the FastAPI app (`main.py`)
- [x] Implement the `POST /api/interview` endpoint as per `technical-spec.md`
- [x] Integrate session persistence with SQLite and LangGraph execution
- [x] Verify the endpoint via cURL or custom test requests

## Phase 4 — Next.js Frontend
- [x] Scaffold Next.js Javascript application using `npx create-next-app`
- [x] Install and configure Tailwind CSS and Shadcn/ui
- [x] Build Candidate Selection screen (fetching profiles from `candidates.json`)
- [x] Build conversational Interview Room interface with curriculum progress sidebar
- [x] Build the Feedback & Performance Report dashboard
- [x] Connect the frontend to the FastAPI backend API

## Phase 5 — Verification & Polish
- [x] Run full end-to-end simulated interviews
- [x] Refine LLM prompt instructions for higher quality question generation
- [x] Add loading skeletons, transitions, and micro-animations to UI
- [x] Finalize documentation and update `README.md`