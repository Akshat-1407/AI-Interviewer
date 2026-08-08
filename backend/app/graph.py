from typing import Dict, Any, List, Optional, TypedDict
from langgraph.graph import StateGraph, END
from .llm import evaluate_answer, generate_question, generate_feedback
from .data_loader import load_curriculum

class InterviewState(TypedDict):
    session_id: str
    candidate: Dict[str, Any]
    selected_days: List[int]
    current_day_idx: int
    current_question_idx: int
    current_question_text: str
    history: List[Dict[str, str]]
    evaluations: List[Dict[str, Any]]
    done: bool
    feedback: Optional[Dict[str, Any]]
    last_message: str
    reply: str

def process_turn_node(state: InterviewState) -> InterviewState:
    session_id = state.get("session_id", "")
    candidate = state.get("candidate", {})
    selected_days = state.get("selected_days", [])
    current_question_idx = state.get("current_question_idx", 0)
    current_question_text = state.get("current_question_text", "")
    history = list(state.get("history", []))
    evaluations = list(state.get("evaluations", []))
    last_message = state.get("last_message", "")
    
    # 1. Append candidate answer to history
    if last_message:
        history.append({"role": "candidate", "text": last_message})
        
    # 2. If a question was active, evaluate it
    if current_question_idx > 0 and current_question_text:
        # The day index is calculated based on the question that was answered
        # current_question_idx represents the count before this turn's question was generated
        day_idx = (current_question_idx - 1) // 2
        
        # Prevent out-of-bounds just in case
        if day_idx < len(selected_days):
            day_num = selected_days[day_idx]
            curriculum = load_curriculum()
            day_info = next(
                (d for d in curriculum.get("days", []) if d.get("day") == day_num), 
                {"day": day_num, "title": f"Day {day_num}"}
            )
            
            # Evaluate using LLM
            eval_result = evaluate_answer(
                question=current_question_text,
                answer=last_message,
                candidate_profile=candidate,
                day_info=day_info
            )
            
            evaluations.append({
                "day": day_num,
                "question": current_question_text,
                "answer": last_message,
                "score": eval_result.score,
                "correctness": eval_result.correctness,
                "gaps_identified": eval_result.gaps_identified,
                "evaluation_feedback": eval_result.evaluation_feedback
            })
            
    return {
        **state,
        "history": history,
        "evaluations": evaluations
    }

def should_continue_router(state: InterviewState) -> str:
    current_question_idx = state.get("current_question_idx", 0)
    if current_question_idx >= 8:
        return "complete_interview"
    else:
        return "ask_question"

def ask_question_node(state: InterviewState) -> InterviewState:
    candidate = state.get("candidate", {})
    selected_days = state.get("selected_days", [])
    current_question_idx = state.get("current_question_idx", 0)
    history = list(state.get("history", []))
    evaluations = list(state.get("evaluations", []))
    
    # Determine the day and follow-up flag for the new question
    day_idx = current_question_idx // 2
    if day_idx >= len(selected_days):
        # Fallback in case index is out of bounds
        day_idx = len(selected_days) - 1
        
    day_num = selected_days[day_idx]
    is_followup = (current_question_idx % 2 == 1)
    
    # Load curriculum details
    curriculum = load_curriculum()
    day_info = next(
        (d for d in curriculum.get("days", []) if d.get("day") == day_num), 
        {"day": day_num, "title": f"Day {day_num}"}
    )
    
    # Get previous evaluation if follow-up
    prev_evaluation = None
    if is_followup and evaluations:
        prev_evaluation = evaluations[-1]
        
    # Generate the question
    question = generate_question(
        candidate_profile=candidate,
        day_info=day_info,
        is_followup=is_followup,
        prev_evaluation=prev_evaluation,
        history=history
    )
    
    history.append({"role": "interviewer", "text": question})
    
    return {
        **state,
        "current_question_idx": current_question_idx + 1,
        "current_day_idx": day_idx,
        "current_question_text": question,
        "history": history,
        "reply": question
    }

def complete_interview_node(state: InterviewState) -> InterviewState:
    candidate = state.get("candidate", {})
    history = state.get("history", [])
    evaluations = state.get("evaluations", [])
    
    # Generate structured feedback
    report = generate_feedback(
        candidate_profile=candidate,
        history=history,
        evaluations=evaluations
    )
    
    feedback = {
        "summary": report.summary,
        "strengths": report.strengths,
        "gaps": report.gaps,
        "next": report.next
    }
    
    return {
        **state,
        "done": True,
        "feedback": feedback,
        "reply": "Interview completed."
    }

def create_interview_graph():
    builder = StateGraph(InterviewState)
    
    builder.add_node("process_turn", process_turn_node)
    builder.add_node("ask_question", ask_question_node)
    builder.add_node("complete_interview", complete_interview_node)
    
    builder.set_entry_point("process_turn")
    
    builder.add_conditional_edges(
        "process_turn",
        should_continue_router,
        {
            "ask_question": "ask_question",
            "complete_interview": "complete_interview"
        }
    )
    
    builder.add_edge("ask_question", END)
    builder.add_edge("complete_interview", END)
    
    return builder.compile()

# Singleton graph instance
interview_graph = create_interview_graph()
