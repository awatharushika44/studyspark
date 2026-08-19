StudySpark

An AI-powered study platform that builds a real, reasoned study schedule around your exam dates — not just a to-do list.

🔗 Live app: studyspark-jade.vercel.app — try the demo account, no signup needed

What it is

Most study apps are glorified to-do lists. StudySpark actually reasons about your situation — it takes your subjects, exam dates, and self-rated difficulty per subject, and generates a real day-by-day schedule that prioritizes what's urgent and hard, not just what's next on a list.

Built and deployed solo, end-to-end — architecture, auth, AI integration, and production deployment across three separate services.

✨ Features
AI Study Planner — generates a personalized schedule via the Google Gemini API, weighing exam urgency and subject difficulty. Falls back to a deterministic rule-based algorithm if the AI call fails or is rate-limited, with automatic retry on transient errors — the planner never just breaks.
AI Study Assistant — a chatbot for study techniques, focus tips, and exam stress, with real multi-turn conversation memory (it remembers earlier messages in the same chat).
Focus Mode — Pomodoro-style timed sessions that write real records to the database and award XP.
Analytics Dashboard — weekly study-hours chart and a 12-week activity heatmap, computed server-side from actual session data. Nothing here is hardcoded.
Smart Calendar — automatically syncs exam dates from the AI Planner and daily tasks from the Dashboard.
Gamification — XP, levels, streaks, and achievements checked against real usage data (not decorative).
JWT authentication with per-user data isolation enforced at the database query level.
Live demo account — seeded with 60 days of realistic study history, so anyone can explore the full app without registering.

🛠️ Local development
bash
# Clone
git clone https://github.com/awatharushika44/studyspark.git
cd studyspark

# Backend
cd server
npm install
# create a .env file — see below
npm run dev

# Frontend (in a new terminal)
cd client
npm install
npm run dev

server/.env

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key

client/.env
VITE_API_URL=http://localhost:5000

📁 Project structure
studyspark/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── pages/        # Dashboard, Planner, Focus, Chat, Calendar, Goals, Analytics
│   │   ├── hooks/        # useSubjects (MongoDB-backed)
│   │   ├── services/     # api.js — Axios instance + endpoint definitions
│   │   └── context/      # AuthContext
│   └── vercel.json       # SPA routing rewrite rule
├── server/               # Node/Express backend
│   ├── routes/           # auth, planner, chat, focus, analytics
│   ├── models/           # User, StudySession (Mongoose)
│   ├── middleware/       # JWT auth middleware
│   ├── seed.js           # Demo account + realistic session data generator
│   └── Dockerfile        # Railway deployment
└── README.md

📬 About

Built by Awa Tharushika
