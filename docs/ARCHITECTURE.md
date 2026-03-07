# 🏗️ Architecture

System architecture overview for MARKHUB — AI Career OS.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                      │
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │          Next.js 16 + React 19 Frontend          │   │
│   │        (Tailwind CSS v4 + TypeScript)             │   │
│   │                                                    │   │
│   │   Landing ─► Onboarding ─► Dashboard Pages        │   │
│   └───────────────────┬──────────────────────────────┘   │
│                       │ HTTP (fetch)                      │
└───────────────────────┼──────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                    FastAPI Backend                         │
│                  (Python + Uvicorn)                        │
│                                                           │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────────┐     │
│   │ Auth Layer  │  │ Calibration │  │  AI Engines   │     │
│   │ signup/login│  │ form + CV   │  │ gap/roadmap/  │     │
│   │ bcrypt hash │  │ NLP parsing │  │ career match  │     │
│   └──────┬──────┘  └──────┬──────┘  └──────┬───────┘     │
│          │                │                │              │
│          └────────────────┼────────────────┘              │
│                           │                               │
│                           ▼                               │
│               ┌───────────────────────┐                   │
│               │   PostgreSQL Database  │                   │
│               │   • users              │                   │
│               │   • user_profiles      │                   │
│               └───────────────────────┘                   │
└───────────────────────────────────────────────────────────┘
```

---

## Technology Decisions

### Frontend: Next.js 16 + React 19

- **Why Next.js?** — File-based routing, server-side rendering capability, and the App Router for clean layout composition.
- **Why Tailwind CSS v4?** — Utility-first styling with zero configuration and excellent theming support.
- **Layout Strategy** — Uses Next.js Route Groups `(dashboard)` for shared sidebar layout without affecting URL structure.

### Backend: FastAPI (Python)

- **Why FastAPI?** — Auto-generated OpenAPI docs, async support, and Python's rich NLP/ML ecosystem.
- **Single-file design** — All routes in `main.py` for simplicity during active development. Production refactoring into routers is planned.
- **No ORM** — Direct `psycopg2` for maximum control and performance with PostgreSQL.

### Database: PostgreSQL

- **Why PostgreSQL?** — Native support for array columns (`TEXT[]`) used extensively for skills, roles, and extracted data.
- **Schema** — Two tables: `users` (auth) and `user_profiles` (career data, skills, soft ratings, CV text).

### CV Parsing: Custom NLP Pipeline

The skill extraction pipeline uses:
1. **PDF text extraction** via PyPDF2
2. **Direct matching** against a 60+ skill master list
3. **Keyword inference** — maps CV phrases (e.g., "web development") to concrete skills (HTML, CSS, JavaScript)
4. **Normalized output** — consistent casing and formatting

---

## Frontend Architecture

```
src/app/
├── page.tsx                    # Landing page (public)
├── layout.tsx                  # Root layout (fonts, meta)
├── globals.css                 # Tailwind theme
├── onboarding/                 # Pre-dashboard flow
│   ├── step1/page.tsx          # Welcome screen
│   ├── step2/page.tsx          # 8-section calibration form
│   └── step3/page.tsx          # AI generation loader
└── (dashboard)/                # Route group — shared layout
    ├── layout.tsx              # Sidebar + TopHeader shell
    ├── discovery/page.tsx      # Stage 2/3 — DNA Report
    ├── careers/page.tsx        # Career matching
    ├── gaps/page.tsx           # Skill gap analysis
    ├── roadmap/page.tsx        # Learning roadmap
    ├── simulation/page.tsx     # Forage exercises
    ├── projects/page.tsx       # Project builder
    ├── portfolio/page.tsx      # Portfolio view
    ├── readiness/page.tsx      # Readiness score
    └── jobs/page.tsx           # Job matching
```

### Key Patterns

- **Client Components** — All dashboard pages use `"use client"` for interactive state management.
- **localStorage** — User ID and selected career role persist across pages via `localStorage`.
- **Fetch on mount** — Pages call backend APIs in `useEffect` on component mount.
- **Shared Layout** — The `(dashboard)/layout.tsx` wraps all dashboard pages with sidebar navigation and top header.

---

## Backend Architecture

```
backend/
├── main.py                     # FastAPI application (all routes)
├── uploads/                    # Resume file storage
└── examples/                   # Standalone algorithm demos
    ├── run_stage4_example.js   # Gap analysis (Node.js)
    ├── run_stage5_example.js   # Roadmap generation
    └── run_stage7_example.py   # AI Mentor simulation
