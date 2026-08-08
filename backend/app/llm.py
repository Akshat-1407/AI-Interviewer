import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from . import config

# Structured schemas for LLM responses
class EvaluationResult(BaseModel):
    score: int = Field(description="Score from 1 to 5 based on technical depth and correctness. 1 means poor/unknown, 5 means excellent/senior-level.")
    correctness: str = Field(description="Correctness rating: 'High', 'Medium', or 'Low'")
    gaps_identified: List[str] = Field(default_factory=list, description="List of specific technical gaps identified in the candidate's answer")
    evaluation_feedback: str = Field(description="Constructive and professional feedback detailing what was good or what was missing.")

class FeedbackResult(BaseModel):
    summary: str = Field(description="A detailed, evidence-based overall summary of the candidate's performance across the entire interview")
    strengths: List[str] = Field(description="Concise, actionable bullet points of the candidate's strengths shown during the interview")
    gaps: List[str] = Field(description="Concise, actionable bullet points of technical gaps observed in their answers")
    next: List[str] = Field(description="Recommended next steps or specific curriculum days they should study/review")

# Initializing LLM Clients based on config
def get_llm():
    if config.LLM_PROVIDER == "gemini":
        if not config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured in .env")
        return ChatGoogleGenerativeAI(
            model=config.GEMINI_MODEL,
            google_api_key=config.GEMINI_API_KEY,
            temperature=0.7
        )
    elif config.LLM_PROVIDER == "openai":
        if not config.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured in .env")
        return ChatOpenAI(
            model=config.OPENAI_MODEL,
            api_key=config.OPENAI_API_KEY,
            temperature=0.7
        )
    else:
        # Mock mode
        return None

# Mock responses helper for development and test validation
def run_mock_evaluate(question: str, answer: str, day: int) -> EvaluationResult:
    ans = answer.strip().lower()
    if not ans or len(ans) < 15 or any(w in ans for w in ["skip", "don't know", "no idea", "unsure", "not sure"]):
        return EvaluationResult(
            score=2,
            correctness="Low",
            gaps_identified=[f"Day {day} Core Concepts"],
            evaluation_feedback="The candidate was unable to provide a detailed explanation of the topic. Further review of the fundamentals is recommended."
        )
    
    # Check for some basic keywords depending on the day
    score = 4
    correctness = "High"
    gaps = []
    
    # Generic feedback based on length of response
    if len(ans) > 100:
        feedback = "The candidate demonstrated strong understanding with a detailed answer, outlining clear technical steps."
        score = 5
    elif len(ans) > 40:
        feedback = "The candidate provided a solid answer covering the basic requirements of the question."
        score = 4
    else:
        feedback = "The candidate answered correctly but could have added more technical detail and depth."
        score = 3
        correctness = "Medium"
        gaps = [f"Advanced details of Day {day}"]
        
    return EvaluationResult(
        score=score,
        correctness=correctness,
        gaps_identified=gaps,
        evaluation_feedback=feedback
    )

def run_mock_question(candidate_profile: Dict[str, Any], day_info: Dict[str, Any], is_followup: bool, prev_evaluation: Optional[Dict[str, Any]]) -> str:
    role = candidate_profile.get("member", {}).get("jobRole", "Developer")
    experience = candidate_profile.get("member", {}).get("yearsExperience", 2)
    seniority = "Senior" if experience >= 8 else "Junior" if experience <= 2 else "Mid-level"
    
    day_num = day_info.get("day")
    day_title = day_info.get("title")
    objectives = day_info.get("objectives", ["Understand the day's tools"])
    tools = day_info.get("tools", [])
    
    if not is_followup:
        # Conceptual Main Question
        if day_num == 1:
            return f"Let's discuss Day 1: {day_title}. As a {seniority} engineer, how do you set up and troubleshoot python virtual environments and code extensions in VS Code?"
        elif day_num == 3:
            return f"Looking at Day 3: {day_title}. How would you design a FastAPI health endpoint and connect a React application built with Vite to it?"
        elif day_num == 4:
            return f"Regarding Day 4: {day_title}. How do you load and clean a large CSV file using Pandas, and what is your process for loading it into SQLite using SQLAlchemy?"
        elif day_num == 7:
            return f"Let's discuss Day 7: {day_title}. How do you explain the difference between sparse and dense vector embeddings, and when would you choose Sentence Transformers over OpenAI embeddings?"
        elif day_num == 10:
            return f"On Day 10: {day_title}. How do you design a hybrid retrieval system that combines SQL queries for structured metadata and vector search for unstructured data?"
        elif day_num == 12:
            return f"For Day 12: {day_title}. What are the key differences between Zero-Shot, Few-Shot, and Chain-of-Thought prompting, and how do you prevent prompt injection?"
        elif day_num == 13:
            return f"Regarding Day 13: {day_title}. How do you implement reliable function calling using Pydantic models to validate the structured output of an LLM?"
        elif day_num == 16:
            return f"On Day 16: {day_title}. How would you design and secure a session-based `/chat` FastAPI backend that handles multi-turn conversation memory?"
        elif day_num == 22:
            return f"Let's discuss Day 22: {day_title}. How do you orchestrate a multi-agent workflow using LangGraph or CrewAI, and how do you handle routing between specialized agents?"
        elif day_num == 23:
            return f"Regarding Day 23: {day_title}. What is the Model Context Protocol (MCP), and how would you build an MCP server to expose local database tools to Claude?"
        elif day_num == 28:
            return f"For Day 28: {day_title}. How do you containerize a multi-container FastAPI + React app with Docker, and configure Kubernetes liveness and readiness probes?"
        elif day_num == 29:
            return f"On Day 29: {day_title}. How do you set up structured logging in Python and configure Prometheus metrics to monitor LLM token usage and latency?"
        elif day_num == 31:
            return f"Finally, for Day 31: {day_title}. How do you structure a production-grade Capstone demo showcasing RAG, agentic workflows, and containerized deployment?"
        else:
            return f"Let's discuss Day {day_num}: {day_title}. What are the primary objectives of using {', '.join(tools[:3])} in this module, and how do you verify your setup?"
    else:
        # Follow-up Question
        prev_score = prev_evaluation.get("score", 3) if prev_evaluation else 3
        if prev_score < 3:
            return f"No worries, let's break that down a bit. Can you explain the basic steps you would take to debug a simple connection issue using {tools[0] if tools else 'the core tools'}?"
        else:
            return f"That's a solid answer. Moving deeper: how would you address scalability concerns, performance bottlenecks, or race conditions when deploying this setup in production?"

