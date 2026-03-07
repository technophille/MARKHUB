# AI Career Engine: Stage 5 - Career Roadmap Generator Master Plan

This document details the system architecture, recommendation logic, course linkage, and end-to-end data flow for **Stage 5: Career Roadmap Generator** of the Markhub AI Career OS pipeline.

---

## 01 — System Vision & Goals

**Problem Statement:** 
A Skill Gap Report (Stage 4) identifies what a user lacks, but raw data is not actionable. Users need a sequenced, time-bound, and resource-backed curriculum to achieve their career goals.

**Primary Goal:**
To ingest the Stage 4 Gap Report and generate a hyper-personalized, high-ROI learning roadmap that guides the user from their current state to a top-tier paying role within 52 weeks, complete with valid course links and strategic portfolio projects.

**Success Metrics:**
1.  **Completion Rate:** > 40% of users complete Phase 1 within 30 days.
2.  **Salary Alignment:** Generated roadmaps target top 25th percentile LPA roles.
3.  **Link Validity %:** > 98% of suggested course links return HTTP 200 statuses.

**7-Stage Pipeline Context:**
1.  Stage 1: Initial Calibration
2.  Stage 2: Assessment Engine
3.  Stage 3: Persona & DNA Construction
4.  Stage 4: Skill Gap Analysis 
5.  **Stage 5: Career Roadmap Generator (Curriculum & Projects)**
6.  Stage 6: Dashboard & Portfolio Assembly
7.  Stage 7: Continuous Tracking & Mentor Feedback 

---

## 02 — Top-LPA Targeting Engine

The Targeting Engine maps a user's chosen broad field to the highest-paying, achievable specialization. 

**Domain-to-Role Salary Ladder (Example: India / US averages scaling):**
1.  **AI/Data:** Data Analyst (Entry) → Machine Learning Engineer (Mid) → **AI Solutions Architect (Top-LPA)**
2.  **Web:** Frontend Developer (Entry) → Full Stack Engineer (Mid) → **Staff Full Stack Engineer (Top-LPA)**
3.  **DevOps:** SysAdmin (Entry) → Cloud Engineer (Mid) → **Site Reliability Engineering Manager (Top-LPA)**
4.  **Cyber:** SOC Analyst (Entry) → Penetration Tester (Mid) → **Principal Security Architect (Top-LPA)**
5.  **Product:** Associate PM (Entry) → Product Manager (Mid) → **Group Product Manager (Top-LPA)**

**The LPA Selection Algorithm:**
1.  Identify User's Base Domain (e.g., AI/Data).
2.  Assess Current Seniority based on Stage 4 `matched_skills` weight.
3.  Calculate Max Delta: User Current Level + 52 Weeks.
4.  **Selection:** Pick the role highest on the ladder achievable within the 52-week Delta, optimizing for the highest median Top-LPA band.

**5 Salary Data Sources (Weighted Aggregation):**
1.  AmbitionBox (India focus)
2.  Glassdoor (Global base)
3.  Naukri (Tech trends)
4.  LinkedIn Insights (Real-time hiring velocity)
5.  Internal Markhub Placement Data (Proprietary override)

---

## 03 — Roadmap Phase Engine

The engine organizes the raw list of missing skills into a structured, pedagogical 4-phase framework.

**The 4-Phase Framework:**
1.  **Phase 1: Foundations (Weeks 1-4):** Prerequisites, syntax, basic tooling. 
2.  **Phase 2: Core Competencies (Weeks 5-16):** Main frameworks, algorithms, and application building.
3.  **Phase 3: Advanced Architectures (Weeks 17-30):** Scalability, optimization, cloud deployment, system design.
4.  **Phase 4: Capstone & Portfolio (Weeks 31-40):** End-to-end multi-system projects, resume polishing, interview prep.

**Skill-to-Phase Classification Rules & Dependency Graph:**
Skills are mapped using a hardcoded Directed Acyclic Graph (DAG) to ensure prerequisites are met before advanced topics.
- *Rule 1:* If Skill A is a prerequisite for Skill B, A goes to an earlier phase.
- *Examples:* 
  - `Statistics` → prereq for `Machine Learning` → prereq for `Deep Learning`.
  - `JavaScript` → prereq for `React` → prereq for `Next.js`.

**Per-Skill Time Estimation Table (Base Hours):**
| Skill Category | Base Hours Required (Avg) | Examples |
| :--- | :--- | :--- |
| Core Language | 80 Hours | Python, JS, C++ |
| Scripting/Query | 40 Hours | SQL, Bash, HTML/CSS |
| Major Framework | 120 Hours | React, PyTorch, Spring Boot |
| Infrastructure | 100 Hours | AWS, Docker, Kubernetes |
| Conceptual | 60 Hours | System Design, DSA, Statistics |

