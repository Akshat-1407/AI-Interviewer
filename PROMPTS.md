# PROMPTS.md

## Purpose

This file contains the chronological record of prompts and requests submitted by the user to the AI coding assistant during the development of **The Interview Agent** hackathon project.

The prompts document the AI-assisted development process, including project planning, implementation, configuration, debugging, architecture decisions, and deployment/setup questions.

The repository files (`AGENTS.md`, `ai/`, backend, and frontend) represent the resulting implementation and are the source of truth for the final project.
---

## Prompt 1
```text
Build **The Interview Agent** hackathon project.

## Goal

Create an AI-powered technical interviewer that conducts a realistic, personalized, multi-turn interview based on:

* the provided 31-day curriculum JSON
* candidate profiles
* candidate progress
* previous interview answers

The interview must feel like a real technical interview, not a static questionnaire or generic LLM chatbot.

## Requirements

The system must:

* ask at least 8 questions
* cover at least 4 different curriculum days
* generate contextual follow-up questions
* maintain interview state/context
* adapt question difficulty
* evaluate candidate answers
* provide structured, evidence-based feedback at the end

The application itself must enforce the 8-question and 4-day requirements. Do not rely on the LLM to enforce them.

## Architecture

Use two separate applications:

project/
├── backend/
├── frontend/
├── ai/
└── AGENTS.md

### Backend

Use:

* Python
* FastAPI
* Pydantic
* LangChain
* LangGraph
* SQLite if persistence is needed
* Chroma/vector search only if useful

### Frontend

Use:

* Next.js
* React
* JavaScript
* Tailwind
* shadcn/ui

The frontend communicates with the backend through APIs.

## AI Architecture

Use LangGraph to manage interview state.

Conceptually:

Candidate
   ↓
Curriculum + Profile
   ↓
Interview Plan
   ↓
Question
   ↓
Candidate Answer
   ↓
Evaluation
   ↓
Follow-up OR New Topic
   ↓
Completion
   ↓
Feedback

Use structured/Pydantic outputs for LLM responses.

The LLM should handle language generation and evaluation, while deterministic application code controls interview state, constraints, scoring, and progression.

Use the supplied Technical Specification as the authoritative API contract.

Do not overengineer the project.

## Important

Before coding:

1. Inspect the supplied curriculum.
2. Inspect candidate profiles.
3. Inspect the Technical Specification.
4. Create `AGENTS.md` and the `ai/` context files.
5. Create an implementation plan in `ai/TASKS.md`.

Then implement incrementally.

After every meaningful task, update:

* `ai/CURRENT_STATE.md`
* `ai/TASKS.md`
* `ai/SESSION_LOG.md`

Record architectural decisions in `ai/DECISIONS.md`.

The repository and these files are the source of truth, not the AI conversation.

Start by inspecting the provided files and creating the project structure and implementation plan. Do not implement the entire project in one step.
```

---

## Prompt 2
```text
Proceeed
```

---

## Prompt 3
```text
proceed with the completion of the project
```

---

## Prompt 4
```text
What is the current status of the project
```

---

## Prompt 5
```text
is the project completed
```

---

## Prompt 6
```text
where do i add the environemet variables and api keys
```

---

## Prompt 7
```text
how to start the server
```

---

## Prompt 8
```text
frontend does not have env file
```

---

## Prompt 9
```text
can i use mysql database url
```

---

## Prompt 10
```text
I'm getting this error (Attached Next.js PostCSS Turbopack compilation crash screenshot)
```

---

## Prompt 11
```text
do we need to use both llm
```

---

## Prompt 12
```text
how to get the sqllite url
```

---

## Prompt 13
```text
I dont have sql lite installed. I only have mysql
```

---

## Prompt 14
```text
DATABASE_URL=sqlite:///./interview_agent.db

So this env is correct and i dont need to do anything
```

---

## Prompt 15
```text
GEMINI_MODEL=gemini-2.5-flash

do i need to change this env variable
```

---

## Prompt 16
```text
should i chage LLM_PROVIDER=mock to gemini if we are using gemini api key
```

---

## Prompt 17
```text
enhance the fontend ui of page.jsx
```

---

## Prompt 18
```text
add a footer and info or explanation panel at the top
```

---

## Prompt 19
```text
When i access profile button then the page that opens does not have proper ui
```

---

## Prompt 20
```text
write a readme file for this project
```

---

## Prompt 21
```text
difference bw .env and .env.template
```

---

## Prompt 22
```text
How to host this project in verecl and render. What changes in the code do we need to make for deployment
```

---

## Prompt 23
```text
rewrite the page.jsx quit session should give a popup or dialogue. Enhance the UI, and make sure the ui when we go on access candidate does not break
```

---

## Prompt 24
```text
now I want you the break this huge file in various components and make sure the current ui and functionality should not change
```

---

## Prompt 25
```text
proceed
```

## Prompt 26
```text
implement light and dark mode feature. Make sure you dont change the current functionality or the code structure.
```


