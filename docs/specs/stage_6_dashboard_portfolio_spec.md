# AI Career Engine: Stage 6 - Dashboard & Portfolio Assembly Specification

This document details the system architecture, UI/UX structure, and data integration strategy for **Stage 6: Dashboard & Portfolio Assembly** of the Markhub AI Career OS pipeline.

---

## 01 — System Vision & Goals

**Problem Statement:** 
By Stage 5, the user has a persona, a gap report, and a detailed 52-week roadmap. However, they need a centralized, motivating command center to track progress, execute their roadmap, and automatically construct a public-facing portfolio as they learn.

**Primary Goal:**
To provide a unified, glassmorphism-styled dashboard that acts as the user's daily career operating system, while silently assembling a high-conversion, SEO-optimized portfolio in the background based on their verified project completions.

**Success Metrics:**
1.  **Daily Active Usage (DAU):** Users log in at least 3x a week to check off roadmap milestones.
2.  **Portfolio Activation:** > 75% of users who reach Phase 4 publish their auto-generated portfolio to the live web.
3.  **Time-on-Site:** Average session duration > 15 minutes (indicating active learning/planning rather than just glancing).

**7-Stage Pipeline Context:**
1.  Stage 1: Initial Calibration
2.  Stage 2: Assessment Engine
3.  Stage 3: Persona & DNA Construction
4.  Stage 4: Skill Gap Analysis 
5.  Stage 5: Career Roadmap Generator
6.  **Stage 6: Dashboard & Portfolio Assembly (The Execution Layer)**
7.  Stage 7: Continuous Tracking & Mentor Feedback 

---

## 02 — Dashboard Architecture & Core Modules

The Dashboard is the private, authenticated execution environment. It aggregates data from Stages 1-5 into 4 core functional modules:

### 1. The "Today" HUD (Heads Up Display)
- **Purpose:** Immediate actionable focus limits overwhelming the user with the 52-week plan.
- **Components:**
  - *Current Active Skill:* E.g., "Week 3: Deep dive into Kubernetes ConfigMaps."
  - *Daily AI Mentor Nudge:* A dynamic, LLM-generated motivational phrase based on recent activity (e.g., "You crushed Docker yesterday. Let's tackle K8s today.")
  - *Quick-Launch Course Button:* Directly opens the current linked course platform in a new tab.

### 2. The Interactive Roadmap Timeline (The Stage 5 View)
- **Purpose:** Visualizing the long-term journey.
- **Components:**
  - A vertical or horizontal subway-map style timeline broken into the 4 Phases.
  - Locked vs. Unlocked nodes.
  - Progress rings around each skill node.

### 3. The DNA & Gap Command Center (The Stage 3 & 4 View)
- **Purpose:** Reminding the user of their baseline and overarching goal.
- **Components:**
  - The Readiness Radar Chart.
  - LPA Target projection (e.g., "Tracking toward: AI Engineer | Target: 35 LPA").

