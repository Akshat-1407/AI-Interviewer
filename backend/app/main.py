from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from .database import save_session_state, load_session_state
from .data_loader import select_interview_days, load_candidates, load_curriculum
from .graph import interview_graph
import os
from dotenv import load_dotenv

app = FastAPI(title="The Interview Agent API", version="1.0.0")

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(backend_dir, '.env'))

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FRONTEND_ORIGINS = list(
    dict.fromkeys(
        [
            FRONTEND_URL,
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for request validation
class CandidateModel(BaseModel):
    member: Dict[str, Any]
    missions: List[Dict[str, Any]]
    signals: Dict[str, Any]

class StartInterviewRequest(BaseModel):
    sessionId: str
    candidate: CandidateModel

class TurnRequest(BaseModel):
    sessionId: str
    message: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/candidates")
def get_candidates():
    return load_candidates()

@app.get("/api/curriculum")
def get_curriculum():
    return load_curriculum()

@app.post("/api/interview")
def handle_interview_turn(request: Dict[str, Any]):
    # Since the request can be a start request (with candidate) or a subsequent request (with message),
    # we handle both in the same endpoint using dict parsing.
    session_id = request.get("sessionId")
    if not session_id:
        raise HTTPException(status_code=400, detail="sessionId is required")
        
    candidate_data = request.get("candidate")
    
    if candidate_data:
        # Step 1: Start Interview (Initialization)
        # Check if session already exists
        existing = load_session_state(session_id)
        if existing:
            # Re-initialize or return welcome message
            return {
                "reply": existing.get("reply", "Welcome. Let's begin your interview."),
                "done": existing.get("done", False)
            }
            
        # Select 4 days based on candidate progress
        selected_days = select_interview_days(candidate_data)
        
        # Initialize LangGraph state
        initial_state = {
            "session_id": session_id,
            "candidate": candidate_data,
            "selected_days": selected_days,
            "current_day_idx": 0,
            "current_question_idx": 0,
            "current_question_text": "",
            "history": [],
            "evaluations": [],
            "done": False,
            "feedback": None,
            "last_message": "",
            "reply": "Welcome. Let's begin your interview."
        }
        
        save_session_state(session_id, initial_state)
        
        return {
            "reply": "Welcome. Let's begin your interview.",
            "done": False,
            "selected_days": selected_days
        }
        
    else:
        # Step 2: Conversation Turn
        message = request.get("message")
        if message is None:
            raise HTTPException(status_code=400, detail="Either 'candidate' (for starting) or 'message' (for turns) must be provided.")
            
        # Load state from SQLite
        state = load_session_state(session_id)
        if not state:
            raise HTTPException(status_code=404, detail="Interview session not found. Please start the interview first.")
            
        if state.get("done", False):
            # Already completed
            return {
                "reply": state.get("reply", "Interview completed."),
                "done": True,
                "feedback": state.get("feedback")
            }
            
        # Set user's message and invoke graph
        state["last_message"] = message
        
        try:
            updated_state = interview_graph.invoke(state)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Graph execution failed: {str(e)}")
            
        # Save updated state
        save_session_state(session_id, updated_state)
        
        # Prepare response based on interview status
        if updated_state.get("done", False):
            return {
                "reply": updated_state.get("reply", "Interview completed."),
                "done": True,
                "feedback": updated_state.get("feedback")
            }
        else:
            return {
                "reply": updated_state.get("reply"),
                "done": False
            }
