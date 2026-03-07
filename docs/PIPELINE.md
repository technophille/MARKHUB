# 🔬 The 7-Stage AI Pipeline

A deep dive into each stage of the MARKHUB Career Intelligence Engine.

---

## Pipeline Overview

```
Stage 1          Stage 2          Stage 3          Stage 4
Onboarding  ──►  Discovery   ──►  Career      ──►  Skill Gap
                                  Mapping          Analysis
                                                       │
                 Stage 7          Stage 6          Stage 5
                 AI Mentor   ◄──  Portfolio   ◄──  Career
                                  Assembly         Roadmap
```

Each stage builds on the data produced by previous stages, creating a cumulative intelligence profile.

---

## Stage 1: Onboarding

**Pages:** `/onboarding/step1`, `/onboarding/step2`, `/onboarding/step3`  
**API:** `POST /api/calibration`

### What happens

1. **Step 1 — Welcome:** User is introduced to the MARKHUB platform and starts calibration
2. **Step 2 — Career Calibration Form:** An 8-section form collecting:
   - Resume/CV upload (PDF)
   - Target career roles (multi-select from 18 roles)
   - Self-reported technical skills
   - Target salary expectation
   - GitHub profile URL
   - Weekly learning hours commitment
   - 7 soft-skill self-ratings (1–5 scale)
3. **Step 3 — AI Generation:** Loading screen while the backend processes the data

### Under the hood

- **Resume Parsing:** Uploaded PDFs are processed with PyPDF2 to extract text
- **NLP Skill Extraction:** Extracted text is run through the skills engine:
  - Direct matching against 60+ technical skills
  - Keyword inference (e.g., "web development" → HTML, CSS, JavaScript)
- All data is persisted to PostgreSQL and a `user_id` is returned

---

## Stage 2: Self-Discovery (Career DNA)

**Page:** `/discovery`  
**API:** `GET /api/profile/{user_id}`

### What the user sees

- **Cognitive Archetype** — One of 5 archetypes (Systems Thinker, Analytical Mind, Creative Innovator, Practical Builder, Emerging Explorer) based on soft-skill scores
- **Big-5 Personality Profile** — Radar chart of Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (derived from soft-skill ratings)
- **Skills Matrix** — Combined list of self-reported + CV-extracted skills
- **Career Readiness Score** — Percentage match to their primary career role

### Algorithm

The cognitive score is calculated from `problem_solving + adaptability` (2–10 range), then mapped to archetypes:

| Score Range | Archetype          |
|-------------|--------------------|
| 9–10        | Systems Thinker    |
| 7–8         | Analytical Mind    |
| 5–6         | Creative Innovator |
| 3–4         | Practical Builder  |
| 0–2         | Emerging Explorer  |

Big-5 traits are derived from soft-skill pairs, normalized to a 0–100 scale.

---

## Stage 3: Career Mapping

**Page:** `/careers`  
**API:** `GET /api/careers/{user_id}`

### What the user sees

- Ranked list of career roles with match percentages
- Salary ranges for each role
- Matched skills vs. missing skills per role
- Visual cards with icons and gradient colors

### Algorithm

For each of the 18 roles in `ROLE_CATALOG`:
1. Compare user's skills (self-reported + extracted) against role requirements
2. Calculate match percentage: `matched / total_required × 100`
3. Sort by match percentage (descending), then alphabetically
4. If user selected target roles during calibration, filter to only those roles

---

## Stage 4: Skill Gap Analysis

**Page:** `/gaps`  
**API:** `GET /api/gaps/{user_id}?role={role}`

### What the user sees

- Readiness gauge with percentage
- **Critical gaps** — High-weight missing skills (weight ≥ 0.75)
- **Secondary gaps** — Lower-weight missing skills
- Course recommendations for each gap
- Total hours and weeks estimate to close gaps

### Algorithm

Each missing skill has metadata in `SKILL_META`:
- **Hours** — Estimated learning time (5–60 hours)
- **Weight** — Importance for the role (0.30–0.95)

Skills are classified as:
- **Critical** if weight ≥ 0.75 (sorted by weight descending)
- **Secondary** otherwise

Time estimate: `total_hours / learning_hours_per_week = weeks`

### Course Database

40+ skills have curated course recommendations from:
- Udemy, Coursera, freeCodeCamp, YouTube
- Official documentation and tutorials
- Interactive platforms (CryptoZombies, SQLBolt, etc.)

---

## Stage 5: Career Roadmap

**Page:** `/roadmap`  
**API:** `GET /api/roadmap/{user_id}?role={role}`

### What the user sees

- Multi-phase learning timeline (Foundations → Core → Advanced → Specialization → Mastery)
- Per-phase skill breakdown with hours and courses
- Total weeks and hours timeline
- Recommended certifications for the target role

### Algorithm

1. Collect all missing skills for the target role
2. Divide into equal-sized phases (up to 5 phases)
3. Calculate hours per phase from `SKILL_META`
4. Mark Phase 1 as "active", others as "locked"
5. Attach role-specific certifications from `ROLE_CERTIFICATIONS`

### Certifications Database

Professional certifications mapped to each role, covering:
- AWS, Google Cloud, Microsoft Azure
- Meta, IBM, CompTIA
- CNCF (Kubernetes), HashiCorp
- Blockchain Council, EC-Council

---

## Stage 6: Portfolio Assembly

**Pages:** `/simulation`, `/projects`, `/portfolio`

### Simulations — Forage Virtual Experiences

**API:** `GET /api/simulation/{user_id}`

Real-world exercises from companies like JPMorgan Chase, BCG, Mastercard, etc. Each exercise includes:
- Company name and branding
- Duration and difficulty level
- Direct link to Forage simulation
- Role-relevant description

### Project Recommendations

**API:** `GET /api/projects/{user_id}?role={role}`

Curated project ideas tailored to the target role:
- Title, description, difficulty, and tech tags
- Link to relevant GitHub topics
- Projects span Beginner to Advanced levels

---

## Stage 7: AI Mentor & Tracking

**Pages:** `/readiness`, `/jobs`

### Readiness Score

Comprehensive career-readiness assessment combining:
- Skills coverage percentage
- Learning progress tracking
- Certification progress

### Job Matching

AI-curated job recommendations aligned with:
- User's skill profile and career targets
- Salary expectations
- Geographic and industry preferences

---

## Data Dependencies Between Stages

```
Stage 1 (Calibration)
    ├── resume → extracted_cv_skills
    ├── known_skills
    ├── target_roles
    └── soft_skill_ratings
          │
          ▼
Stage 2 (Discovery)
    ├── cognitive_archetype ← soft skills
    ├── big5_personality ← soft skills
    └── readiness_score ← skills vs. role requirements
          │
          ▼
Stage 3 (Career Mapping)
    └── ranked_careers ← all skills vs. ROLE_CATALOG
          │
          ▼
Stage 4 (Gaps)
    └── missing_skills + weights ← target role requirements
          │
          ▼
Stage 5 (Roadmap)
    └── learning_phases + certs ← missing skills + SKILL_META
          │
          ▼
Stage 6 (Portfolio)
    └── exercises + projects ← target role
          │
          ▼
Stage 7 (Mentor)
    └── readiness + jobs ← cumulative profile data
```
