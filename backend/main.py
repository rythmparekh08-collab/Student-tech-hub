from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize the FastAPI application
app = FastAPI(
    title="Student Tech Hub API",
    description="A beginner-friendly API providing technical events and student registration.",
    version="1.0.0"
)

# -------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing) Configuration
# -------------------------------------------------------------
# By default, web browsers block web pages from requesting data
# from a different origin (domain, protocol, or port).
# For example, if your frontend runs on http://localhost:5500
# and your backend runs on http://127.0.0.1:8000, that is "cross-origin".
# Adding CORSMiddleware allows your frontend to fetch data from this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow all origins for simple local development
    allow_credentials=True,
    allow_methods=["*"],        # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],        # Allow all headers
)

# -------------------------------------------------------------
# Sample Events Data (In-Memory)
# -------------------------------------------------------------
# In a full-scale app, this might come from a database.
# For simplicity, we store the sample events in a Python list.
SAMPLE_EVENTS = [
    {
        "id": 1,
        "title": "Intro to Web Development",
        "date": "October 15, 2026",
        "time": "5:00 PM - 6:30 PM",
        "location": "Auditorium A & Online",
        "category": "Web Dev",
        "description": "Learn the fundamentals of HTML, CSS, and modern JavaScript to build interactive websites."
    },
    {
        "id": 2,
        "title": "Python for Beginners Workshop",
        "date": "October 22, 2026",
        "time": "4:00 PM - 5:30 PM",
        "location": "Computer Lab 3",
        "category": "Python",
        "description": "Hands-on coding session covering variables, loops, functions, and building your first scripts."
    },
    {
        "id": 3,
        "title": "AI & Machine Learning Crash Course",
        "date": "November 5, 2026",
        "time": "6:00 PM - 7:30 PM",
        "location": "Virtual (Google Meet)",
        "category": "AI / ML",
        "description": "An intuitive look into machine learning, neural networks, and how modern AI models work."
    },
    {
        "id": 4,
        "title": "Annual Campus Hackathon 2026",
        "date": "November 20-21, 2026",
        "time": "24 Hours (Starts 10:00 AM)",
        "location": "Innovation Hub Hall",
        "category": "Hackathon",
        "description": "Collaborate with fellow students, build innovative tech projects, and win exciting prizes!"
    }
]

# Simple in-memory list to track registrations while the server is running
registrations = []


# -------------------------------------------------------------
# Pydantic Model for Request Body Validation
# -------------------------------------------------------------
# Pydantic ensures incoming JSON data matches the expected structure.
class RegistrationRequest(BaseModel):
    name: str
    email: str


# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------
@app.get("/")
def read_root():
    """Welcome endpoint with basic API information."""
    return {
        "message": "Welcome to the Student Tech Hub API!",
        "status": "online",
        "endpoints": {
            "GET /api/events": "Retrieve the list of upcoming technical events",
            "POST /api/register": "Register a student using name and email"
        }
    }


@app.get("/api/events")
def get_events():
    """
    GET endpoint that returns sample event data as JSON.
    Called by the frontend when clicking 'Load Events'.
    """
    return {
        "success": True,
        "count": len(SAMPLE_EVENTS),
        "events": SAMPLE_EVENTS
    }


@app.post("/api/register")
def register_student(payload: RegistrationRequest):
    """
    POST endpoint that accepts a student's name and email in JSON format.
    Validates the input and returns a confirmation response.
    """
    name = payload.name.strip()
    email = payload.email.strip()

    # Simple validation
    if not name or not email:
        return {
            "success": False,
            "message": "Name and email are required."
        }

    # Store registration in memory
    record = {
        "name": name,
        "email": email
    }
    registrations.append(record)

    return {
        "success": True,
        "message": f"Welcome aboard, {name}! You have successfully registered with {email}.",
        "student": record
    }
