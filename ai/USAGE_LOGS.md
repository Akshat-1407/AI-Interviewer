# AI Interview Usage Logs (Example Run)

This log shows a complete 9-turn interview flow generated during verification for candidate **Sarah Johnson** (Senior Data Engineer).

- **Session ID**: `sim-session-123`
- **Selected Days**: `[4, 7, 12, 29]`
- **Active Model Config**: `LLM_PROVIDER=mock`

---

## Turn 1: Welcome & Setup
- **Interviewer**: "Welcome. Let's begin your interview."
- **Candidate response**: "Hello, I am ready to begin my interview."

---

## Turn 2: Day 4 Core Topic (Structured Data)
- **Interviewer Question**: 
  > "Regarding Day 4: Reading & Processing Structured Data. How do you load and clean a large CSV file using Pandas, and what is your process for loading it into SQLite using SQLAlchemy?"
- **Candidate Answer**: 
  > "To set up virtual environments in python, I use 'python -m venv .venv'. Then I configure VS Code settings to point to the virtual environment python interpreter, and use Pylance for language intelligence."
- **Evaluation**:
  - **Score**: `5` (Excellent/Detailed response)
  - **Correctness**: `High`
  - **Feedback**: "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."

---

## Turn 3: Day 4 Challenge Follow-up
- **Interviewer Question**: 
  > "That's a solid answer. Moving deeper: how would you address scalability concerns, performance bottlenecks, or race conditions when deploying this setup in production?"
- **Candidate Answer**: 
  > "For a FastAPI health endpoint, I define a GET route returning status OK. In React Vite, I fetch this endpoint during component mount and set status state."
- **Evaluation**:
  - **Score**: `5` (Excellent/Detailed response)
  - **Correctness**: `High`
  - **Feedback**: "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."

---

## Turn 4: Day 7 Core Topic (Embeddings)
- **Interviewer Question**: 
  > "Let's discuss Day 7: Embeddings Explained. How do you explain the difference between sparse and dense vector embeddings, and when would you choose Sentence Transformers over OpenAI embeddings?"
- **Candidate Answer**: 
  > "I load data using pandas.read_csv(), clean nulls or format dates, then write to SQLite using df.to_sql() with SQLAlchemy's create_engine()."
- **Evaluation**:
  - **Score**: `5` (Excellent/Detailed response)
  - **Correctness**: `High`
  - **Feedback**: "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."

---

## Turn 5: Day 7 Challenge Follow-up
- **Interviewer Question**: 
  > "That's a solid answer. Moving deeper: how would you address scalability concerns, performance bottlenecks, or race conditions when deploying this setup in production?"
- **Candidate Answer**: 
  > "Sparse embeddings use frequency (TF-IDF), while dense embeddings capture semantics using neural networks. OpenAI embeddings are hosted and highly powerful, while SentenceTransformers are run locally and cost-effective."
- **Evaluation**:
  - **Score**: `5` (Excellent/Detailed response)
  - **Correctness**: `High`
  - **Feedback**: "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."

---

## Turn 6: Day 12 Core Topic (Prompt Engineering)
- **Interviewer Question**: 
  > "For Day 12: Prompt Engineering Fundamentals. What are the key differences between Zero-Shot, Few-Shot, and Chain-of-Thought prompting, and how do you prevent prompt injection?"
- **Candidate Answer**: 
  > "Hybrid search combines SQL for structured metadata queries and vector database queries (like Chroma) for unstructured text chunk retrieval, merging and ranking results by combined scores."
- **Evaluation**:
  - **Score**: `5` (Excellent/Detailed response)
  - **Correctness**: `High`
  - **Feedback**: "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."

---

## Turn 7: Day 12 Challenge Follow-up
- **Interviewer Question**: 
  > "That's a solid answer. Moving deeper: how would you address scalability concerns, performance bottlenecks, or race conditions when deploying this setup in production?"
- **Candidate Answer**: 
  > "Zero-shot asks directly, few-shot provides examples in prompt, and Chain-of-Thought asks the LLM to write step-by-step reasoning. Prompt injection is prevented by strict schema validation and separating system instructions."
- **Evaluation**:
  - **Score**: `5` (Excellent/Detailed response)
  - **Correctness**: `High`
  - **Feedback**: "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."

---

## Turn 8: Day 29 Core Topic (Observability)
- **Interviewer Question**: 
  > "On Day 29: Monitoring, Logging & Observability. How do you set up structured logging in Python and configure Prometheus metrics to monitor LLM token usage and latency?"
- **Candidate Answer**: 
  > "I define a Pydantic model showing the expected fields. Then I pass it as a tool or response_format schema to OpenAI/Gemini client to guarantee the output matches exactly."
- **Evaluation**:
  - **Score**: `5` (Excellent/Detailed response)
  - **Correctness**: `High`
  - **Feedback**: "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."

---

## Turn 9: Day 29 Challenge Follow-up
- **Interviewer Question**: 
  > "That's a solid answer. Moving deeper: how would you address scalability concerns, performance bottlenecks, or race conditions when deploying this setup in production?"
- **Candidate Answer**: 
  > "I would structure a FastAPI app with uvicorn, package it with a Dockerfile, and create a Kubernetes deployment.yaml specifying CPU limits, and configure liveness/readiness probes targeting a health route."
- **Evaluation**:
  - **Score**: `5` (Excellent/Detailed response)
  - **Correctness**: `High`
  - **Feedback**: "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."

---

## Turn 10: Interview Complete & Feedback Compilation
- **Interviewer**: "Interview completed."
- **Feedback Output**:
  ```json
  {
    "summary": "Interview Summary for Sarah Johnson (Senior Data Engineer): The candidate achieved an average score of 5.0/5.0. They showed robust conceptual understanding in core topics, with some areas for growth in advanced system designs.",
    "strengths": [
      "Demonstrated strong practical understanding of Day 4 concepts: The candidate demonstrated strong understanding with a detai...",
      "Demonstrated strong practical understanding of Day 4 concepts: The candidate demonstrated strong understanding with a detai...",
      "Demonstrated strong practical understanding of Day 7 concepts: The candidate demonstrated strong understanding with a detai..."
    ],
    "gaps": [
      "No major gaps identified. Maintain current learning path."
    ],
    "next": [
      "Proceed to build advanced capstone architectures and explore model fine-tuning."
    ]
  }
  ```
