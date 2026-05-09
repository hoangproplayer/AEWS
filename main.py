from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import sqlite3
import os
import random
from datetime import datetime

app = FastAPI()

# Database setup
DB_PATH = "data.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        class TEXT,
        gpa REAL DEFAULT 0,
        level TEXT DEFAULT 'SAFE',
        status TEXT DEFAULT 'ACTIVE',
        lastAnalyzed TEXT
      )
    """)
    cursor.execute("""
      CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    """)
    cursor.execute("""
      CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        condition TEXT,
        level TEXT,
        status TEXT DEFAULT 'Active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    """)
    cursor.execute("""
      CREATE TABLE IF NOT EXISTS counseling_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId TEXT NOT NULL,
        studentName TEXT NOT NULL,
        reason TEXT NOT NULL,
        notes TEXT NOT NULL,
        commitment TEXT,
        date TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    """)
    conn.commit()
    
    # Seed data if empty
    cursor.execute("SELECT COUNT(*) FROM students")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO students (id, name, class, gpa, level) VALUES (?, ?, ?, ?, ?)", 
                       ('2012001', 'Nguyễn Văn A', '20CNTT1', 3.2, 'SAFE'))
        cursor.execute("INSERT INTO students (id, name, class, gpa, level) VALUES (?, ?, ?, ?, ?)", 
                       ('2012002', 'Trần Thị B', '20CNTT2', 1.8, 'WARNING'))
        cursor.execute("INSERT INTO students (id, name, class, gpa, level) VALUES (?, ?, ?, ?, ?)", 
                       ('2012003', 'Lê Văn C', '20CNTT1', 0.9, 'DANGER'))
        conn.commit()
    conn.close()

init_db()

# Models
class Student(BaseModel):
    id: str
    name: str
    class_name: Optional[str] = Field(None, alias="class")
    gpa: float = 0.0
    level: str = "SAFE"

class PredictionRequest(BaseModel):
    students: List[dict]

class CounselingLog(BaseModel):
    id: Optional[int] = None
    studentId: str
    studentName: str
    reason: str
    notes: str
    commitment: Optional[str] = None
    date: str

class Rule(BaseModel):
    name: str
    condition: str
    level: str
    status: str = "Active"

@app.get("/api/counseling")
async def get_counseling_logs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM counseling_logs ORDER BY createdAt DESC")
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return logs

@app.post("/api/counseling")
async def add_counseling_log(log: CounselingLog):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO counseling_logs (studentId, studentName, reason, notes, date) VALUES (?, ?, ?, ?, ?)",
            (log.studentId, log.studentName, log.reason, log.notes, log.date)
        )
        conn.commit()
        log_id = cursor.lastrowid
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
    return {"success": True, "id": log_id}

@app.put("/api/counseling/{log_id}")
async def update_counseling_log(log_id: int, log: CounselingLog):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE counseling_logs SET reason = ?, notes = ?, commitment = ?, date = ? WHERE id = ?",
            (log.reason, log.notes, log.commitment, log.date, log_id)
        )
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
    return {"success": True}

@app.delete("/api/counseling/{log_id}")
async def delete_counseling_log(log_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM counseling_logs WHERE id = ?", (log_id,))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
    return {"success": True}

@app.post("/api/rules")
async def add_rule(rule: Rule):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO rules (name, condition, level, status) VALUES (?, ?, ?, ?)",
            (rule.name, rule.condition, rule.level, rule.status)
        )
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
    return {"success": True}

@app.get("/api/students")
async def get_students():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students")
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return students

@app.post("/api/students")
async def add_student(student: Student):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Use alias or direct field
        c_name = student.class_name
        cursor.execute(
            "INSERT INTO students (id, name, class, gpa, level) VALUES (?, ?, ?, ?, ?)",
            (student.id, student.name, c_name, student.gpa, student.level)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    finally:
        conn.close()
    return {"success": True}

@app.get("/api/rules")
async def get_rules():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rules ORDER BY createdAt DESC")
    rules = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rules

@app.post("/api/ai/predict-risk")
async def predict_risk(request: PredictionRequest):
    predictions = []
    for student in request.students:
        gpa = student.get("gpa", 0)
        risk_score = 0
        if gpa < 2.0:
            risk_score = random.uniform(80, 100)
        elif gpa < 2.5:
            risk_score = random.uniform(50, 80)
        else:
            risk_score = random.uniform(0, 30)
            
        predictions.append({
            "id": student.get("id"),
            "name": student.get("name"),
            "predictedRisk": round(risk_score),
            "recommendation": "Can thiệp ngay" if risk_score > 70 else "Theo dõi sát" if risk_score > 40 else "Ổn định"
        })
    return {"predictions": predictions}

@app.get("/api/health")
async def root():
    return {"status": "ok", "backend": "python"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
