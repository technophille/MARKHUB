# AI Career Engine: Stage 7 - Continuous Tracking & Mentor Feedback Specification

This document details the system architecture, webhook integrations, and LLM mentor persona for **Stage 7: Continuous Tracking & Mentor Feedback** of the Markhub AI Career OS pipeline.

---

## 01 — System Vision & Goals

**Problem Statement:** 
A flawless 52-week roadmap (Stage 5) and a beautiful dashboard (Stage 6) are useless if the user abandons the platform after Week 3. Self-guided learning naturally suffers from high churn and motivational decay.

**Primary Goal:**
To implement an active, data-driven "AI Mentor" that monitors user progress telemetry, intervenes proactively during activity drop-offs, dynamically adjusts the roadmap when users struggle or excel, and drives long-term retention through hyper-personalized nudges.

**Success Metrics:**
1.  **Retention:** > 50% of users remain active at Week 12.
2.  **Resurrection Rate:** > 25% of churned users (inactive > 14 days) return after an AI Mentor intervention.
3.  **Roadmap Adaptation:** System successfully downscales or upscales roadmap difficulty for at least 15% of users based on completion velocity.

**7-Stage Pipeline Context:**
1.  Stage 1: Initial Calibration
2.  Stage 2: Assessment Engine
3.  Stage 3: Persona & DNA Construction
4.  Stage 4: Skill Gap Analysis 
5.  Stage 5: Career Roadmap Generator
6.  Stage 6: Dashboard & Portfolio Assembly
7.  **Stage 7: Continuous Tracking & Mentor Feedback (The Retention Layer)**

---

## 02 — Telemetry & Tracking Metrics

The system relies on passive tracking (webhooks) and active tracking (user inputs).

**Core Telemetry Events Tracking:**
1.  `SESSION_START`: User logs into the platform.
2.  `COURSE_CLICK`: User clicks a resource link (triggers a redirect tracker).
3.  `MILESTONE_COMPLETE`: User marks a sub-skill or phase as finished.
4.  `GITHUB_COMMIT`: Webhook triggered when a user pushes code to a linked Portfolio Project repository.
5.  `ASSESSMENT_SCORE`: Score from periodic quizzes injected into the roadmap.

**Streak & Velocity Math:**
- **Velocity (V):** Expected Hours per Week / Actual Hours Logged.
  - If `V < 0.5` for 2 weeks: Trigger **Struggle Protocol** (downscale roadmap hours).
  - If `V > 1.5` for 2 weeks: Trigger **Acceleration Protocol** (suggest advanced projects early).
- **Streak:** Consecutive days with at least 1 Telemetry Event.

---

## 03 — The AI Mentor Persona (Markhub Intelligence)

The Mentor is not a passive chatbot; it is an active agent that initiates contact via Dashboard Toasts, Emails, and WhatsApp/SMS.

**Persona Guidelines:**
- **Tone:** Professional, direct, encouraging, and slightly urgent. (Think: Senior Staff Engineer mentoring a Junior).
- **Format:** Short, scannable, actionable. No generic "You can do it!" fluff. Always reference specific data.
- **Example Good:** *"You've been stuck on the Docker module for 9 days. Complex networking is tough. Try this 10-minute visual guide instead of the 4-hour Coursera video, then let's move on."*
- **Example Bad:** *"Don't give up! Docker is important. Keep studying!"*

---

## 04 — Intervention Triggers & LLM Prompts (P7)

### Trigger 1: The "Drop-off" Warning (Inactive 7 Days)
- **Event:** No Telemetry for 7 days.
- **P7-A (Resurrection Prompt):**
```text
System: Write a short, highly-personalized resurrection email/nudge to a student who has stopped learning.
Input: User Context: {NAME}, Target: {TARGET_ROLE}, Current Blocked Skill: {SKILL}, Streak Lost: {PREV_STREAK}.
Task: Write 3 sentences. Acknowledge the break, remind them of the LPA/Career goal, and provide ONE tiny, 5-minute action to get back on track. Output Plaintext.
```

