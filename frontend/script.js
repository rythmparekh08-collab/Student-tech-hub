/**
 * Student Tech Hub - Frontend Logic (script.js)
 * -------------------------------------------------------------
 * This file handles all interactive frontend logic:
 * 1. Fetching upcoming events from FastAPI (GET /api/events)
 * 2. Sending registration data to FastAPI (POST /api/register)
 * 3. Dynamically updating the DOM with events and feedback
 * 
 * Written in plain vanilla JavaScript (no frameworks required).
 */

// Base URL where the FastAPI backend is running
const API_BASE_URL = "http://127.0.0.1:8000";

// DOM Elements - Navigation & Status
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

// DOM Elements - Events
const loadEventsBtn = document.getElementById("loadEventsBtn");
const loadBtnText = document.getElementById("loadBtnText");
const eventsContainer = document.getElementById("eventsContainer");
const eventsNotice = document.getElementById("eventsNotice");

// DOM Elements - Registration Form
const registrationForm = document.getElementById("registrationForm");
const studentNameInput = document.getElementById("studentName");
const studentEmailInput = document.getElementById("studentEmail");
const submitRegisterBtn = document.getElementById("submitRegisterBtn");
const submitBtnText = document.getElementById("submitBtnText");
const registrationNotice = document.getElementById("registrationNotice");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");


// -------------------------------------------------------------
// Helper: Show Notice Messages
// -------------------------------------------------------------
function showNotice(element, message, type = "info") {
  element.className = `notice-box ${type}`;
  element.innerHTML = message;
  element.hidden = false;
}

function hideNotice(element) {
  element.hidden = true;
  element.innerHTML = "";
}


// -------------------------------------------------------------
// 1. Fetch Events from Backend (GET /api/events)
// -------------------------------------------------------------
async function fetchEvents() {
  // Update button state while loading
  loadEventsBtn.disabled = true;
  loadBtnText.textContent = "Loading Events...";
  hideNotice(eventsNotice);

  try {
    // Send GET request to FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    // Check if the HTTP response status is OK (200-299)
    if (!response.ok) {
      throw new Error(`Server returned error status: ${response.status}`);
    }

    // Parse the JSON data from the response body
    const data = await response.json();

    // Mark status indicator as online
    updateServerStatus(true);

    if (data.events && Array.isArray(data.events) && data.events.length > 0) {
      renderEvents(data.events);
      showNotice(
        eventsNotice, 
        `✅ Successfully loaded <strong>${data.events.length}</strong> upcoming technical events!`, 
        "success"
      );
    } else {
      eventsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No events found</h3>
          <p>There are currently no events listed in the backend.</p>
        </div>
      `;
    }

  } catch (error) {
    console.error("Error fetching events:", error);
    updateServerStatus(false);

    showNotice(
      eventsNotice,
      `⚠️ <strong>Could not connect to backend:</strong> ${error.message}.<br>` +
      `Make sure your FastAPI server is running. In your terminal, go to the <code>backend</code> folder and run:<br>` +
      `<code>python -m uvicorn main:app --reload</code>`,
      "error"
    );
  } finally {
    // Reset button state
    loadEventsBtn.disabled = false;
    loadBtnText.textContent = "Load Events from Backend";
  }
}


// -------------------------------------------------------------
// Helper: Render Event Cards into the DOM
// -------------------------------------------------------------
function renderEvents(events) {
  // Clear the existing content
  eventsContainer.innerHTML = "";

  // Loop through each event and create an HTML card
  events.forEach(event => {
    const card = document.createElement("article");
    card.className = "event-card";

    card.innerHTML = `
      <div>
        <div class="event-card-header">
          <h3 class="event-title">${escapeHtml(event.title)}</h3>
          <span class="event-badge">${escapeHtml(event.category || "General")}</span>
        </div>
        <div class="event-meta">
          <div class="event-meta-item">
            <span>📅</span>
            <span><strong>Date:</strong> ${escapeHtml(event.date)}</span>
          </div>
          <div class="event-meta-item">
            <span>⏰</span>
            <span><strong>Time:</strong> ${escapeHtml(event.time)}</span>
          </div>
          <div class="event-meta-item">
            <span>📍</span>
            <span><strong>Location:</strong> ${escapeHtml(event.location)}</span>
          </div>
        </div>
        <p class="event-description">${escapeHtml(event.description)}</p>
      </div>
    `;

    eventsContainer.appendChild(card);
  });
}


// -------------------------------------------------------------
// 2. Submit Registration Form (POST /api/register)
// -------------------------------------------------------------
async function handleRegistration(e) {
  e.preventDefault(); // Prevent standard browser page reload

  // Reset errors and notices
  nameError.textContent = "";
  emailError.textContent = "";
  studentNameInput.classList.remove("input-error");
  studentEmailInput.classList.remove("input-error");
  hideNotice(registrationNotice);

  const name = studentNameInput.value.trim();
  const email = studentEmailInput.value.trim();

  // Basic client-side validation
  let hasError = false;

  if (!name) {
    nameError.textContent = "Please enter your full name.";
    studentNameInput.classList.add("input-error");
    hasError = true;
  }

  if (!email) {
    emailError.textContent = "Please enter your student email.";
    studentEmailInput.classList.add("input-error");
    hasError = true;
  } else if (!isValidEmail(email)) {
    emailError.textContent = "Please enter a valid email address.";
    studentEmailInput.classList.add("input-error");
    hasError = true;
  }

  if (hasError) return;

  // Set button to loading state
  submitRegisterBtn.disabled = true;
  submitBtnText.textContent = "Registering...";

  try {
    // Send POST request with JSON body to backend
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email
      })
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || `Server returned error (${response.status})`);
    }

    updateServerStatus(true);

    // Show success message
    showNotice(
      registrationNotice,
      `🎉 <strong>Success!</strong> ${escapeHtml(result.message)}`,
      "success"
    );

    // Reset the form
    registrationForm.reset();

  } catch (error) {
    console.error("Registration failed:", error);
    updateServerStatus(false);

    showNotice(
      registrationNotice,
      `⚠️ <strong>Registration failed:</strong> ${error.message}.<br>` +
      `Ensure the FastAPI backend server is running at <code>${API_BASE_URL}</code>.`,
      "error"
    );
  } finally {
    submitRegisterBtn.disabled = false;
    submitBtnText.textContent = "Register Now";
  }
}


// -------------------------------------------------------------
// Helper: Update Server Connection Status Indicator
// -------------------------------------------------------------
function updateServerStatus(isOnline) {
  if (isOnline) {
    statusDot.className = "status-dot online";
    statusText.textContent = "Backend connected (http://127.0.0.1:8000)";
  } else {
    statusDot.className = "status-dot offline";
    statusText.textContent = "Backend offline or unreachable";
  }
}

// Check backend connectivity on initial page load
async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { method: "GET" });
    if (res.ok) {
      updateServerStatus(true);
    } else {
      updateServerStatus(false);
    }
  } catch (e) {
    updateServerStatus(false);
  }
}


// -------------------------------------------------------------
// Utility Functions
// -------------------------------------------------------------
function isValidEmail(email) {
  // Simple regex check for beginner project
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// -------------------------------------------------------------
// Event Listeners
// -------------------------------------------------------------
loadEventsBtn.addEventListener("click", fetchEvents);
registrationForm.addEventListener("submit", handleRegistration);

// Initial check when page loads
checkBackendHealth();
