from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, date, time
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection function
def get_db_connection():
    """
    Establishes and returns a connection to the PostgreSQL database.
    """
    return psycopg2.connect(
        dbname="biofeedback_db",
        user="yash",
        password="tLiktbti07!",
        host="localhost",
        cursor_factory=RealDictCursor
    )

class MetricData(BaseModel):
    score: Optional[int] = None
    notes: Optional[str] = None

# Pydantic model for biofeedback data
class BiofeedbackEntry(BaseModel):
    """
    Defines the structure and validation for a biofeedback entry.
    """
    date: str
    time: str
    metrics: Dict[str, MetricData]
    additional_notes: List[str]
    summary: str

# API endpoints
@app.post("/biofeedback")
async def create_biofeedback_entry(entry: BiofeedbackEntry):
    """
    Creates a new biofeedback entry in the database without clearing existing entries.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Insert new entry without clearing existing data
        cur.execute("""
            INSERT INTO biofeedback (date, time, mood, gym_performance, soreness, sleep_quality, 
            energy_levels, sex_drive, hunger_levels, cravings, digestion, additional_notes, summary)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            entry.date,
            entry.time,
            entry.metrics.get('mood', MetricData()).score,
            entry.metrics.get('gym_performance', MetricData()).score,
            entry.metrics.get('soreness', MetricData()).score,
            entry.metrics.get('sleep_quality', MetricData()).score,
            entry.metrics.get('energy_levels', MetricData()).score,
            entry.metrics.get('sex_drive', MetricData()).score,
            entry.metrics.get('hunger_levels', MetricData()).score,
            entry.metrics.get('cravings', MetricData()).score,
            entry.metrics.get('digestion', MetricData()).score,
            entry.additional_notes,
            entry.summary
        ))
        new_id = cur.fetchone()['id']
        conn.commit()
        return {"id": new_id, "message": "New entry created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/biofeedback")
async def get_biofeedback_entries(
    start_date: Optional[date] = Query(None, description="Start date for filtering entries"),
    end_date: Optional[date] = Query(None, description="End date for filtering entries")
):
    """
    Retrieves biofeedback entries, optionally filtered by date range.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT * FROM biofeedback"
        params = []
        if start_date and end_date:
            query += " WHERE date BETWEEN %s AND %s"
            params = [start_date, end_date]
        elif start_date:
            query += " WHERE date >= %s"
            params = [start_date]
        elif end_date:
            query += " WHERE date <= %s"
            params = [end_date]
        query += " ORDER BY date DESC"
        cur.execute(query, params)
        entries = cur.fetchall()
        return entries
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        cur.close()
        conn.close()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.delete("/biofeedback")
async def clear_biofeedback_entries():
    """
    Clears all biofeedback entries from the database.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM biofeedback")
        conn.commit()
        return {"message": "All biofeedback entries have been cleared"}
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cur.close()
        conn.close()