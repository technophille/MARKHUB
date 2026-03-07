<p align="center">
  <h1 align="center">🚀 MARKHUB — AI Career OS</h1>
  <p align="center">
    <strong>Your Career. Powered by AI.</strong><br/>
    A 7-stage intelligence engine that discovers, analyzes, and accelerates your career path.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React 19"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [The 7-Stage Pipeline](#-the-7-stage-pipeline)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Documentation](#-documentation)
- [User Flow](#-user-flow)
- [API Endpoints](#-api-endpoints-overview)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 Overview

**MARKHUB** is an AI-powered Career Operating System that guides users through a personalized, multi-stage career discovery and acceleration pipeline. It combines cognitive profiling, resume analysis, skill-gap algorithms, and AI-curated roadmaps to deliver an end-to-end career transformation experience.

Unlike generic career platforms, MARKHUB treats career development as a **pipeline of intelligent stages** — from onboarding and self-discovery to roadmap generation, project recommendations, and job matching.

---

## ✨ Features

- 🎯 **Smart Onboarding** — Career calibration form with resume parsing and soft-skill profiling
- 🧬 **Career DNA Report** — Cognitive archetype detection, Big-5 personality mapping, and skill matrices
- 💼 **AI Career Matching** — 18 curated career roles ranked by fuzzy skill-match percentage
- 📊 **Skill Gap Analysis** — Weighted gap detection with priority-sorted course recommendations
- 🗺️ **Personalized Roadmap** — Multi-phase learning path with time estimates and certifications
- 🎮 **Real-World Simulations** — Forage virtual experience exercises tailored to your career
- 🛠️ **Project Recommendations** — Role-specific portfolio projects with difficulty levels
- 📄 **Resume/CV Parsing** — Automatic skill extraction from uploaded PDFs using NLP
- 🔐 **Auth System** — Signup/login with bcrypt password hashing

---

## 🔬 The 7-Stage Pipeline

| Stage | Name                  | Status   | Description                                              |
|-------|-----------------------|----------|----------------------------------------------------------|
| 1     | **Onboarding**        | ✅ Built | Resume upload, calibration form, skill tagging           |
| 2     | **Self-Discovery**    | ✅ Built | Cognitive profiling, Big-5 personality, DNA report       |
| 3     | **Career Mapping**    | ✅ Built | AI-powered career trajectory recommendation              |
| 4     | **Skill Gap Analysis**| ✅ Built | Fuzzy-match algorithm, priority-weighted gaps            |
| 5     | **Career Roadmap**    | ✅ Built | Multi-phase learning path with course links              |
| 6     | **Portfolio Assembly** | ✅ Built | Auto-generated portfolio with project recommendations   |
| 7     | **AI Mentor**         | ✅ Built | Velocity tracking, burnout detection, certifications     |

> See [docs/PIPELINE.md](docs/PIPELINE.md) for detailed stage-by-stage documentation.

---

## 📁 Project Structure

```
MARKHUB/
├── frontend/                      # Next.js 16 + Tailwind CSS v4 React app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                        # Landing Page
│   │   │   ├── layout.tsx                      # Root Layout
│   │   │   ├── globals.css                     # Tailwind v4 theme
│   │   │   ├── onboarding/
│   │   │   │   ├── step1/page.tsx              # Welcome & Begin
│   │   │   │   ├── step2/page.tsx              # Career Calibration Form
│   │   │   │   └── step3/page.tsx              # AI Generation Loader
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx                  # Dashboard shell
│   │   │       ├── discovery/page.tsx          # DNA Report
│   │   │       ├── careers/page.tsx            # Career Matching
│   │   │       ├── gaps/page.tsx               # Skill Gap Analysis
│   │   │       ├── roadmap/page.tsx            # Career Roadmap
│   │   │       ├── simulation/page.tsx         # Forage Exercises
│   │   │       ├── projects/page.tsx           # Project Builder
│   │   │       ├── portfolio/page.tsx          # Portfolio View
│   │   │       ├── readiness/page.tsx          # Readiness Score
│   │   │       └── jobs/page.tsx               # Job Matching
│   │   └── components/
│   │       └── layout/
│   │           ├── Sidebar.tsx                 # Navigation sidebar
│   │           └── TopHeader.tsx               # Page header
│   └── package.json
│
├── backend/                       # Python FastAPI server
│   ├── main.py                    # All API routes and business logic
│   ├── uploads/                   # Uploaded resumes storage
│   └── examples/                  # Algorithm simulations
│       ├── run_stage4_example.js   # Gap analysis demo (Node.js)
│       ├── run_stage5_example.js   # Roadmap generator demo
│       └── run_stage7_example.py   # AI Mentor demo (Python)
│
├── html-prototypes/               # Original static HTML/Tailwind mockups
│
├── docs/                          # Documentation & specifications
│   ├── SETUP.md                   # Installation & setup guide
│   ├── API.md                     # Full API reference
│   ├── ARCHITECTURE.md            # System architecture
│   ├── PIPELINE.md                # 7-stage pipeline deep dive
│   ├── CONTRIBUTING.md            # Contribution guidelines
│   └── specs/                     # Stage specifications
│       ├── stage_4_skill_gap_analysis_spec.md
│       ├── stage_5_career_roadmap_spec.md
│       ├── stage_6_dashboard_portfolio_spec.md
│       └── stage_7_tracking_feedback_spec.md
│
└── README.md
```

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/technophille/MARKHUB.git
cd MARKHUB

# 2. Start the backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn psycopg2-binary PyPDF2 passlib[bcrypt]
uvicorn main:app --reload --port 8000

# 3. Start the frontend (in a new terminal)
cd frontend
npm install
npm run dev
# → Open http://localhost:3000
```

> 📘 For full setup instructions including database configuration, see **[docs/SETUP.md](docs/SETUP.md)**.

---

## 🛠️ Tech Stack

| Layer         | Technology                                      |
|---------------|--------------------------------------------------|
| **Frontend**  | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Backend**   | Python, FastAPI, Uvicorn                         |
| **Database**  | PostgreSQL 16                                    |
| **Auth**      | bcrypt (passlib)                                 |
| **CV Parser** | PyPDF2 + custom NLP skill extraction             |
| **Prototypes**| Static HTML + Tailwind CDN                       |
| **Algorithms**| Node.js (gap analysis), Python (roadmap, mentor) |

---

## 📖 Documentation

| Document                                        | Description                              |
|--------------------------------------------------|------------------------------------------|
| [**SETUP.md**](docs/SETUP.md)                   | Full installation & environment setup    |
| [**API.md**](docs/API.md)                       | Complete API reference (all endpoints)   |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md)     | System architecture & design decisions   |
| [**PIPELINE.md**](docs/PIPELINE.md)             | Deep dive into the 7-stage AI pipeline   |
| [**CONTRIBUTING.md**](docs/CONTRIBUTING.md)     | How to contribute to MARKHUB             |

---

## 🔄 User Flow

```
Landing Page → Sign Up / Login
    → Onboarding Step 1 (Welcome)
    → Onboarding Step 2 (Career Calibration Form)
    → Onboarding Step 3 (AI Generation Loader)
    → Dashboard
        ├── Discovery (Career DNA Report)
        ├── Careers (AI Career Matching)
        ├── Gaps (Skill Gap Analysis)
        ├── Roadmap (Learning Path)
        ├── Simulation (Forage Exercises)
        ├── Projects (Portfolio Builder)
        ├── Portfolio (Showcase)
        ├── Readiness (Score & Insights)
        └── Jobs (Job Matching)
```

---

## 🔌 API Endpoints Overview

| Method | Endpoint                       | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/`                           | Health check                       |
| POST   | `/api/auth/signup`            | User registration                  |
| POST   | `/api/auth/login`             | User authentication                |
| POST   | `/api/calibration`            | Submit career calibration form     |
| GET    | `/api/profile/{user_id}`      | Get Career DNA report              |
| GET    | `/api/careers/{user_id}`      | Get career recommendations         |
| GET    | `/api/gaps/{user_id}`         | Get skill gap analysis             |
| GET    | `/api/roadmap/{user_id}`      | Get personalized roadmap           |
| GET    | `/api/simulation/{user_id}`   | Get Forage exercise suggestions    |
| GET    | `/api/projects/{user_id}`     | Get project recommendations        |
| GET    | `/api/profiles`               | List recent profiles               |
| GET    | `/api/profiles/{user_id}`     | Get raw profile data               |

> 📘 For full request/response documentation, see **[docs/API.md](docs/API.md)**.

---

## 🤝 Contributing

We welcome contributions! Please see **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** for guidelines.

---

## 📄 License

MIT © [Nikhil K Menon](https://github.com/technophille)