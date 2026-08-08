import sqlite3
import json
import os
from typing import Dict, Any, Optional
from .config import DATABASE_URL

def get_db_connection():
    # Strip sqlite:/// prefix
    db_path = DATABASE_URL.replace("sqlite:///", "")
    # Ensure folder path exists
    db_dir = os.path.dirname(os.path.abspath(db_path))
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interview_sessions (
            session_id TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_session_state(session_id: str, state: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    state_json = json.dumps(state)
    cursor.execute("""
        INSERT OR REPLACE INTO interview_sessions (session_id, state_json, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    """, (session_id, state_json))
    conn.commit()
    conn.close()

def load_session_state(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT state_json FROM interview_sessions WHERE session_id = ?
    """, (session_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["state_json"])
    return None

# Auto-initialize database on import
init_db()
