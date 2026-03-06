# AI Career Engine: Stage 4 - Skill Gap Analysis System Specification

This document outlines the detailed system architecture, algorithms, prompting strategies, and implementation plan for **Stage 4: Skill Gap Analysis** of the Markhub AI Career OS pipeline.

---

## 01 — System Overview

**Purpose:** 
Stage 4 bridges the gap between a user's current capabilities and their target career trajectory. It mathematically and semantically determines missing proficiencies, categorizes their importance, and generates a structured roadmap foundation.

**Pipeline Placement:**
1. Stage 1: Initial Calibration (Resume Parsing & Preferences)
2. Stage 2: Assessment Engine (Cognitive & Scenario Responses)
3. Stage 3: Persona & DNA Construction
4. **Stage 4: Skill Gap Analysis (Validation & Mapping)**
5. Stage 5: Roadmap Generation (Curriculum & Projects)
6. Stage 6: Dashboard & Portfolio Assembly

**Core Inputs:** 
- User's Extracted Skill Set (from Stage 1 & 2)
- Target Career Role (from Stage 1)
- User Seniority/Level target

**Core Outputs:**
- Comprehensive JSON Gap Report detailing Missing Skills, Matched Skills, and Readiness Score.
- Prioritized Action Items for Stage 5 Curriculum Generation.

**Key Design Principles:**
1. **Separation of Concerns:** The LLM is used strictly for semantic understanding (extraction, edge-case routing), while deterministic code (JavaScript/Python) handles matching, subtraction, and arithmetic scoring.
2. **JSON-First:** Every transition between a sub-component or an LLM prompt strictly enforces structured JSON data contracts.
3. **Fuzzy Matching:** Acknowledges that resumes and job descriptions have vast vocabulary variance. Requires semantic mapping (e.g., "K8s" = "Kubernetes").
4. **Static Database Strategy:** The "Gold Standard" skills for each role are anchored to a periodically updated, static JSON/NoSQL database to prevent LLM hallucination and ensure consistent goalposts for all users.

---

## 02 — Architecture

**7-Layer System Breakdown:**
1. **Client Layer:** FastAPI/React frontend dispatching user profiles.
2. **Orchestrator Layer:** Pipeline controller managing the 4-step sequence.
3. **LLM Evaluation Layer:** Executes the 4-Prompt Chain for entity extraction.
4. **Algorithmic Matcher Layer:** Executes JS/Python set theory algorithms and Jaccard similarity.
5. **Static Knowledge Base (Database):** Holds the Role Skill Schema and Alias Dictionary.
6. **Scoring Engine:** Calculates weights, dimensions, and the final Readiness Score.
7. **Presentation Formatter:** Packages the gap JSON into the Stage 5 handoff contract.

