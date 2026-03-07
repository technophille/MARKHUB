# 🔌 API Reference

Complete reference for all MARKHUB backend API endpoints.  
**Base URL:** `http://localhost:8000`

---

## Table of Contents

- [Health Check](#health-check)
- [Authentication](#authentication)
  - [POST /api/auth/signup](#post-apiauthsignup)
  - [POST /api/auth/login](#post-apiauthlogin)
- [Calibration](#calibration)
  - [POST /api/calibration](#post-apicalibration)
- [Career Intelligence](#career-intelligence)
  - [GET /api/profile/{user_id}](#get-apiprofileuser_id)
  - [GET /api/careers/{user_id}](#get-apicareersuser_id)
  - [GET /api/gaps/{user_id}](#get-apigapsuser_id)
  - [GET /api/roadmap/{user_id}](#get-apiroadmapuser_id)
  - [GET /api/simulation/{user_id}](#get-apisimulationuser_id)
  - [GET /api/projects/{user_id}](#get-apiprojectsuser_id)
- [Profiles](#profiles)
  - [GET /api/profiles](#get-apiprofiles)
  - [GET /api/profiles/{user_id}](#get-apiprofilesuser_id)

---

## Health Check

### `GET /`

Confirms the API is running.

**Response:**
```json
{
  "status": "ok",
  "service": "Markhub AI Backend"
}
```

---

## Authentication

### `POST /api/auth/signup`

Creates a new user account.

**Content-Type:** `multipart/form-data`

| Field      | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| `username` | string | ✅       | Unique username      |
| `password` | string | ✅       | Plain-text password  |

**Success Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "user_id": 1
}
```

**Error Response (duplicate username):**
```json
{
  "status": "error",
  "message": "Username already exists"
}
```

---

### `POST /api/auth/login`

Authenticates a user and returns their profile status.

**Content-Type:** `multipart/form-data`

| Field      | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| `username` | string | ✅       | Username             |
| `password` | string | ✅       | Plain-text password  |

**Success Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "user_id": 5,
  "is_new": false
}
```

> `is_new = true` means the user hasn't completed the calibration form yet. The frontend should redirect them to `/onboarding/step1`.

---

## Calibration

### `POST /api/calibration`

Submits the complete career calibration form. Handles resume upload, PDF text extraction, and AI skill inference.

**Content-Type:** `multipart/form-data`

| Field                | Type         | Required | Default | Description                              |
|---------------------|--------------|----------|---------|------------------------------------------|
| `resume`            | File (PDF)   | No       | —       | Resume/CV file upload                    |
| `target_roles`      | JSON string  | No       | `"[]"` | Array of target career roles             |
| `known_skills`      | JSON string  | No       | `"[]"` | Array of self-reported skills            |
| `target_salary`     | integer      | No       | `0`     | Target salary in LPA                     |
| `github_url`        | string       | No       | `""`    | GitHub profile URL                       |
| `learning_hours`    | integer      | No       | `15`    | Weekly learning hours commitment         |
| `soft_communication`| integer (1-5)| No       | `3`     | Communication skill self-rating          |
| `soft_leadership`   | integer (1-5)| No       | `3`     | Leadership skill self-rating             |
| `soft_teamwork`     | integer (1-5)| No       | `3`     | Teamwork skill self-rating               |
| `soft_problem_solving`| integer (1-5)| No     | `3`     | Problem-solving self-rating              |
| `soft_adaptability` | integer (1-5)| No       | `3`     | Adaptability self-rating                 |
| `soft_time_management`| integer (1-5)| No     | `3`     | Time management self-rating              |
| `soft_presentation` | integer (1-5)| No       | `3`     | Presentation skill self-rating           |
| `auth_user_id`      | integer      | No       | `0`     | Linked auth user ID                      |

**Success Response:**
```json
{
  "status": "success",
  "user_id": 1,
  "message": "Profile saved. Generating your Career OS...",
  "profile": {
    "resume": "john_doe_resume.pdf",
    "extracted_skills": ["Python", "React", "SQL", "Docker"],
    "target_roles": ["Full Stack Engineer", "ML Engineer"],
    "known_skills": ["JavaScript", "Node.js"],
    "target_salary": 20,
    "soft_skills": {
      "communication": 4,
      "leadership": 3,
      "teamwork": 5,
      "problem_solving": 4,
      "adaptability": 4,
      "time_management": 3,
      "presentation": 3
    }
  }
}
```

---

## Career Intelligence

### `GET /api/profile/{user_id}`

Returns the Career DNA report including cognitive archetype, Big-5 personality traits, skill matrix, and readiness score.

**Path Parameters:**

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| `user_id` | integer | User profile ID |

**Response:**
```json
{
  "status": "success",
  "profile": {
    "target_roles": ["Full Stack Engineer"],
    "primary_role": "Full Stack Engineer",
    "target_salary": 20,
    "learning_hours": 15,
    "resume_filename": "resume.pdf"
  },
  "dna": {
    "cognitive_profile": {
      "label": "Analytical Mind",
      "description": "You have a sharp analytical approach...",
      "score": 8
    },
    "career_trajectory": {
      "role": "Full Stack Engineer",
      "description": "Based on your skills..."
    },
    "readiness": {
      "percentage": 58,
      "label": "Progressing — you have a solid base...",
      "matched_skills": 7,
      "total_required": 12
    },
    "skills_matrix": ["Python", "React", "SQL", "..."],
    "big5": {
      "openness": 80,
      "conscientiousness": 60,
      "extraversion": 70,
      "agreeableness": 80,
      "neuroticism": 40
    },
    "summary": "You demonstrate strong analytical mind capabilities..."
  }
}
```

---

### `GET /api/careers/{user_id}`

Returns ranked career recommendations with match percentages.

**Response (abbreviated):**
```json
{
  "status": "success",
  "careers": [
    {
      "title": "Full Stack Engineer",
      "match": 75,
      "salary": "12–25 LPA",
      "icon": "code",
      "color": "from-blue-500 to-cyan-500",
      "matched_skills": ["React", "Node.js", "Python"],
      "missing_skills": ["Docker", "AWS", "MongoDB"],
      "total_required": 12,
      "total_matched": 9,
      "rank": 1
    }
  ]
}
```

---

### `GET /api/gaps/{user_id}`

Returns skill gap analysis with weighted priorities and course recommendations.

**Query Parameters:**

| Parameter | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| `role`    | string | No       | Specific role to analyze against |

**Response (abbreviated):**
```json
{
  "status": "success",
  "target_role": "Full Stack Engineer",
  "readiness": {
    "percentage": 58,
    "matched": 7,
    "total": 12
  },
  "summary": "Your profile shows strong skills in...",
  "critical_gaps": [
    {
      "skill": "Docker",
      "hours": 30,
      "weight": 0.80,
      "courses": [
        {
          "title": "Docker & Kubernetes Complete Guide (Udemy)",
          "url": "https://www.udemy.com/course/...",
          "hours": 22
        }
      ]
    }
  ],
  "secondary_gaps": [],
  "total_hours": 120,
  "weeks_estimate": 8,
  "learning_hours_per_week": 15
}
```

---

### `GET /api/roadmap/{user_id}`

Returns a multi-phase learning roadmap with time estimates and certifications.

**Query Parameters:**

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `role`    | string | No       | Specific target role     |

**Response (abbreviated):**
```json
{
  "status": "success",
  "target_role": "Full Stack Engineer",
  "salary_range": "12–25 LPA",
  "total_weeks": 12,
  "total_hours": 180,
  "learning_hours_per_week": 15,
  "phases": [
    {
      "phase": 1,
      "title": "Foundations",
      "skills": [
        {
          "name": "Docker",
          "hours": 30,
          "courses": [...]
        }
      ],
      "total_hours": 60,
      "weeks": 4,
      "status": "active"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer – Associate",
      "provider": "Amazon Web Services",
      "url": "https://aws.amazon.com/..."
    }
  ]
}
```

---

### `GET /api/simulation/{user_id}`

Returns Forage virtual experience exercises matched to the user's best-fit role.

**Response:**
```json
{
  "status": "success",
  "target_role": "Full Stack Engineer",
  "exercises": [
    {
      "title": "JPMorgan Chase Software Engineering",
      "company": "JPMorgan Chase",
      "url": "https://www.theforage.com/simulations/...",
      "duration": "5-6 hours",
      "difficulty": "Intermediate",
      "icon": "code",
      "color": "from-blue-600 to-blue-800",
      "description": "Build a real-time stock price data feed interface..."
    }
  ]
}
```

---

### `GET /api/projects/{user_id}`

Returns role-specific project recommendations for portfolio building.

**Query Parameters:**

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `role`    | string | No       | Specific target role    |

**Response:**
```json
{
  "status": "success",
  "target_role": "Full Stack Engineer",
  "projects": [
    {
      "title": "E-Commerce Platform",
      "difficulty": "Advanced",
      "tags": ["React", "Node.js", "PostgreSQL", "Stripe", "Docker"],
      "description": "Build a full e-commerce store with...",
      "github_url": "https://github.com/topics/ecommerce-website"
    }
  ]
}
```

---

## Profiles

### `GET /api/profiles`

Lists the 20 most recent user profiles.

### `GET /api/profiles/{user_id}`

Returns the complete raw profile record for a specific user.

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "status": "error",
  "message": "Profile not found"
}
```

Common error scenarios:
- `Profile not found` — Invalid `user_id`
- `Username already exists` — Duplicate signup
- `Invalid username or password` — Failed login
