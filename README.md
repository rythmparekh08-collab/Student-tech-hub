# Student Tech Hub 🎓⚡

A beginner-friendly, lightweight full-stack web application designed for student tech communities. This project demonstrates how a plain **HTML/CSS/JavaScript** frontend connects to a **Python FastAPI** backend over HTTP APIs with Cross-Origin Resource Sharing (CORS).

---

## 📌 Project Overview

**Student Tech Hub** helps students stay informed about technical workshops, hackathons, and community meetups:
- **Upcoming Events Feed:** Users can click a button to retrieve upcoming tech sessions dynamically from the backend server.
- **Student Registration:** Students can submit their name and email through a registration form to sign up.
- **Zero Framework Complexity:** Built strictly with standard vanilla JavaScript, HTML, and CSS on the client side, and FastAPI on the server side. No complex bundlers, build tools, databases, or container setups.

---

## 📂 Project Structure

```text
student-tech-hub/
├── frontend/
│   ├── index.html        # Clean, accessible HTML5 user interface
│   ├── style.css         # Modern responsive CSS styling (grid & flexbox)
│   └── script.js         # Vanilla JavaScript making fetch() calls to FastAPI
├── backend/
│   ├── main.py           # FastAPI application with CORS and API endpoints
│   └── requirements.txt  # Python package dependencies (fastapi, uvicorn)
└── README.md             # Project documentation and quick-start guide
```

---

## 🚀 Getting Started

Follow these step-by-step instructions to run the application on your computer.

### Prerequisites

- **Python 3.8+** installed on your system.
  - To verify, open your terminal / command prompt and run:
    ```bash
    python --version
    ```
  - If Python is not installed, download it from [python.org](https://www.python.org/downloads/) (make sure to check **"Add Python to PATH"** during installation).

---

### Step 1: Install & Run the Backend

1. **Open a terminal** and navigate to the `backend` folder:
   ```bash
   cd "backend"
   ```

2. *(Recommended)* Create and activate a Python virtual environment:
   - **On Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **On macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install the dependencies:**
   ```bash
   python -m pip install -r requirements.txt
   ```

4. **Start the FastAPI development server:**
   ```bash
   python -m uvicorn main:app --reload
   ```

   You should see terminal output like:
   ```text
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   INFO:     Started reloader process
   ```

> 💡 **Tip:** You can inspect the backend interactive API documentation at any time by opening **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** in your browser!

---

### Step 2: Run the Frontend Locally

Keep the backend running in your first terminal, then open the frontend:

- **Option A (Simplest):**
  Open your file manager, navigate to the `frontend/` folder, and **double-click `index.html`** to open it directly in Google Chrome, Microsoft Edge, Firefox, or Safari.

- **Option B (VS Code Live Server):**
  If using Visual Studio Code, install the **Live Server** extension, right-click `frontend/index.html`, and choose **"Open with Live Server"**.

- **Option C (Python HTTP Server):**
  In a new terminal window, navigate to the `frontend` folder and run:
  ```bash
  cd "frontend"
  python -m http.server 3000
  ```
  Then open **[http://127.0.0.1:3000](http://127.0.0.1:3000)** in your browser.

---

## 🌐 How the Frontend Communicates with the Backend

The frontend and backend run as two separate layers that exchange data using **HTTP requests** and **JSON (JavaScript Object Notation)**:

```text
+-----------------------+                    +------------------------+
|       FRONTEND        |                    |        BACKEND         |
|  (HTML / CSS / JS)    |                    |    (Python / FastAPI)  |
|                       |                    |                        |
|  Click "Load Events"  | --- GET /api/events ----> Returns JSON list |
|  Renders event cards  | <--- [{event1}, ...] --- of sample events   |
|                       |                    |                        |
|  Submit form (Alex)   | --- POST /api/register -> Validates input   |
|  Shows success notice | <--- {"success": true} -- Returns message   |
+-----------------------+                    +------------------------+
```

### 1. Fetching Events (`GET /api/events`)
When you click **"Load Events from Backend"**, the browser executes the `fetchEvents()` function in `frontend/script.js`:
```javascript
const response = await fetch("http://127.0.0.1:8000/api/events");
const data = await response.json();
```
- The backend reads the request at `@app.get("/api/events")` in `backend/main.py`.
- It sends back a JSON response containing an array of event objects (title, date, time, location, description).
- JavaScript receives this data and dynamically creates DOM card elements for each event.

### 2. Registering a Student (`POST /api/register`)
When you submit the registration form, `handleRegistration()` intercepts the submit event:
```javascript
const response = await fetch("http://127.0.0.1:8000/api/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: name, email: email })
});
const result = await response.json();
```
- The backend validates the payload using Pydantic's `RegistrationRequest` model.
- It returns a confirmation JSON response: `{"success": true, "message": "Welcome aboard, Alex!..."}`.
- The frontend parses the response and displays a green success alert.

---

## 🔒 What is CORS and Why Do We Need It?

**CORS** stands for **Cross-Origin Resource Sharing**.

By default, security rules built into all modern web browsers block a webpage running on one origin (e.g. `http://localhost:3000` or `file:///...`) from requesting data from another origin (e.g. `http://127.0.0.1:8000`).

In `backend/main.py`, we enabled FastAPI's CORS middleware:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Permits frontend from any origin to connect
    allow_credentials=True,
    allow_methods=["*"],       # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],       # Allows all standard HTTP headers
)
```
This tells the browser: *"It's safe to let external web pages access these API endpoints."*

---

## 🛠️ API Reference Summary

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API status and root greeting | None |
| `GET` | `/api/events` | Retrieves list of upcoming technical events | None |
| `POST` | `/api/register` | Registers a student | `{"name": "string", "email": "string"}` |
| `GET` | `/docs` | Interactive Swagger UI API documentation | None |

---

## 💡 Troubleshooting

- **Error: "Could not connect to backend"**
  - Verify that your FastAPI server is currently running in your terminal (`python -m uvicorn main:app --reload`).
  - Confirm the terminal says it is listening on `http://127.0.0.1:8000`.
- **Error: "'uvicorn' is not recognized as an internal or external command"**
  - Always use `python -m uvicorn main:app --reload`. On Windows, scripts are often installed outside the default PATH.
- **Port already in use:**
  - If port 8000 is occupied, you can run the backend on a different port:
    ```bash
    python -m uvicorn main:app --reload --port 8001
    ```
    *(Remember to update `API_BASE_URL` in `frontend/script.js` to match the new port).*
