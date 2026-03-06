# MARKHUB — COMPLETE SYSTEM PLAN

## 1. Product Vision

### Problem
Students:
- Don't know what tech role suits them
- Don't know what skills they lack
- Learn random courses with no roadmap
- Don't experience real job tasks
- Don't know when they are job-ready

### MarkHub Solution
A platform that: Analyzes user skills → Identifies career paths → Detects skill gaps → Generates a roadmap → Provides simulations → Tracks progress → Prepares users for jobs

## User Journey
```
Login → Upload Resume/Skills → AI Skill Analysis → Career Path Selection
→ Skill Gap Analysis → Roadmap Generator → Career Simulation
→ Project Building → Job Readiness Score
```

---

## Stage 1 — User Skill Analysis
**Goal:** Understand the user's current ability level.

**User Inputs:** Resume/CV, GitHub (optional), Skills, Target salary, Target role

**Tech:** spaCy, PyMuPDF, pdfminer for resume parsing. Compare against 1200+ skill master database.

**Output:** User Skill Profile, Skill Strength Score, Skill Category Distribution

---

## Stage 2 — Career Path Discovery
**Goal:** Show possible career paths based on skills.

**Mapping:** Skills → Domain → Job Roles (e.g. Python + ML → AI Engineer)

**Output:** Top 5 suggested careers with confidence scores

---

## Stage 3 — Skill Gap Analysis
**Goal:** Compare User Skills vs Industry Skills for target role.

**Output:** Missing skills list, Skill Completion %, Beginner/Intermediate/Advanced breakdown

---

## Stage 4 — Career Roadmap Generator
**Goal:** Step-by-step roadmap to reach the target job.

**Output:** Month-by-month learning plan with skills, projects, and timeline

---

## Stage 5 — Career Simulation ⭐ (Hackathon-Winning Feature)
**Goal:** Users experience the actual job through simulations.

**Examples:**
- AI Engineer: Predict customer churn from dataset
- Product Manager: Analyze feedback, write feature proposal
- Developer: Fix bug in login API

---

## Stage 6 — Project Builder
**Goal:** Users build real projects tracked by the platform.

**Tracks:** Project Completion, Code Quality, Complexity

---

## Stage 7 — Job Readiness Score
**Goal:** Calculate composite readiness score.

**Based on:** Skill completion, Projects, Simulations, Portfolio, Mock interviews

---

## Stage 8 — Job Matching
**Goal:** Suggest jobs when readiness > 70%.

**Output:** Internships, Entry jobs, Freelance work suggestions

---

## Tech Architecture
| Layer | Stack |
|-------|-------|
| Frontend | React, Next.js, Tailwind |
| Backend | FastAPI, Python |
| AI Models | Sentence Transformers, Skill Matching, Resume Parser, NLP |
| Database | PostgreSQL, FAISS/ChromaDB |

## Secret Feature: Career Reality Engine
Users ask "What does a DevOps engineer actually do daily?" and get real workflow/tasks/problems.
