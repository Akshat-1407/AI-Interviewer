import os
import json
from typing import List, Dict, Any, Optional

# Find backend directory relative to this file
# This file is in: workspace/backend/app/data_loader.py
# Backend dir is: workspace/backend/
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_curriculum() -> Dict[str, Any]:
    path = os.path.join(BACKEND_DIR, "curriculum.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_candidates() -> List[Dict[str, Any]]:
    path = os.path.join(BACKEND_DIR, "candidates.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get("candidates", [])

def get_candidate_by_id(candidate_id: str) -> Optional[Dict[str, Any]]:
    candidates = load_candidates()
    for c in candidates:
        if c.get("member", {}).get("id") == candidate_id:
            return c
    return None

def select_interview_days(candidate: Dict[str, Any]) -> List[int]:
    """
    Select at least 4 curriculum days based on candidate profile and progress:
    1. A day passed on the first attempt (strength/confidence).
    2. A day passed but took 3+ attempts (effort/improvement area).
    3. A day skipped or failed (passed=false or skipped=true) (gap).
    4. A day aligned with their job role or experience (relevance).
    
    If candidate doesn't have matching days, fall back to a set of 4 diverse days.
    """
    missions = candidate.get("missions", [])
    
    passed_first_try = []
    struggled_days = []
    skipped_or_failed = []
    
    for m in missions:
        day = m.get("day")
        passed = m.get("passed", False)
        skipped = m.get("skipped", False)
        attempts = m.get("attempts", 0)
        
        if skipped or (not passed and attempts > 0):
            skipped_or_failed.append(day)
        elif passed:
            if attempts == 1:
                passed_first_try.append(day)
            elif attempts >= 3:
                struggled_days.append(day)
                
    # Find role-based relevance days
    role = candidate.get("member", {}).get("jobRole", "").lower()
    role_days = []
    if "data" in role:
        # Day 4 (structured data), Day 7 (embeddings), Day 10 (retrieval), Day 28 (docker)
        role_days = [4, 7, 10, 28]
    elif "backend" in role or "software" in role:
        # Day 3 (fastapi), Day 16 (backend integration), Day 22 (multi-agent), Day 28 (docker)
        role_days = [3, 16, 22, 28]
    elif "ai" in role or "machine" in role or "ml" in role:
        # Day 11 (rag), Day 13 (function calling), Day 22 (multi-agent), Day 23 (mcp)
        role_days = [11, 13, 22, 23]
    elif "devops" in role:
        # Day 1 (python setup), Day 28 (docker/k8s), Day 29 (monitoring), Day 31 (demo)
        role_days = [1, 28, 29, 31]
    else:
        role_days = [3, 12, 22, 31]
        
    selected = set()
    
    # 1. Add strength day
    if passed_first_try:
        selected.add(passed_first_try[0])
        
    # 2. Add effort/improvement day
    if struggled_days:
        selected.add(struggled_days[0])
        
    # 3. Add gap day
    if skipped_or_failed:
        selected.add(skipped_or_failed[0])
        
    # 4. Add role-relevant days that aren't already selected
    for rd in role_days:
        if len(selected) >= 4:
            break
        selected.add(rd)
        
    # Fallback to make sure we have exactly 4 distinct days if we didn't get enough
    fallbacks = [7, 12, 16, 22]
    for fd in fallbacks:
        if len(selected) >= 4:
            break
        selected.add(fd)
        
    # If still not 4, add consecutive days from the curriculum
    curr = load_curriculum()
    all_curriculum_days = [d.get("day") for d in curr.get("days", [])]
    for d in all_curriculum_days:
        if len(selected) >= 4:
            break
        selected.add(d)
        
    # Return sorted list of days
    return sorted(list(selected))