---

## 04 — Course Link Engine

To make the roadmap actionable, every learning block is injected with a verified, direct link to high-quality educational content.

**9 Supported Platforms (Ranked by Priority):**
1.  Coursera (Academic/Deep dives)
2.  fast.ai (Practical AI)
3.  Udemy (Specific tools/frameworks)
4.  MIT OCW (Foundational theory)
5.  Kaggle (Data/ML practice)
6.  freeCodeCamp (Web Dev/Python execution)
7.  YouTube (Micro-learning/Specific blockers)
8.  Pluralsight (Enterprise tech)
9.  Educative.io (System Design/Algorithms)

**Course Record JSON Schema:**
```json
{
  "course_id": "fastai_dl_2022",
  "skill_target": "Deep Learning",
  "platform": "fast.ai",
  "title": "Practical Deep Learning for Coders",
  "url": "https://course.fast.ai/",
  "type": "video_course",
  "estimated_hours": 70,
  "difficulty": "intermediate",
  "rating": 4.9,
  "last_validated": "2024-05-01T00:00:00Z"
}
```

**Selection & Validation Strategy:**
- **Weighted Selection:** Algorithm prioritizes courses matching the user's `estimated_hours` availability, preferring free/high-rating courses first.
- **Link Validation Cron Strategy:** A weekly cron job runs a HEAD request against all URLs in the DB. 
- **3-Fallback Guarantee:** Every skill target in the database maintains at least 3 valid course links (Primary, Alternative 1, Alternative 2). If the primary 404s, it cascades to the fallback seamlessly.

---

## 05 — LLM Prompt Chain

The roadmap structure is deterministic, but the human-readable narrative and project generation require LLM formatting.

### P5-A: Roadmap Architect
```text
System: You are an elite Career Architect. 
Input: Gap JSON: {GAP_JSON}, Target Role: {TARGET_ROLE}, User Hours/Week: {HOURS}.
Task: Group the missing skills into 4 chronological phases (Foundations, Core, Advanced, Portfolio) adhering to strict dependency logic (e.g., Python before PyTorch). Output strictly a JSON array of phases.
```

### P5-B: Phase Narrative
```text
System: You write encouraging, expert-level summaries for learning phases.
Input: Phase Name: {PHASE_NAME}, Skills Included: {SKILL_LIST}, Target Role: {TARGET_ROLE}.
Task: Write a 3-sentence motivational introduction explaining WHY this phase is the critical next step toward becoming a {TARGET_ROLE}. Keep tone professional and urgent.
```

### P5-C: Portfolio Project Generator
```text
System: You architect impressive, resume-worthy capstone projects.
Input: Target Role: {TARGET_ROLE}, Acquired Skills: {ALL_SKILLS}.
Task: Design 3 distinct MVP projects that combine at least 3 of the acquired skills. 
Output Format JSON: [{ "project_name": "...", "description": "...", "tech_stack": ["..."], "business_value": "..." }]
```

### P5-D: Resume Coach
```text
System: You generate high-impact resume bullets.
Input: Project JSON: {PROJECT_JSON}.
Task: Generate 2 STAR-method (Situation, Task, Action, Result) resume bullet points for this project optimizing for ATS parsers targeting the {TARGET_ROLE}.
```

---

## 06 — Worked Example

**Profile Overview:**
- **Current Skills:** Python, SQL, HTML
- **Stage 4 Actionable Gaps:** PyTorch, TensorFlow, Docker, K8s, System Design.
- **Target Top-LPA Role:** AI Engineer (~35 LPA band)

**End-to-End Trace:**

1.  **Targeting Engine:** Confirms AI Engineer is achievable within 52 weeks based on existing Python/SQL foundation. Calculates a 34-week total roadmap based on hours.
2.  **Roadmap Phase Engine determines DAG:**
    - Python/SQL (Already Known)
    - PyTorch/TensorFlow (Phase 2 Core) -> depends on Python
    - Docker/K8s (Phase 3 Advanced) -> depends on Core completion
    - System Design (Phase 3 Advanced)
3.  **Course Link Engine Attribution:**
    - *PyTorch*: Maps to `fast.ai` Practical Deep Learning.
    - *Docker*: Maps to `freeCodeCamp` generic Docker course.
    - *System Design*: Maps to `Educative.io` Grokking Modern System Design.
4.  **P5-C Portfolio Project Generator creates specs:**
    1.  *Sentiment Analysis API:* (Python, FastAPI, basic NLP).
    2.  *Recommendation System:* (SQL, Python, Matrix Factorization).
    3.  *AI Chatbot with RAG:* (PyTorch/LangChain, Docker deployment, System Design for scale).
