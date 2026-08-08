# AGENTS.md

## Project

The Interview Agent is a personalized AI technical interviewer for the 31-day AI Cohort.

## Before working

Read:

```text
ai/PROJECT.md
ai/CURRENT_STATE.md
ai/ARCHITECTURE.md
ai/TASKS.md
ai/DECISIONS.md
```

Then inspect the actual code.

The repository is the source of truth. Do not rely on previous AI conversations.

## Rules

- Keep `backend/` and `frontend/` separate.
- Follow the Technical Specification for API contracts.
- Do not expose API keys to the frontend.
- Validate LLM outputs with structured schemas.
- Application code must enforce minimum 8 questions and 4 curriculum days.
- Candidate progress must come from the supplied candidate data.
- Curriculum information must come from the supplied curriculum.
- Do not invent candidate achievements or curriculum topics.
- Use LangGraph for interview state/orchestration where appropriate.
- Avoid unnecessary complexity.
- Do not rewrite working code without a reason.
- Test important changes.

## Context Switching

After meaningful work update:

```text
ai/CURRENT_STATE.md
ai/TASKS.md
ai/SESSION_LOG.md
```

Update `DECISIONS.md` when making an architectural decision.

When finishing a session, leave a concise handoff describing:

- what was completed
- what is in progress
- known problems
- next task
- important files

Another AI must be able to continue by reading the repository and `/ai` files.