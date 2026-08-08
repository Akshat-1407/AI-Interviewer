import os
import sys

# Ensure backend folder is in path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from app.data_loader import load_candidates, select_interview_days
from app.graph import interview_graph

def run_simulation():
    print("--- Starting Interview Agent Simulation ---")
    
    # 1. Load candidate
    candidates = load_candidates()
    if not candidates:
        print("Error: No candidates found.")
        sys.exit(1)
        
    candidate = candidates[0] # Sarah Johnson (Senior Data Engineer)
    member = candidate["member"]
    print(f"Candidate: {member['name']} | Role: {member['jobRole']} | Exp: {member['yearsExperience']} years")
    
    # 2. Select days
    selected_days = select_interview_days(candidate)
    print(f"Selected Curriculum Days: {selected_days}")
    assert len(selected_days) >= 4, f"Should select at least 4 days, got {len(selected_days)}"
    
    # 3. Initialize state (similar to start session)
    state = {
        "session_id": "sim-session-123",
        "candidate": candidate,
        "selected_days": selected_days,
        "current_day_idx": 0,
        "current_question_idx": 0,
        "current_question_text": "",
        "history": [],
        "evaluations": [],
        "done": False,
        "feedback": None,
        "last_message": "Hello, I am ready to begin my interview.",
        "reply": "Welcome. Let's begin your interview."
    }
    
    print("\n--- Starting Conversation turns ---")
    
    # 4. Run through turns
    # Turn 1: Candidate says hello, graph generates Q1
    state = interview_graph.invoke(state)
    print(f"\n[Interviewer Q1 (Day {selected_days[state['current_day_idx']]} - idx {state['current_question_idx']})]: {state['reply']}")
    assert state["current_question_idx"] == 1
    assert not state["done"]
    
    # Answers list to mock candidate response
    answers = [
        "To set up virtual environments in python, I use 'python -m venv .venv'. Then I configure VS Code settings to point to the virtual environment python interpreter, and use Pylance for language intelligence.",
        "For a FastAPI health endpoint, I define a GET route returning status OK. In React Vite, I fetch this endpoint during component mount and set status state.",
        "I load data using pandas.read_csv(), clean nulls or format dates, then write to SQLite using df.to_sql() with SQLAlchemy's create_engine().",
        "Sparse embeddings use frequency (TF-IDF), while dense embeddings capture semantics using neural networks. OpenAI embeddings are hosted and highly powerful, while SentenceTransformers are run locally and cost-effective.",
        "Hybrid search combines SQL for structured metadata queries and vector database queries (like Chroma) for unstructured text chunk retrieval, merging and ranking results by combined scores.",
        "Zero-shot asks directly, few-shot provides examples in prompt, and Chain-of-Thought asks the LLM to write step-by-step reasoning. Prompt injection is prevented by strict schema validation and separating system instructions.",
        "I define a Pydantic model showing the expected fields. Then I pass it as a tool or response_format schema to OpenAI/Gemini client to guarantee the output matches exactly.",
        "I would structure a FastAPI app with uvicorn, package it with a Dockerfile, and create a Kubernetes deployment.yaml specifying CPU limits, and configure liveness/readiness probes targeting a health route.",
    ]
    
    # Run turns 2 to 9
    for i in range(1, 8):
        # Candidate submits answer to Q_i
        state["last_message"] = answers[i - 1]
        state = interview_graph.invoke(state)
        
        print(f"\nCandidate: {answers[i - 1]}")
        print(f"[Interviewer Q{i+1} (Day {selected_days[state['current_day_idx']]} - idx {state['current_question_idx']})]: {state['reply']}")
        assert state["current_question_idx"] == i + 1
        assert not state["done"]
        
    # Final turn: Candidate answers Q8
    print(f"\nCandidate: {answers[7]}")
    state["last_message"] = answers[7]
    state = interview_graph.invoke(state)
    
    print(f"\n[Interviewer Final]: {state['reply']}")
    print(f"Done: {state['done']}")
    
    # 5. Assert interview completed successfully
    assert state["done"] is True, "Interview should be marked done"
    assert state["feedback"] is not None, "Final feedback should be generated"
    
    fb = state["feedback"]
    print("\n--- Final Feedback Report ---")
    print(f"Summary: {fb['summary']}")
    print(f"Strengths: {fb['strengths']}")
    print(f"Gaps: {fb['gaps']}")
    print(f"Next Steps: {fb['next']}")
    
    assert "summary" in fb
    assert isinstance(fb["strengths"], list) and len(fb["strengths"]) > 0
    assert isinstance(fb["gaps"], list) and len(fb["gaps"]) > 0
    assert isinstance(fb["next"], list) and len(fb["next"]) > 0
    assert len(state["evaluations"]) == 8, f"Should have 8 evaluations, got {len(state['evaluations'])}"
    
    print("\n--- Simulation Successful! All assertions passed. ---")

if __name__ == "__main__":
    run_simulation()