def run_mock_feedback(candidate_profile: Dict[str, Any], history: List[Dict[str, str]], evaluations: List[Dict[str, Any]]) -> FeedbackResult:
    name = candidate_profile.get("member", {}).get("name", "Candidate")
    role = candidate_profile.get("member", {}).get("jobRole", "Developer")
    
    scores = [e.get("score", 3) for e in evaluations]
    avg_score = sum(scores) / len(scores) if scores else 3.0
    
    strengths = []
    gaps = []
    next_steps = []
    
    for eval_item in evaluations:
        day = eval_item.get("day")
        score = eval_item.get("score", 3)
        feedback = eval_item.get("evaluation_feedback", "")
        
        if score >= 4:
            strengths.append(f"Demonstrated strong practical understanding of Day {day} concepts: {feedback[:60]}...")
        else:
            gaps.append(f"Could improve depth in Day {day} objectives: {feedback[:60]}...")
            next_steps.append(f"Review Day {day} objectives and tools.")
            
    if not strengths:
        strengths = ["Showed great enthusiasm and a foundational approach to programming concepts."]
    if not gaps:
        gaps = ["No major gaps identified. Maintain current learning path."]
    if not next_steps:
        next_steps = ["Proceed to build advanced capstone architectures and explore model fine-tuning."]
        
    summary = f"Sarah Johnson" if name == "Sarah Johnson" else name
    summary = f"Interview Summary for {name} ({role}): The candidate achieved an average score of {avg_score:.1f}/5.0. They showed robust conceptual understanding in core topics, with some areas for growth in advanced system designs."
    
    return FeedbackResult(
        summary=summary,
        strengths=strengths[:3],
        gaps=gaps[:3],
        next=next_steps[:3]
    )

# Public interface functions
def evaluate_answer(question: str, answer: str, candidate_profile: Dict[str, Any], day_info: Dict[str, Any]) -> EvaluationResult:
    llm = get_llm()
    day = day_info.get("day", 1)
    if not llm:
        return run_mock_evaluate(question, answer, day)
        
    # LangChain implementation with structured output
    parser = PydanticOutputParser(pydantic_object=EvaluationResult)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical interviewer evaluating an answer for an AI course. "
                   "Rate the candidate's answer from 1 (poor/incorrect) to 5 (excellent, demonstrating deep technical seniority). "
                   "Provide clear, constructive feedback and identify any technical gaps.\n{format_instructions}"),
        ("human", "Candidate Profile:\n- Name: {name}\n- Role: {role}\n- Experience: {experience} years\n\n"
                  "Curriculum Day {day_num} Topic: {day_title}\n"
                  "Objectives: {objectives}\n"
                  "Tools: {tools}\n\n"
                  "Question Asked: {question}\n"
                  "Candidate Answer: {answer}")
    ])
    
    chain = prompt | llm | parser
    try:
        res = chain.invoke({
            "format_instructions": parser.get_format_instructions(),
            "name": candidate_profile.get("member", {}).get("name", "Candidate"),
            "role": candidate_profile.get("member", {}).get("jobRole", "Developer"),
            "experience": candidate_profile.get("member", {}).get("yearsExperience", 2),
            "day_num": day,
            "day_title": day_info.get("title"),
            "objectives": ", ".join(day_info.get("objectives", [])),
            "tools": ", ".join(day_info.get("tools", [])),
            "question": question,
            "answer": answer
        })
        return res
    except Exception as e:
        # Fall back to mock on error to maintain high availability
        print(f"LLM evaluation failed: {e}. Falling back to mock evaluation.")
        return run_mock_evaluate(question, answer, day)