5.  **Final Compiled Roadmap JSON** is stored in the DB and rendered to the user as a beautifully styled, interactive 4-phase timeline.

---

## 07 — System Architecture

**10-Component Tech Stack:**
1.  **Frontend App:** Next.js + React + Tailwind + Framer Motion (Timeline rendering)
2.  **State Management:** Zustand (Handling Roadmap progress states)
3.  **Backend API:** FastAPI (Python)
4.  **Database:** PostgreSQL (Roadmaps, User Progress, Static Course Catalog)
5.  **Cache/Queue:** Redis + Celery (Async LLM calls and cron jobs)
6.  **LLM Router:** LangChain (Executing the 4 prompts)
7.  **Salary Aggregator Service:** Python BeautifulSoup/Requests (Data scraping)
8.  **Link Validator Cron:** Go/Python script running weekly `HEAD` requests.
9.  **Auth Network:** Supabase / Auth0
10. **Deployment:** AWS ECS / Vercel

**Core PostgreSQL Schema (`roadmaps` & `courses`):**
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    skill_tag VARCHAR(100),
    platform VARCHAR(50),
    url TEXT,
    difficulty VARCHAR(20),
    is_valid BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_roadmaps (
    id UUID PRIMARY KEY,
    user_id UUID,
    target_role VARCHAR(100),
    roadmap_json JSONB,
    generated_at TIMESTAMP
);
```

**6 REST API Endpoints:**
1.  `POST /api/v1/roadmaps/generate` (Triggers generation from Stage 4 payload)
2.  `GET /api/v1/roadmaps/{user_id}` (Fetches active roadmap)
3.  `PUT /api/v1/roadmaps/{user_id}/progress` (Updates completion status of a module)
4.  `GET /api/v1/courses/fallback/{skill}` (Retrieves alternative course if main fails)
5.  `POST /api/v1/projects/generate-bullets` (Hits P5-D for resume help)
6.  `GET /api/v1/salary/insights?role={role}` (Fetches LPA targeting data)

---

## 08 — Implementation Checklist

**8-Sprint Build Plan:**
- [ ] Sprint 1: DB Schema Setup (PostgreSQL) and Course Catalog seeding.
- [ ] Sprint 2: Core DAG logic implementation (Skill-to-Phase rules).
- [ ] Sprint 3: LLM Prompt Chain Integration (LangChain setup for P5-A through P5-D).
- [ ] Sprint 4: FastAPI Endpoint scaffolding and Integration with Stage 4 outputs.
- [ ] Sprint 5: Next.js Frontend Timeline & Phase UI component development.
- [ ] Sprint 6: Course Link Validator Cron Job implementation.
- [ ] Sprint 7: End-to-End Testing (Worked example pipeline validation).
- [ ] Sprint 8: Performance tuning, error handling, and deployment.

**Test Matrix (6 Cases):**
1.  `Empty_Gaps_Scenario`: Handles cases where Stage 4 returns no gaps (early graduation).
2.  `Invalid_Course_Fallback`: Mocks a 404 response to ensure fallback URLs are served.
3.  `Unrealistic_Timeframe`: Tests targeting engine when goal exceeds 52-week max boundary.
4.  `DAG_Violation`: Ensures Advanced skills never appear before Foundations.
5.  `Prompt_Timeout`: Triggers timeout on LLM to ensure base deterministic roadmap still generates.
6.  `Complete_End_To_End`: Validates full workflow mirroring the worked example.

**Error Handling Table:**
| Failure Condition | System Action | UI Fallback |
| :--- | :--- | :--- |
| LLM Timeout (P5-C) | Serve pre-generated static project templates mapped to role. | "Loading AI personalized projects... showing standard projects." |
| All 3 Course Links Dead | Hide specific course card, show generic search query link (e.g., YouTube search URL). | "Search for {Skill} tutorials" button |
| Generative Phase Mismatch | Discard LLM phase array, fallback to deterministic DAG phases. | Uninterrupted UI |

**Performance Targets:**
- Core Timeline Generation (Excluding LLM Projects): `< 1.5s`
- Full LLM Portfolio Generation (Async): `< 8s` (Background loading via WebSocket/Polling)
- Timeline Frontend Render Time: `< 200ms`

**v2.0 Future Features:**
1.  **Live Job Matching:** Integrate ATS APIs to highlight jobs that match exactly the currently completed phases.
2.  **AI Study Partner Bot:** RAG-enabled chatbot trained on the specific course transcripts assigned to the user.
3.  **Company-Specific Interview Prep:** Scrape Glassdoor interview questions tagged to the user's targeted highest-LPA companies.
