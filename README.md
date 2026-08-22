# Interview AI

## About the Project

Interview AI is a full-stack MERN application that helps job seekers prepare for interviews using AI. A user pastes a target job description and either uploads their resume (PDF/DOCX) or writes a quick self-description, and picks a preparation roadmap length (7/15/30 days). The backend extracts the resume text, sends everything to **Google Gemini**, and returns a structured, personalized interview preparation report — a resume-to-job match score, at least 10 technical and 5 behavioral questions with model answers, identified skill gaps, and a day-by-day preparation roadmap.

From a report, users can practice with a **live AI-driven mock interview** (adaptive questions, per-answer scoring and feedback, an end-of-session summary), and download a tailored, ATS-friendly **resume** and **cover letter** as PDFs, named after the user's own name. A public landing page introduces the product before sign-up; everything else lives behind authentication.

## Features

- Public landing page (Home / About / Services) plus authenticated dashboard at `/dashboard`
- User authentication (register with full name, login, logout) with a JWT stored in a secure, httpOnly cookie
- Server-side token blacklist so logout actually invalidates the token, not just clears the cookie
- Resume upload and text extraction from PDF (`pdf-parse`) and DOCX (`mammoth`)
- AI-generated interview strategy report via Gemini, including:
  - Resume-to-job match score
  - At least 10 technical questions (with interviewer intention + model answer)
  - At least 5 behavioral questions (with interviewer intention + model answer)
  - Skill gap analysis with severity
  - User-selectable day-by-day preparation roadmap (7, 15, or 30 days)