**10-Step End-to-End Data Flow:**
1. System receives `User DNA JSON` (Target Role + Raw Skills).
2. Query Static KB to pull the target `Role Core Competencies`.
3. Dispatch Raw Skills through **Prompt 1: Extractor** to normalize syntax.
4. Dispatch Target Role via **Prompt 2: Role Mapper** (if target isn't an exact DB match).
5. Load the Alias Dictionary into the Algorithmic Matcher.
6. Execute Gap Algorithm (normalize → alias resolve → fuzzy match → set subtract).
7. Pass gap results to **Prompt 3: Gap Analyzer** for human-readable context.
8. Execute Priority Scoring (apply dimension weights to missing skills).
9. Run **Prompt 4: Display Formatter** to build the UI JSON structure.
10. Return compiled `GapReport JSON` to orchestrator for UI rendering and Stage 5 handoff.

**3 JSON Data Contracts:**
1. **`DNA_Input_Contract`**: `{ "user_id": "...", "target_role": "...", "raw_skills": ["...", "..."] }`
2. **`Algorithmic_Gap_Contract`**: `{ "role": "...", "matched": [...], "missing": [...], "similarity_score": 0.0 }`
3. **`UI_Report_Contract`**: `{ "readiness": "...", "critical_gaps": [...], "score": 0.0 }`

---

## 03 — Role Skill Database

**Data Schema (`RoleSkillSchema`):**
```json
{
  "role_id": "string",
  "role_name": "string",
  "dimensions": {
    "core_languages": {"weight": 0.4, "skills": ["string"]},
    "frameworks": {"weight": 0.3, "skills": ["string"]},
    "infrastructure": {"weight": 0.2, "skills": ["string"]},
    "soft_skills": {"weight": 0.1, "skills": ["string"]}
  }
}
```

**10 Included Base Roles:**
1. Software Engineer (Generalist)
2. AI Engineer
3. Data Scientist
4. Product Manager
5. Cloud Architect
6. UX Designer
7. DevOps Specialist
8. Cybersecurity Analyst
9. Frontend Developer
10. Backend Developer

**Complete AI Engineer Entry:**
```json
{
  "role_id": "role_ai_eng",
  "role_name": "AI Engineer",
  "dimensions": {
    "core_languages": { "weight": 0.35, "skills": ["Python", "SQL", "C++"] },
    "frameworks": { "weight": 0.30, "skills": ["PyTorch", "TensorFlow", "LangChain", "HuggingFace"] },
    "infrastructure": { "weight": 0.25, "skills": ["Docker", "Kubernetes", "AWS SageMaker", "CUDA"] },
    "soft_skills": { "weight": 0.10, "skills": ["Research Synthesis", "System Design", "Communication"] }
  }
}
```

**12-Entry Alias Dictionary:**
```json
{
  "tf": "TensorFlow",
  "k8s": "Kubernetes",
  "aws": "Amazon Web Services",
  "gcp": "Google Cloud Platform",
  "js": "JavaScript",
  "ts": "TypeScript",
  "reactjs": "React",
  "vuejs": "Vue",
  "k8": "Kubernetes",
  "postgres": "PostgreSQL",
  "mongo": "MongoDB",
  "llms": "Large Language Models"
}
```

**Database Expansion Strategy:**
- Automatically flag unmatched target roles inputted by users.
- Monthly async chron job fetches top 1,000 job descriptions for flagged roles using a job board API.
- LLM Map-Reduce chain extracts top statistically significant skills to generate a new `RoleSkillSchema` JSON.

---

## 04 — The 4-Prompt Chain

### Prompt 1: Extractor (User Input Parsing)
```text
System: You are an expert technical recruiter syntax parser. Your job is to extract technical skills from messy text and output a JSON list.
User: Extract the hard and soft skills from this user profile snippet: {RAW_INPUT}
Constraint: Output ONLY a valid JSON array of strings. Do not invent skills. Maximize granularity (e.g., split "Python/Django" into ["Python", "Django"]).
```
*Note: This cleans up user inputs before hitting the deterministic algorithm.*

### Prompt 2: Role Mapper (Fuzzy Role Identification)
```text
System: You map user-provided job titles to our 10 standard database categories.
User: The user wants to map to: {TARGET_ROLE}. Our available DB roles are: {DB_ROLES_LIST}. 
Task: Return ONLY the exact string from the DB list that is the closest semantic match. If completely unrelated, return "fallback_generalist".
```
*Note: Prevents DB query failures when users type "Ninja AI Dev".*

### Prompt 3: Gap Analyzer (Contextualization)
```text
System: You evaluate skill gaps.
Input: Target Role: {ROLE}. Missing Skills: {MISSING_LIST}.
Task: Write a 2-sentence encouraging, professional analysis of WHY these missing skills are important for the {ROLE}. No markdown, plain text.
```
*Note: Adds the "AI Mentor" human touch to cold programmatic data.*

### Prompt 4: Display Formatter
```text
System: Format the final engine data for UI consumption.
Input: Gap Metrics JSON: {METRICS}, Context Text: {CONTEXT}.
Task: Output exactly this JSON structure: 
{ "readinessStatus": "...", "score": 0.0, "summary": "...", "criticalPath": ["..."] }
Assign readinessStatus as exactly one of: ["ENTRY_READY", "UPSKILL_REQUIRED", "MAJOR_GAPS"].
```
*Note: Enforces strict typing for the React/Next.js frontend.*

---

## 05 — The Gap Algorithm

**The 5 Algorithm Steps:**
1. **Normalize:** Lowercase, strip punctuation and trailing spaces.
2. **Alias Resolve:** Map normalized inputs against the Alias Dictionary.
3. **Fuzzy Match (Jaccard):** Compare user skills against DB skills; if similarity > 0.8, consider it a match to handle minor typos.
4. **Set Subtraction:** `DB_Skills - Matched_User_Skills = Missing_Skills`.
5. **Priority Scoring:** Calculate matched percentage per dimension, multiply by dimension weight, sum for final score out of 100.

**Implementation code snippet (JavaScript):**
```javascript
function runGapAnalysis(userSkills, dbRoleDef, aliases) {
    // Step 1 & 2: Normalize and Alias
    const normalize = (s) => aliases[s.toLowerCase().trim()]?.toLowerCase() || s.toLowerCase().trim();
    const cleanUserSkills = new Set(userSkills.map(normalize));
    
    // Step 3: Fast Check (Exact/Alias), Fallback to Fuzzy Jaccard
    function jaccardSimilarity(str1, str2) {
        const set1 = new Set(str1.split('')), set2 = new Set(str2.split(''));
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }

    let finalScore = 0;
    const missing = [];
    const matched = [];

    // Step 4 & 5: Subtraction and Priority Scoring
    for (const [dimKey, dimData] of Object.entries(dbRoleDef.dimensions)) {
        let dimMatches = 0;
        for (const reqSkill of dimData.skills) {
            const cleanReq = normalize(reqSkill);
            
            // Exact match or fuzzy > 0.8
            const hasMatch = Array.from(cleanUserSkills).some(uSkill => 
                uSkill === cleanReq || jaccardSimilarity(uSkill, cleanReq) > 0.8
            );

            if (hasMatch) {
                matched.push(reqSkill);
                dimMatches++;
            } else {
                missing.push({ skill: reqSkill, dimension: dimKey, weight: dimData.weight });
            }
        }
        // Score = (Matches / Total in Dim) * DimWeight
        finalScore += (dimMatches / dimData.skills.length) * dimData.weight;
    }

    return {
        matched,
        missing: missing.sort((a,b) => b.weight - a.weight), // Highest priority first
        score: Math.round(finalScore * 100)
    };
}
```

---

## 06 — Output & Report Design

**JSON Report Schema (Stage 5 Handoff Contract):**
```json
{
  "report_id": "gap_req_9912",
  "role_targeted": "AI Engineer",
  "readiness_metrics": {
    "score": 65,
    "status": "UPSKILL_REQUIRED"
  },
  "mentor_summary": "You have a strong Python and SQL foundation, but transitioning to AI Engineering requires depth in PyTorch and Cloud Infrastructure (AWS/Docker).",
  "actionable_gaps": {
    "critical": ["PyTorch", "Kubernetes"],
    "secondary": ["System Design", "LangChain"]
  }
}
```

**UI Component Specs & Readiness Display:**
1. **Radar Chart Component:** 4-axis radar chart mapping the role's 4 dimensions. Overlays "Required" footprint vs "Current" footprint in varying opacity.
2. **Score Ring Component:** Circular progress indicator for the overall score.
3. **Gap Badges:** Pill-shaped UI elements for missing skills. Sorted by priority.
4. **Action Button:** "Generate Learning Path" (Triggers Stage 5 routing).

**Readiness Colors:**
- `ENTRY_READY` (Score > 85): Emerald Green (`#10b981`)
- `UPSKILL_REQUIRED` (Score 50 - 85): Amber Warning (`#f59e0b`)
- `MAJOR_GAPS` (Score < 50): Rose Red (`#f43f5e`)

---

## 07 — Implementation Checklist

**Build Order:**
- [ ] 1. Define Static Base JSON schema and populate the 10 core roles.
- [ ] 2. Scaffold FastApi/Express backend endpoints.
- [ ] 3. Setup LangChain/OpenAI client for the 4-Prompt Chain.
- [ ] 4. Implement JavaScript/Python Set Theory Algorithm (Gap Math).
- [ ] 5. Write Unit Tests for Jaccard Similarity and Alias Mapping.
- [ ] 6. Integrate Extractor Prompt pipeline.
- [ ] 7. Integrate Display Formatter to cast output to React schema.
- [ ] 8. Design and Map UI Radar Chart.
- [ ] 9. Hook API payload into Stage 5 Queue.
- [ ] 10. End-to-end dry run debugging.

**Test Matrix (5 Cases):**
1. **Perfect Match:** User inputs exact strings from a DB schema. (Expect 100).
2. **Total Miss:** User inputs "Photography, Editing" for "Frontend Dev". (Expect 0).
3. **Alias Heavy:** User inputs "TF, k8s, JS" for matched DB entry. (Expect exact alias resolution without dropping points).
4. **Typos:** User inputs "Pytorhc, Tensorflw". (Fuzzy matching must catch and score as matches).
5. **No Role Provided:** Tests the Role Mapper prompt fallback.

**Error Handling Table:**
| Failure Condition | System Action | UI Fallback |
| :--- | :--- | :--- |
| LLM Extractor Timeout | Fallback to regex split by comma/newline. | "Analyzing capabilities via fast-track..." |
| LLM JSON Malformed | Retry logic (max 2), then strip brackets manually. | N/A (Server-side) |
| DB Role Not Found | Default to "Software Engineer (Generalist)". | "Based on your input, we evaluated general readiness..." |

**Performance Targets:**
- Deterministic Algorithm Execution: `< 15ms`
- Prompt Chain Pipeline (Total): `< 3500ms` (Use concurrent prompt execution where possible).
- Database Lookup: `< 5ms`

---

## 08 — Worked Example

**End-to-End Trace:**

1. **Input:** User provides resume showing `["Python", "SQL", "Basic HTML"]`. Target Role: `"AI Engineer"`.
2. **Prompt 1 (Extractor):** Cleans input to exactly `["Python", "SQL", "HTML"]`.
3. **DB Lookup:** Fetches the `role_ai_eng` schema provided in Section 03.
4. **Gap Algorithm (Steps 1-2):** "Python" and "SQL" normalize correctly. "HTML" remains.
5. **Gap Algorithm (Steps 3-4):**
   - *Core Languages Check:* Python (Match), SQL (Match), C++ (Miss).
   - *Frameworks Check:* PyTorch (Miss), TensorFlow (Miss), etc.
   - *Resulting Gap:* Missing C++, PyTorch, TF, Docker, K8s, etc. HTML is ignored as it is extraneous to the AI Role schema.
6. **Priority Scoring:** 
   - Core Languages: 2/3 matched * 0.35 weight = `0.233`
   - Frameworks: 0/4 matched = `0`
   - Infrastructure: 0/4 matched = `0`
   - Soft Skills: 0/3 matched = `0`
   - **Score:** 23.3 / 100
7. **Prompt 3 (Gap Analyzer):** "You have an excellent foundation with Python and SQL. To break into AI, you will critically need to acquire framework specific knowledge in TensorFlow and PyTorch."
8. **Prompt 4 (Display Formatter):** Casts data into final UI JSON.
9. **Final Output (JSON):**
```json
{
  "report_id": "gap_req_example_01",
  "role_targeted": "AI Engineer",
  "readiness_metrics": { "score": 23, "status": "MAJOR_GAPS" },
  "mentor_summary": "You have an excellent foundation with Python and SQL. To break into AI, you will critically need to acquire framework specific knowledge in TensorFlow and PyTorch.",
  "actionable_gaps": {
    "critical": ["PyTorch", "TensorFlow", "Docker"],
    "secondary": ["C++", "System Design"]
  }
}
```
10. System displays the red `MAJOR_GAPS` view in the UI with a 23/100 readiness ring, presenting the Action Items for the Stage 5 roadmap generator.
