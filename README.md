# Gunaso — Mental Health Support Platform
Now live at : https://gunaso-app.netlify.app/

> *Connecting those who seek support with those who can provide it*

**Team 17 — Mental Wizard** | Hackathon Project

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

---

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Documentation](#api-documentation)
- [Team](#team)

---

## About the Project

**Gunaso** is an anonymous, AI-powered mental health support platform built to bridge the gap between people who need help and those who can provide it — instantly and privately.

Mental health support today is inaccessible, stigmatized, and slow:

| Statistic | Reality |
|-----------|---------|
| **1 in 5** adults experience mental health issues annually | Most never receive help |
| **75%** of those affected never seek professional support | Stigma and inaccessibility are barriers |
| **34 days** average wait time for a therapist | Immediate support is unavailable |

Gunaso solves this by combining validated clinical intake tools (PHQ-9, GAD-7, PSS-10), an AI-powered matching engine (LLM + RAG), and real-time encrypted 1-on-1 sessions with peer supporters or licensed therapists — all with full anonymity.

---

## Key Features

- **Anonymous Onboarding** — No PII required. Users are identified only by a session token.
- **Validated Mental Health Intake** — PHQ-9, GAD-7, and PSS-10 clinical instruments for structured assessment.
- **AI Chat Assistant** — Powered by Google Gemini 2.5 Flash with mental health safety protocols and crisis detection.
- **Smart Matching Engine** — LLM + RAG determines condition and routes to the right helper by domain expertise in under 60 seconds.
- **Real-time Encrypted Sessions** — End-to-end encrypted WebSocket chat. The server cannot read message content.
- **Helper Portal** — Peer supporters and licensed therapists can register, set availability, and accept session requests.

---

## Architecture

```
General User (Help Seeker)          Help Provider (Peer / Therapist)
         │                                        │
         ▼                                        ▼
  Mental Health                          Experience
  Questionnaire                         Questionnaire
  (PHQ-9, GAD-7, PSS-10)               (Past situations, domains)
         │                                        │
         ▼                                        ▼
  User Context Profile                   Helper Profile
  (Condition + domain)                  (Expertise domains)
         │                                        │
    ┌────┴────┐                                   │
    │         │                                   │
    ▼         ▼                                   │
AI Chatbot  "Get Help"                            │
(explore)   Button → LLM analyzes context        │
    │              → Detects condition            │
    │              → Suggests matched helper ◄────┘
    │                        │
    └───────────┬────────────┘
                ▼
        Match Confirmed
        (1 user : 1 helper)
                │
                ▼
      WebSocket Connection
      (Real-time, persistent)
                │
                ▼
    End-to-End Encrypted Chat
    (Anonymous · No server logs)
```

---

## Tech Stack

### Backend

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI |
| Server | Uvicorn (ASGI) |
| Database | PostgreSQL via Supabase |
| ORM | SQLAlchemy |
| Authentication | JWT (python-jose, bcrypt) |
| AI / LLM | Google Generative AI (Gemini 2.5 Flash) |
| Validation | Pydantic |
| Real-time | WebSockets |
| Environment | python-dotenv |

### Frontend

| Component | Technology |
|-----------|-----------|
| Framework | React 18 |
| Build Tool | Vite 4 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| State | React Context API |
| Styling | CSS Modules + CSS Custom Properties |
| Font | Manrope (Google Fonts) |

---

## Project Structure

```
gunaso/
├── backend/
│   ├── start.py                  # Entry point — launches Uvicorn server
│   ├── requirements.txt          # Python dependencies
│   ├── flush_db.py               # Database utility (reset/seed)
│   ├── general_helplines.txt     # Crisis helpline data for RAG
│   └── app/
│       ├── main.py               # FastAPI app, CORS, router registration
│       ├── utils.py              # Shared utility functions
│       ├── core/
│       │   ├── config.py         # App settings (env vars)
│       │   ├── llm.py            # Gemini LLM configuration & safety settings
│       │   └── security.py       # JWT creation/verification, password hashing
│       ├── db/
│       │   ├── base.py           # SQLAlchemy declarative base
│       │   └── session.py        # Database engine & session factory
│       ├── models/
│       │   └── models.py         # ORM models (User, Helper, ChatSession, HelpSession, …)
│       ├── schemas/
│       │   └── schemas.py        # Pydantic request/response schemas
│       ├── api/
│       │   ├── deps.py           # Dependency injection (get_db, get_current_user)
│       │   └── routes/
│       │       ├── auth.py           # Register, login, refresh token
│       │       ├── chat.py           # AI chat endpoints
│       │       ├── crud.py           # CRUD helpers
│       │       ├── help_request.py   # Help request & matching
│       │       └── web_socket_chat.py # WebSocket real-time chat
│       └── services/
│           ├── analyze.py            # Content & severity analysis
│           ├── chat_service.py       # Chat processing pipeline
│           ├── matching.py           # Helper–seeker matching algorithm
│           └── websocket_manager.py  # WebSocket connection manager
│
└── frontend/
    ├── package.json              # npm scripts & dependencies
    ├── vite.config.js            # Vite configuration
    ├── index.html                # HTML entry point
    └── src/
        ├── main.jsx              # React entry point
        ├── App.jsx               # Root component (providers + router)
        ├── router/
        │   └── index.jsx         # Routes + guards (SeekerGuard, HelperGuard)
        ├── context/
        │   ├── AuthContext.jsx       # Auth state (user, login, logout)
        │   └── OnboardingContext.jsx # Onboarding flow state
        ├── components/
        │   ├── layout/           # AppLayout, Sidebar, Navbar, TopBar
        │   ├── ui/               # Button, Card, TagChip, AnonId, Breadcrumb
        │   └── onboarding/       # ProgressBar, QuestionCard
        ├── pages/
        │   ├── LandingPage/
        │   ├── AuthPage/             # Seeker signup / login
        │   ├── OnboardingPage/       # Multi-step questionnaire
        │   ├── OnboardingResultsPage/
        │   ├── SeekerDashboard/
        │   ├── AIChatPage/
        │   ├── ProfessionalSupportPage/
        │   ├── SessionPage/
        │   └── helper/               # Helper auth, dashboard, history
        └── api/
            ├── apiClient.js          # Axios instance with interceptors
            ├── auth.js
            ├── chat.js
            ├── endpoints.js          # API endpoint constants
            └── index.js
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Comes with Node.js |
| Git | Any | [git-scm.com](https://git-scm.com/) |

You will also need:
- A **Google Gemini API key** — [Get one here](https://aistudio.google.com/app/apikey)
- A **PostgreSQL database** — [Supabase free tier](https://supabase.com/) is recommended

---

### Backend Setup

**1. Clone the repository**

```bash
git clone https://github.com/your-org/gunaso.git
cd gunaso
```

**2. Navigate to the backend directory**

```bash
cd backend
```

**3. Create a Python virtual environment**

```bash
python -m venv venv
```

**4. Activate the virtual environment**

```bash
# macOS / Linux
source venv/bin/activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.\venv\Scripts\activate.bat
```

**5. Install dependencies**

```bash
pip install -r requirements.txt
```

**6. Configure environment variables**

Create a `.env` file inside the `backend/` directory:

```bash
cp .env.example .env   # if an example file exists, otherwise create manually
```

Fill in the values — see [Environment Variables](#environment-variables) below.

**7. Start the backend server**

```bash
python start.py
```

The API will be available at **http://localhost:8000**

---

### Frontend Setup

**1. Navigate to the frontend directory** (from the project root)

```bash
cd frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the development server**

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# ─── Database ───────────────────────────────────────────────
# PostgreSQL connection string (Supabase or any PostgreSQL instance)
DATABASE_URL=postgresql://user:password@host:port/dbname

# ─── Authentication ─────────────────────────────────────────
# A long, random secret string for signing JWT tokens
SECRET_KEY=your_super_secret_key_here

# JWT signing algorithm
HASHING_ALGORITHM=HS256

# ─── AI / LLM ───────────────────────────────────────────────
# Google Gemini API key from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) Tavily API key for web search augmentation
TAVILY_API_KEY=your_tavily_api_key_here

# ─── Server ─────────────────────────────────────────────────
# Port the backend will listen on (default: 8000)
PORT=8000

# Set to PROD to disable hot-reload in production
DEPLOYMENT=DEV
```

> **Security Note:** Never commit `.env` to version control. The `.gitignore` already excludes it. Rotate your API keys and secrets if they are ever accidentally exposed.

---

## Running the App

Once both servers are running, open your browser:

| Service | URL |
|---------|-----|
| Frontend (React app) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI (API docs) | http://localhost:8000/docs |
| ReDoc (API docs) | http://localhost:8000/redoc |

### User Flows

**As a Help Seeker:**
1. Visit the landing page and sign up anonymously
2. Complete the mental health questionnaire (PHQ-9, GAD-7, PSS-10)
3. Chat with the AI assistant or click **"Get Help"** to be matched with a helper
4. Once matched, join the end-to-end encrypted 1-on-1 session

**As a Helper / Therapist:**
1. Register with your credentials and domain expertise
2. Complete the experience questionnaire
3. Set your availability (online/offline toggle)
4. Accept incoming help requests matched to your domain
5. Conduct the private WebSocket session

---

## API Documentation

The backend exposes a fully documented REST + WebSocket API.

| Route Group | Base Path | Description |
|-------------|-----------|-------------|
| Auth | `/api/auth` | Register, login, token refresh |
| AI Chat | `/api/chat` | AI chat sessions and history |
| Help Requests | `/api/help` | Create and manage help requests |
| WebSocket Chat | `/ws/chat` | Real-time encrypted chat |

Full interactive documentation is auto-generated by FastAPI:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Team

**Team 17 — Mental Wizard**

| Name | Role |
|------|------|
| Aashish Shrestha | Team Member |
| Aayusha Shrestha | Team Member |
| Bidhan Acharya | Team Member |
| Jivan Acharya | Team Member |

---

*Built with care at a hackathon to make mental health support more accessible, anonymous, and immediate.*