### 4. The "Proof of Work" Vault (Pre-Portfolio)
- **Purpose:** Staging ground for completed projects before they go public.
- **Components:**
  - GitHub integration sync status.
  - Markdown editor for project readmes (pre-populated by Stage 5's P5-D Resume Coach).

---

## 03 — Auto-Portfolio Generation Engine

The defining feature of Stage 6 is the transition from *private tracking* to *public proof*. As a user completes Stage 5 capstone projects, Markhub generates a stunning personal website.

**The Assembly Process:**
1.  **Trigger:** User marks a Phase 4 Capstone Project as "Complete" and links a GitHub repo.
2.  **Scraping:** Backend fetches the `README.md` and repository analytics (stars, language breakdown).
3.  **LLM Enhancement (P6-A):** Rewrites the README into a compelling, recruiter-focused "Case Study".
4.  **Static Site Generation (SSG):** System compiles a Next.js/Tailwind template combining the user's Stage 3 DNA profile, Stage 4 acquired skills, and Stage 5 projects.
5.  **Deployment:** Pushes the static build to Vercel/AWS S3 via API, assigning a subdomain (`username.markhub.tech`).

**Portfolio Data Schema (`PublicPortfolio` JSON):**
```json
{
  "user_handle": "alex-ai",
  "seo_metadata": {
    "title": "Alex | AI Engineer Portfolio",
    "description": "Specializing in PyTorch, Kubernetes, and scalable system design."
  },
  "hero_section": {
    "headline": "Building High-Traffic ML Systems",
    "dna_tags": ["Analytical", "System Thinker", "Python Expert"]
  },
  "verified_skills": ["Python", "PyTorch", "Docker", "Kubernetes"],
  "projects": [
    {
      "id": "proj_chat_rag",
      "title": "Scalable RAG Chatbot",
      "tech_stack": ["PyTorch", "FastAPI"],
      "github_url": "https://github.com/...",
      "live_url": "...",
      "llm_case_study": "Engineered a retrieval-augmented generation pipeline handling 1k req/sec..."
    }
  ]
}
```

---

## 04 — Design System & UI/UX Specs

**Aesthetic:** Dark-mode default, "Glassmorphism" elements, neon accents for progress, high-contrast typography.

**Key UI Components:**
1.  **Sidebar Nav:** Collapsed icon-first navigation (Home, Roadmap, DNA, Vault, Settings).
2.  **Stat Cards:** Frosted glass cards (`backdrop-blur-xl bg-white/5 border border-white/10`) for metrics.
3.  **Confetti/Lottie Animations:** Micro-interactions triggered upon checking off a skill or phase completion to drive dopamine and retention.

---

## 05 — System Architecture

**Tech Stack Integration:**
- **Frontend Framework:** Next.js 14 (App Router) for both the private dashboard and the public generated portfolios.
- **Styling:** Tailwind CSS + Framer Motion (for timeline animations).
- **Backend Analytics Engine:** Python/FastAPI to aggregate completion metrics.
- **Portfolio Deployer:** Vercel REST API (Programmatic deployment creation).

**Core Database Schema Updates (`users` & `portfolios`):**
```sql
ALTER TABLE users ADD COLUMN current_streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;

CREATE TABLE public_portfolios (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    subdomain VARCHAR(100) UNIQUE,
    theme_config JSONB,
    portfolio_data JSONB,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP
);
```

**4 Key REST API Endpoints:**
1.  `GET /api/v1/dashboard/{user_id}` (Aggregates today's HUD data, roadmap progress, and DNA stats)
2.  `POST /api/v1/vault/projects/sync` (Webhooks/Fetches repo data from GitHub)
3.  `POST /api/v1/portfolio/generate` (Triggers LLM case study writing and compiles the JSON schema)
4.  `POST /api/v1/portfolio/publish` (Triggers programmatic deployment to Vercel/AWS)

---

## 06 — LLM Prompt Chain (P6)

### P6-A: Portfolio Case Study Writer
```text
System: You translate technical GitHub Readmes into compelling recruiter-facing case studies.
Input: Project Name: {NAME}, Tech Stack: {STACK}, Raw Readme: {README}.
Task: Write a 3-paragraph case study focusing on: 1) The Business Problem, 2) The Technical Architecture, 3) The Quantifiable Result. Output strict HTML format without markdown block wrappers.
```

---

## 07 — Implementation Checklist

**6-Sprint Build Plan:**
- [ ] Sprint 1: Next.js Layout scaffolding (Sidebar, Glassmorphism global CSS, Auth Context).
- [ ] Sprint 2: Build the "Today" HUD and integrate the daily LLM mentor nudge.
- [ ] Sprint 3: Build the Interactive Roadmap Timeline component (mapping Stage 5 JSON).
- [ ] Sprint 4: Build the "Proof of Work" Vault and basic GitHub API integration.
- [ ] Sprint 5: Implement P6-A Prompt Chain and static portfolio template generation.
- [ ] Sprint 6: Vercel API Integration for dynamic subdomain deployment.

**Test Matrix (4 Cases):**
1.  **Dashboard Load Perf:** Verify `GET /api/v1/dashboard` returns in < 300ms by utilizing Redis caching for non-volatile DNA data.
2.  **GitHub Token Expiration:** Handle 401s smoothly and prompt user to reconnect.
3.  **Subdomain Collision:** Test fallback logic if `username.markhub.tech` is already taken (append random int).
4.  **Empty States:** Ensure gorgeous, motivating empty states for users who just started Phase 1 and have no projects in their vault yet.

**Performance Targets:**
- Dashboard Aggregate Query: `< 300ms`
- Vercel Portfolio Deployment Trigger: `< 2s` (Actual build takes ~45s, handled async).

---

## Next Steps:
With Stage 6 defined, the core engine loop is complete. The user has been calibrated (1-3), analyzed (4), given a path (5), and provided an operating system to execute and publish that path (6). 
