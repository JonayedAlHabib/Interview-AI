# Interview AI

## About the Project

Interview AI is a full-stack MERN application that helps job seekers prepare for interviews using AI. A user pastes a target job description and either uploads their resume (PDF/DOCX) or writes a quick self-description. The backend extracts the resume text, sends everything to **Google Gemini**, and returns a structured, personalized interview preparation report — a resume-to-job match score, likely technical and behavioral questions with model answers, identified skill gaps, and a day-by-day preparation roadmap. Users can also generate a tailored, ATS-friendly resume as a downloadable PDF for the specific job they're targeting.

## Features

- User authentication (register, login, logout) with JWT stored in an httpOnly cookie
- Server-side token blacklist so logout actually invalidates the token, not just clears the cookie
- Resume upload and text extraction from PDF (`pdf-parse`) and DOCX (`mammoth`)
- AI-generated interview strategy report via Gemini, including:
  - Resume-to-job match score
  - Technical questions (with interviewer intention + model answer)
  - Behavioral questions (with interviewer intention + model answer)
  - Skill gap analysis with severity
  - Day-by-day interview preparation roadmap
- AI-tailored resume generation, rendered to a downloadable PDF via Puppeteer
- Report history — every generated report is saved per user and viewable later
- Structured, schema-constrained AI output (Zod → JSON Schema passed as Gemini's `responseSchema`) instead of unreliable freeform JSON parsing

## Tech Stack

**Frontend:** React 19, React Router 7, Vite, SCSS, Axios

**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT (jsonwebtoken), bcryptjs, Multer

**AI:** Google Gemini (`@google/genai`) with Zod-defined structured output schemas

**File Processing:** `pdf-parse`, `mammoth` (resume text extraction), Puppeteer (HTML → PDF)

## Project Structure

```
Interview - AI/
├── Backend/
│   ├── server.js                          # App entry point, DB connect, AI health check
│   ├── src/
│   │   ├── app.js                         # Express app, middleware, route mounting
│   │   ├── config/
│   │   │   └── db.js                      # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js         # register, login, logout, get-me
│   │   │   └── interview.controller.js    # generate/get reports, generate resume PDF
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js         # JWT verification + blacklist check
│   │   │   └── file.middleware.js         # Multer resume upload config
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── blacklist.model.js         # Invalidated JWTs after logout
│   │   │   └── interviewReport.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── interview.routes.js
│   │   └── services/
│   │       └── ai.service.js              # Gemini integration, schema conversion, PDF generation
│   ├── .env.example
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── main.jsx / App.jsx / app.routes.jsx
    │   ├── style.scss / style/button.scss
    │   └── features/
    │       ├── auth/
    │       │   ├── auth.context.jsx
    │       │   ├── auth.form.scss
    │       │   ├── components/Protected.jsx
    │       │   ├── hooks/useAuth.js
    │       │   ├── pages/Login.jsx
    │       │   ├── pages/Register.jsx
    │       │   └── services/auth.api.js
    │       └── interview/
    │           ├── interview.context.jsx
    │           ├── hooks/useInterview.js
    │           ├── pages/Home.jsx
    │           ├── pages/Interview.jsx
    │           ├── services/interview.api.js
    │           └── style/home.scss, interview.scss
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
Runs on `http://localhost:3000`. On startup, it logs whether MongoDB and the Gemini AI connection succeeded.

### 3. Frontend setup
```bash
cd Frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

The frontend doesn't require any environment variables — the API base URL is configured directly in the frontend's API service files.

## Environment Variables

Set these in `Backend/.env` (see `Backend/.env.example` for a template):

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign and verify JWTs |
| `GOOGLE_GENAI_API_KEY` | API key for Google Gemini (used for report and resume generation) |

## API Endpoints

Base URL: `http://localhost:3000`

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user — body: `username`, `email`, `password` |
| POST | `/api/auth/login` | Public | Login — body: `email`, `password`. Sets an httpOnly JWT cookie |
| GET | `/api/auth/logout` | Private | Blacklists the current token and clears the cookie |
| GET | `/api/auth/get-me` | Private | Returns the currently authenticated user |

### Interview — `/api/interview`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/interview/` | Private | Generates a new interview report — multipart form: `jobDescription`, `selfDescription`, `resume` (PDF/DOCX file, max 5MB) |
| GET | `/api/interview/` | Private | Lists all interview reports for the logged-in user (summary fields only) |
| GET | `/api/interview/report/:interviewId` | Private | Fetches a single full interview report by ID |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Private | Generates and streams back an AI-tailored resume PDF for that report |

*Private routes require a valid JWT cookie (set automatically after login/register).*