- **Live mock interview practice** — the AI asks adaptive questions one at a time based on the conversation so far, scores and critiques each answer, and produces an overall performance summary at the end of the session
- AI-tailored **resume** and **cover letter** generation, each rendered to a downloadable PDF via Puppeteer and named after the user (e.g. `janedoe_cv.pdf`)
- Report history — every generated report is saved per user and viewable later
- Structured, schema-constrained AI output (Zod → JSON Schema passed as Gemini's `responseSchema`) instead of unreliable freeform JSON parsing
- Resilient AI calls — automatic retry and fallback across multiple Gemini models if one is rate-limited, with a clean "service temporarily unavailable" response instead of a crash if every model is exhausted
- Rate limiting on auth endpoints (brute-force protection) and on every AI-generating endpoint (cost protection)
- Deploy-ready: environment-driven CORS/API URLs, secure cross-site cookies in production, a `/health` endpoint, fail-fast startup checks, and graceful shutdown

## Tech Stack

**Frontend:** React 19, React Router 7, Vite, SCSS, Axios

**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT (jsonwebtoken), bcryptjs, Multer, express-rate-limit

**AI:** Google Gemini (`@google/genai`) with Zod-defined structured output schemas and multi-model fallback

**File Processing:** `pdf-parse`, `mammoth` (resume text extraction), Puppeteer (HTML → PDF)

## Project Structure

```
Interview - AI/
├── Backend/
│   ├── server.js                                # App entry point, env validation, DB connect, graceful shutdown
│   ├── src/
│   │   ├── app.js                                # Express app, CORS, /health, route mounting
│   │   ├── config/
│   │   │   └── db.js                             # MongoDB connection + resilience listeners
│   │   ├── controllers/
│   │   │   ├── auth.controller.js                # register, login, logout, get-me
│   │   │   ├── interview.controller.js           # generate/get reports, resume PDF, cover letter PDF
│   │   │   └── mockInterview.controller.js        # start/answer/end mock interview sessions
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js                # JWT verification + blacklist check
│   │   │   ├── file.middleware.js                # Multer resume upload config
│   │   │   └── rateLimit.middleware.js           # Auth + AI-endpoint rate limiters
│   │   ├── models/
│   │   │   ├── user.model.js                     # fullName, username, email, password
│   │   │   ├── blacklist.model.js                # Invalidated JWTs after logout
│   │   │   ├── interviewReport.model.js
│   │   │   └── mockInterviewSession.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── interview.routes.js
│   │   │   └── mockInterview.routes.js
│   │   └── services/
│   │       └── ai.service.js                     # Gemini integration, model fallback/retry, schema conversion, PDF generation
│   ├── .env.example
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── main.jsx / App.jsx / app.routes.jsx
    │   ├── lib/api.js                            # Shared axios client (VITE_API_URL)
    │   ├── style.scss / style/button.scss / style/_colors.scss
    │   └── features/
    │       ├── landing/
    │       │   ├── pages/Landing.jsx
    │       │   └── style/landing.scss
    │       ├── auth/
    │       │   ├── auth.context.jsx
    │       │   ├── auth.form.scss
    │       │   ├── components/Protected.jsx
    │       │   ├── hooks/useAuth.js
    │       │   ├── pages/Login.jsx
    │       │   ├── pages/Register.jsx
    │       │   └── services/auth.api.js
    │       ├── interview/
    │       │   ├── interview.context.jsx
    │       │   ├── hooks/useInterview.js
    │       │   ├── pages/Home.jsx
    │       │   ├── pages/Interview.jsx
    │       │   ├── services/interview.api.js
    │       │   └── style/home.scss, interview.scss
    │       └── mockInterview/
    │           ├── mockInterview.context.jsx
    │           ├── hooks/useMockInterview.js
    │           ├── pages/MockInterview.jsx
    │           ├── services/mockInterview.api.js
    │           └── style/mockInterview.scss
    ├── .env.example
    └── package.json
```

## How to Setup the Project

### Prerequisites
- Node.js installed
- A MongoDB database (local instance or MongoDB Atlas)
- A Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd "Interview - AI"
```

### 2. Backend setup
```bash
cd Backend
npm install
```
Create a `.env` file in `Backend/` (copy `.env.example` and fill in real values — see Environment Variables below).

Start the backend:
```bash
npm run dev
```
Runs on `http://localhost:3000` (or `PORT` if set). Startup fails fast with a clear error if `MONGO_URI`, `JWT_SECRET`, or `GOOGLE_GENAI_API_KEY` is missing. Visit `http://localhost:3000/health` to confirm it's up.

For a production run: `npm start` (plain `node server.js`, no file-watcher).

### 3. Frontend setup
```bash
cd Frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

Optionally create a `.env` in `Frontend/` (copy `.env.example`) to point at a non-default backend URL — see Environment Variables below. If omitted, it defaults to `http://localhost:3000`.

## Environment Variables

### Backend — set in `Backend/.env` (see `Backend/.env.example`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWTs |
| `GOOGLE_GENAI_API_KEY` | Yes | API key for Google Gemini |
| `GOOGLE_GENAI_MODEL` | No | Override the primary Gemini model (defaults to `gemini-3-flash-preview`, with automatic fallback to other models if rate-limited) |
| `PORT` | No | Port to listen on (defaults to `3000`) |
| `FRONTEND_URL` | No | Comma-separated list of allowed CORS origins (defaults to `http://localhost:5173`) |
| `NODE_ENV` | No | Set to `production` in production — enables secure, cross-site cookies (`Secure; SameSite=None`) |
| `RUN_AI_HEALTH_CHECK` | No | Set to `true` to force the Gemini connectivity check on every boot (skipped by default outside production to conserve API quota during dev) |

### Frontend — set in `Frontend/.env` (see `Frontend/.env.example`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Base URL of the backend API (defaults to `http://localhost:3000`) |

## API Endpoints

Base URL: `http://localhost:3000` (or your deployed backend URL)

`GET /health` — Public liveness check, returns `{ "status": "ok" }`.

### Auth — `/api/auth` (rate-limited: 10 requests / 15 min per IP on register & login)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user — body: `fullName`, `username`, `email`, `password` |
| POST | `/api/auth/login` | Public | Login — body: `email`, `password`. Sets a secure, httpOnly JWT cookie |
| GET | `/api/auth/logout` | Private | Blacklists the current token and clears the cookie |
| GET | `/api/auth/get-me` | Private | Returns the currently authenticated user |

### Interview — `/api/interview` (AI-generating routes rate-limited: 20 requests / hour per IP)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/interview/` | Private | Generates a new interview report — multipart form: `jobDescription`, `selfDescription`, `resume` (PDF/DOCX, max 5MB), `roadmapDays` (`7`, `15`, or `30`) |
| GET | `/api/interview/` | Private | Lists all interview reports for the logged-in user (summary fields only) |
| GET | `/api/interview/report/:interviewId` | Private | Fetches a single full interview report by ID |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Private | Generates and streams back an AI-tailored resume PDF for that report |
| POST | `/api/interview/cover-letter/pdf/:interviewReportId` | Private | Generates and streams back an AI-tailored cover letter PDF for that report |

### Mock Interview — `/api/mock-interview` (AI-generating routes rate-limited: 20 requests / hour per IP)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/mock-interview/start` | Private | Starts a new session from an existing report — body: `interviewReportId`. Returns the first AI-generated question |
| POST | `/api/mock-interview/:sessionId/answer` | Private | Submits an answer to the current question — body: `answer`. Returns its score/feedback plus the next question (capped at 6 questions per session) |
| POST | `/api/mock-interview/:sessionId/end` | Private | Ends the session and generates an overall performance summary |
| GET | `/api/mock-interview/:sessionId` | Private | Fetches a single mock interview session by ID |
| GET | `/api/mock-interview/` | Private | Lists all mock interview sessions for the logged-in user (summary fields only) |

*Private routes require a valid JWT cookie (set automatically after login/register).*
