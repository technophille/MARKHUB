# MARKHUB — AI Career OS

> Your Career. Powered by AI. A 7-stage intelligence engine that discovers, analyzes, and accelerates your career path.

## Project Structure

```
MARKHUB/
├── frontend/               # Next.js 16 + Tailwind CSS React app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing Page
│   │   │   ├── layout.tsx                  # Root Layout (Inter font, Material Icons)
│   │   │   ├── globals.css                 # Tailwind v4 theme config
│   │   │   ├── onboarding/
│   │   │   │   ├── step1/page.tsx          # Welcome & Begin Calibration
│   │   │   │   ├── step2/page.tsx          # Career Calibration Form (8 sections)
│   │   │   │   └── step3/page.tsx          # AI Generation Loading Screen
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx              # Dashboard shell (Sidebar + main)
│   │   │       ├── discovery/page.tsx      # Stage 2/3 — DNA Report
│   │   │       ├── gaps/page.tsx           # Stage 4 — Skill Gap Analysis
│   │   │       ├── roadmap/page.tsx        # Stage 5/7 — Career Roadmap + AI Mentor
│   │   │       └── portfolio/page.tsx      # Stage 6 — Verified Portfolio
│   │   └── components/
│   │       └── layout/
│   │           ├── Sidebar.tsx             # Shared sidebar with active-state nav
│   │           └── TopHeader.tsx           # Shared page header
│   └── package.json
│
├── backend/                # Python/Node algorithm simulations
│   └── examples/
│       ├── run_stage4_example.js           # Gap analysis algorithm (Node.js)
│       ├── run_stage5_example.py           # Roadmap generator (Python)
│       └── run_stage7_example.py           # AI Mentor simulation (Python)
│
├── html-prototypes/        # Original static HTML/Tailwind mockups
│   ├── markhub_ai_saas_landing_page/
│   ├── markhub_onboarding_step_1/
│   ├── expanded_career_calibration_form/
│   ├── markhub_onboarding_step_3/
│   ├── markhub_ai_discovery_dashboard_1/
│   ├── markhub_ai_discovery_dashboard_2/
│   ├── markhub_ai_discovery_dashboard_gap/
│   └── markhub_ai_discovery_dashboard_roadmap/
│
├── docs/                   # Stage specifications (markdown)
│   ├── stage_4_skill_gap_analysis_spec.md
│   ├── stage_5_career_roadmap_spec.md
│   ├── stage_6_dashboard_portfolio_spec.md
│   ├── stage_7_tracking_feedback_spec.md
│   └── frontend_analysis.md
│
└── README.md
```

## The 7-Stage Pipeline

| Stage | Name | Status | Description |
|-------|------|--------|-------------|
| 1 | **Onboarding** | ✅ Built | Resume upload, calibration form, skill tagging |
| 2 | **Self-Discovery** | ✅ Built | Cognitive profiling, Big-5 personality, DNA report |
| 3 | **Career Mapping** | ✅ Built | AI-powered career trajectory recommendation |
| 4 | **Skill Gap Analysis** | ✅ Built | Fuzzy-match algorithm, priority-weighted gaps |
| 5 | **Career Roadmap** | ✅ Built | 4-phase learning path with course links |
| 6 | **Portfolio Assembly** | ✅ Built | Auto-generated portfolio with case studies |
| 7 | **AI Mentor** | ✅ Built | Velocity tracking, burnout detection, interventions |

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/technophille/MARKHUB.git
cd MARKHUB

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Start the dev server
npm run dev
# → Open http://localhost:3000
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend (planned)**: Python, FastAPI, PostgreSQL, Redis
- **Prototypes**: Static HTML + Tailwind CDN
- **Algorithms**: Node.js (gap analysis), Python (roadmap, mentor)

## User Flow

```
Landing Page → Onboarding Step 1 → Calibration Form → AI Generation
    → Discovery Dashboard → Skill Gaps → Roadmap → Portfolio
```

Every page is connected via Next.js `<Link>` routing and sidebar navigation.

## License

MIT © Nikhil K Menon