```

### Core Components in `main.py`

| Component             | Lines     | Description                                     |
|-----------------------|-----------|--------------------------------------------------|
| **Skills NLP Engine** | 46–141    | Master skill list, keyword inference, extraction |
| **Auth Endpoints**    | 146–195   | Signup, login with bcrypt hashing                |
| **Role Catalog**      | 202–221   | 18 career roles with skills, salary, metadata    |
| **Career Engine**     | 235–292   | Fuzzy-match career recommendations               |
| **Skill Meta**        | 294–328   | Hours and weights for 60+ skills                 |
| **Gap Analysis**      | 330–425   | Weighted gap detection with course mapping       |
| **Course Database**   | 428–646   | Curated courses for 40+ skills                   |
| **Forage Exercises**  | 648–698   | Role-specific virtual experience simulations     |
| **Project Database**  | 700–757   | Role-specific recommended projects               |
| **Roadmap Engine**    | 880–975   | Multi-phase learning path generator              |
| **DNA Report**        | 977–1095  | Cognitive archetype + Big-5 + readiness score    |
| **Calibration**       | 1097–1195 | Form processing + PDF parsing + DB insert        |

---

## Data Flow

```
User fills Calibration Form (Step 2)
        │
        ├─► Resume uploaded & saved → PDF text extracted via PyPDF2
        │                            → Skills extracted via NLP engine
        │
        ├─► Form data (roles, skills, soft ratings) parsed
        │
        └─► All data → INSERT into user_profiles table
                │
                └─► user_id returned to frontend → stored in localStorage
                        │
                        ├─► /api/profile/{id}     → DNA Report page
                        ├─► /api/careers/{id}     → Career Matching page
                        ├─► /api/gaps/{id}        → Skill Gap Analysis page
                        ├─► /api/roadmap/{id}     → Roadmap page
                        ├─► /api/simulation/{id}  → Exercises page
                        └─► /api/projects/{id}    → Projects page
```

---

## Supported Career Roles (18)

The `ROLE_CATALOG` in the backend defines 18 career paths:

| Role                       | Core Skills                         | Salary Range |
|----------------------------|-------------------------------------|--------------|
| Full Stack Engineer        | React, Node.js, TypeScript, Python  | 12–25 LPA    |
| Frontend Developer         | React, TypeScript, HTML, CSS        | 8–20 LPA     |
| Backend Developer          | Python, Java, SQL, Docker           | 10–22 LPA    |
| Data Scientist             | Python, ML, Pandas, TensorFlow      | 12–28 LPA    |
| ML Engineer                | Python, TensorFlow, PyTorch         | 14–30 LPA    |
| AI Engineer                | Python, ML, NLP, Computer Vision    | 15–35 LPA    |
| DevOps Engineer            | Docker, Kubernetes, Terraform       | 12–25 LPA    |
| Blockchain Developer       | Solidity, Hardhat, Web3, React      | 15–30 LPA    |
| Cloud Architect            | AWS, Azure, GCP, Terraform          | 18–35 LPA    |
| Cybersecurity Analyst      | Linux, Networking, Security         | 10–22 LPA    |
| Mobile Developer           | React Native, Swift, Kotlin         | 10–22 LPA    |
| Data Analyst               | Python, SQL, Excel, Tableau         | 6–15 LPA     |
| Data Engineer              | Python, Spark, Hadoop, Airflow      | 14–28 LPA    |
| Site Reliability Engineer  | Linux, Docker, K8s, Terraform       | 15–30 LPA    |
| QA / Test Automation       | Python, Selenium, Jenkins           | 6–16 LPA     |
| Game Developer             | C++, C#, Unity, Unreal Engine       | 8–20 LPA     |
| Solutions Architect        | AWS, Azure, Docker, K8s             | 20–40 LPA    |
| Technical Writer           | Git, HTML, Python, Markdown         | 5–12 LPA     |