def generate_question(candidate_profile: Dict[str, Any], day_info: Dict[str, Any], is_followup: bool, prev_evaluation: Optional[Dict[str, Any]] = None, history: List[Dict[str, str]] = None) -> str:
    llm = get_llm()
    if not llm:
        return run_mock_question(candidate_profile, day_info, is_followup, prev_evaluation)
        
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a professional, realistic AI technical interviewer. "
                   "Generate a single, natural, and conversational interview question. "
                   "Do NOT include greeting, introductory phrases, or any markdown structure other than the question text. "
                   "Adapt the question's technical depth based on the candidate's seniority (Junior, Mid-level, Senior).\n"
                   "Context: {context}"),
        ("human", "Candidate Profile:\n- Name: {name}\n- Role: {role}\n- Experience: {experience} years\n\n"
                  "Curriculum Day {day_num} Topic: {day_title}\n"
                  "Objectives: {objectives}\n"
                  "Tools: {tools}\n\n"
                  "{followup_prompt}")
    ])
    
    context = ""
    if history:
        context_turns = [f"{t['role'].capitalize()}: {t['text']}" for t in history[-4:]]
        context = "Recent conversation history:\n" + "\n".join(context_turns)
        
    followup_prompt = "This is the primary question of the day. Ask a conceptual, high-quality question about this topic."
    if is_followup and prev_evaluation:
        score = prev_evaluation.get("score", 3)
        feedback = prev_evaluation.get("evaluation_feedback", "")
        if score < 3:
            followup_prompt = f"The candidate struggled with the previous question (score {score}). Feedback: {feedback}. Ask a simpler, clarifying or guiding follow-up question to help them demonstrate basic understanding."
        else:
            followup_prompt = f"The candidate performed well on the previous question (score {score}). Feedback: {feedback}. Ask a challenging, deeper follow-up question, exploring production tradeoffs, failures, or architecture."
            
    chain = prompt | llm
    try:
        res = chain.invoke({
            "context": context,
            "name": candidate_profile.get("member", {}).get("name", "Candidate"),
            "role": candidate_profile.get("member", {}).get("jobRole", "Developer"),
            "experience": candidate_profile.get("member", {}).get("yearsExperience", 2),
            "day_num": day_info.get("day"),
            "day_title": day_info.get("title"),
            "objectives": ", ".join(day_info.get("objectives", [])),
            "tools": ", ".join(day_info.get("tools", [])),
            "followup_prompt": followup_prompt
        })
        return res.content.strip()
    except Exception as e:
        print(f"LLM question generation failed: {e}. Falling back to mock question.")
        return run_mock_question(candidate_profile, day_info, is_followup, prev_evaluation)

def generate_feedback(candidate_profile: Dict[str, Any], history: List[Dict[str, str]], evaluations: List[Dict[str, Any]]) -> FeedbackResult:
    llm = get_llm()
    if not llm:
        return run_mock_feedback(candidate_profile, history, evaluations)
        
    parser = PydanticOutputParser(pydantic_object=FeedbackResult)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical interviewer writing a final evaluation report for a candidate. "
                   "Provide a highly detailed, professional, evidence-based performance report based on the candidate's answers and their evaluations. "
                   "Highlight specific strengths and gaps shown in the interview, and recommend next learning steps linked to curriculum areas.\n{format_instructions}"),
        ("human", "Candidate Profile:\n- Name: {name}\n- Role: {role}\n- Experience: {experience} years\n\n"
                  "Interview Transcript & Evaluation History:\n{history_eval_text}")
    ])
    
    # Construct history evaluation text
    history_eval_text = ""
    for i, eval_item in enumerate(evaluations):
        history_eval_text += f"Turn {i+1} (Day {eval_item.get('day')}): \n"
        history_eval_text += f"- Question: {eval_item.get('question')}\n"
        history_eval_text += f"- Answer: {eval_item.get('answer')}\n"
        history_eval_text += f"- Score: {eval_item.get('score')}/5\n"
        history_eval_text += f"- Feedback: {eval_item.get('evaluation_feedback')}\n\n"
        
    chain = prompt | llm | parser
    try:
        res = chain.invoke({
            "format_instructions": parser.get_format_instructions(),
            "name": candidate_profile.get("member", {}).get("name", "Candidate"),
            "role": candidate_profile.get("member", {}).get("jobRole", "Developer"),
            "experience": candidate_profile.get("member", {}).get("yearsExperience", 2),
            "history_eval_text": history_eval_text
        })
        return res
    except Exception as e:
        print(f"LLM feedback generation failed: {e}. Falling back to mock feedback.")
        return run_mock_feedback(candidate_profile, history, evaluations)