### Trigger 2: The "Velocity" Adaptation (Too Fast / Too Slow)
- **Event:** User velocity falls outside the [0.5, 1.5] bounds.
- **Action:** System mathematically re-calculates the 52-week limit. If bounds are broken, trigger P7-B.
- **P7-B (Roadmap Adjustment Prompt):**
```text
System: You adjust student expectations based on their performance data.
Input: Current Velocity: {VELOCITY}, Old Deadline: {OLD_DATE}, New Deadline: {NEW_DATE}, Constraint: {HOURS_CAPACITY}.
Task: Explain that we are adapting their roadmap to fit their actual pacing to avoid burnout (if slow) or prevent boredom (if fast). Suggest updating their Weekly Capacity settings.
```

### Trigger 3: The "Streak Milestone" (Positive Reinforcement)
- **Event:** User hits 7, 30, or 100 day streak, OR completes a Phase.
- **Action:** Trigger visual UI confetti & P7-C.
- **P7-C (Celebration Prompt):**
```text
System: You issue senior-level praise to dedicated juniors.
Input: Milestone: {MILESTONE_NAME}, Target: {TARGET_ROLE}.
Task: Write a 2-sentence congratulation tying the milestone directly to why it makes them a stronger candidate for {TARGET_ROLE}.
```

---

## 05 — Architecture & Implementations

**Tech Stack Integration:**
- **Cron Service:** Celery (Python) or Inngest (TypeScript/Next.js) running daily sweeps over the `users` table looking at `last_active_at`.
- **Communications API:** Resend (Emails) + Twilio (WhatsApp/SMS).
- **Tracking Middleware:** Next.js Middleware tracking `SESSION_START`.
- **GitHub Apps:** A registered Markhub GitHub App to listen to push webhooks on user repos.

**Data Schema (`user_telemetry` & `mentor_interventions`):**
```sql
CREATE TABLE user_telemetry (
    id UUID PRIMARY KEY,
    user_id UUID,
    event_type VARCHAR(50), -- e.g., 'GITHUB_COMMIT', 'SESSION_START'
    event_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mentor_interventions (
    id UUID PRIMARY KEY,
    user_id UUID,
    trigger_type VARCHAR(50), -- e.g., 'CHURN_RISK', 'MILESTONE'
    message_sent TEXT,
    was_successful BOOLEAN DEFAULT FALSE, -- True if user returns within 48h
    created_at TIMESTAMP
);
```

---

## 06 — Worked Example (The 7-Day Drop-Off)

1.  **Day 1-4:** User logs in daily, clicks Python courses. Streak = 4. `user_telemetry` logs 4 `SESSION_START` events.
2.  **Day 5-11:** User gets busy with university exams. No logins.
3.  **Day 12 (Cron Execution):** The `daily_churn_sweep` cron job identifies `last_active_at == NOW() - 7 days`.
4.  **LLM Trigger (P7-A):**
    - Input: `Alex, Target: AI Engineer, Blocked: PyTorch Tensors, Prev Streak: 4`.
    - Output: *"Hey Alex. Tensors can be mathematically heavy, which is usually where people pause. But AI Engineers at top brackets push through this exact filter. I've found a 5-minute visual explainer on Tensors—take exactly 5 minutes today just to watch it so we don't lose your momentum. Let's get that streak back."*
5.  **Dispatch:** Sent via Email and queued as a Dashboard UI Toast for their next login.
6.  **Resolution:** Alex clicks the email link (Triggering `COURSE_CLICK`). The `mentor_interventions` table updates `was_successful = TRUE`. Streak resets to 1.

---

## 07 — Implementation Checklist

**4-Sprint Build Plan:**
- [ ] Sprint 1: Setup `user_telemetry` table and Next.js middleware activity tracking.
- [ ] Sprint 2: Build the Velocity Math engine and the Daily Sweeper Cron Job (Celery/Inngest).
- [ ] Sprint 3: Integrate P7 Prompts with LangChain and connect to Resend/Twilio APIs.
- [ ] Sprint 4: Build the GitHub App Webhook receiver to track code commits automatically.

**Test Matrix (3 Cases):**
1.  **Time-Travel Mock:** Manually manipulate `last_active_at` in DB to exactly `-7 days` and assert the Cron job fires an intervention event.
2.  **Velocity Bounds:** Input heavily skewed hours (e.g. 50 hours logged in a 10 hour capacity roadmap) and assert the Acceleration script triggers.
3.  **GitHub Hook:** Send a mock standard GitHub Push JSON payload to your endpoint and assert `user_telemetry` logs a code event.
