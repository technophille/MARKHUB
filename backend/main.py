"""
MARKHUB Backend — FastAPI + PostgreSQL
Handles user profile creation from the Career Calibration form.
"""
from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
import json
import os
import shutil
from typing import Optional
import PyPDF2
import re
import tempfile
import traceback
from groq import Groq
import edge_tts

# --- Groq AI Client for Interview ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")
groq_client = Groq(api_key=GROQ_API_KEY)

INTERVIEW_MAX_TURNS = 5

app = FastAPI(title="Markhub AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

DB_CONFIG = {
    "dbname": "markhub",
    "user": os.environ.get("USER", "nikhilkmenon"),
    "host": "localhost",
    "port": 5432,
}

import bcrypt
import hashlib

def verify_password(plain_password, hashed_password):
    if isinstance(plain_password, str): plain_password = plain_password.encode('utf-8')
    pre_hashed = hashlib.sha256(plain_password).digest()
    if isinstance(hashed_password, str): hashed_password = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(pre_hashed, hashed_password)
    except Exception:
        return False

def get_password_hash(password):
    if isinstance(password, str): password = password.encode('utf-8')
    pre_hashed = hashlib.sha256(password).digest()
    return bcrypt.hashpw(pre_hashed, bcrypt.gensalt()).decode('utf-8')

# --- AI Skills Extraction Logic ---
MASTER_SKILLS_LIST = [
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust", "php",
    "react", "angular", "vue", "next.js", "node.js", "django", "flask", "spring boot", "fastapi",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "jenkins", "github actions",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "data science", "data engineering", "spark", "hadoop", "airflow",
    "linux", "bash", "networking", "security", "agile", "scrum", "git",
    "html", "css", "rest apis", "graphql", "firebase", "solidity", "web3",
    "excel", "tableau", "power bi", "r", "figma", "jira", "confluence",
    "swift", "kotlin", "flutter", "react native",
]

# Map CV buzzwords/phrases to actual tech skills
CV_KEYWORD_INFERENCES = {
    "web development": ["html", "css", "javascript"],
    "web devlopment": ["html", "css", "javascript"],
    "web-app development": ["html", "css", "javascript", "react"],
    "web-app devlopment": ["html", "css", "javascript", "react"],
    "app development": ["javascript", "react native"],
    "app devlopment": ["javascript", "react native"],
    "full stack": ["html", "css", "javascript", "node.js", "sql"],
    "frontend": ["html", "css", "javascript", "react"],
    "front-end": ["html", "css", "javascript", "react"],
    "backend": ["node.js", "sql", "rest apis"],
    "back-end": ["node.js", "sql", "rest apis"],
    "data analytics": ["python", "sql", "excel", "pandas"],
    "data analysis": ["python", "sql", "excel", "pandas"],
    "data analyst": ["python", "sql", "excel", "pandas"],
    "cybersecurity": ["security", "networking", "linux"],
    "cyber security": ["security", "networking", "linux"],
    "cloud computing": ["aws", "docker", "linux"],
    "devops": ["docker", "kubernetes", "ci/cd", "linux", "bash"],
    "machine learning": ["python", "machine learning", "pandas", "numpy"],
    "artificial intelligence": ["python", "machine learning", "deep learning"],
    "ai solution": ["python", "machine learning"],
    "ai devlopment": ["python", "machine learning"],
    "software developer": ["python", "javascript", "git", "sql"],
    "software engineer": ["python", "javascript", "git", "sql"],
    "ui/ux": ["html", "css", "figma"],
    "mobile development": ["javascript", "react native", "flutter"],
    "blockchain": ["solidity", "web3", "javascript"],
    "network protocol": ["networking", "linux"],
    "internet protocol": ["networking", "linux"],
    "computer network": ["networking", "linux"],
    "database": ["sql", "postgresql"],
    "api development": ["rest apis", "python", "node.js"],
}

def extract_skills_from_text(text: str) -> list[str]:
    """Enhanced NLP model to extract technical skills from CV text."""
    if not text:
        return []
    
    text_lower = text.lower()
    # Replace special characters with spaces for clean word matching
    text_clean = re.sub(r'[^a-z0-9+#.\-/]', ' ', text_lower)
    words = set(text_clean.split())
    
    found_skills = set()

    # 1) Direct skill matching from MASTER_SKILLS_LIST
    for skill in MASTER_SKILLS_LIST:
        if " " in skill:
            if skill in text_lower:
                found_skills.add(skill)
        elif "/" in skill:
            if skill in text_lower or skill in text_clean:
                found_skills.add(skill)
        else:
            if skill in words:
                found_skills.add(skill)
    
    # 2) Keyword inference — map CV phrases to actual skills
    for phrase, inferred_skills in CV_KEYWORD_INFERENCES.items():
        if phrase in text_lower:
            for s in inferred_skills:
                found_skills.add(s)

    # Format nicely
    formatted = []
    for skill in sorted(found_skills):
        if skill in ["aws", "gcp", "sql", "nlp", "css", "html", "ci/cd"]:
            formatted.append(skill.upper())
        elif skill == "c++":
            formatted.append("C++")
        elif skill == "c#":
            formatted.append("C#")
        elif skill == "php":
            formatted.append("PHP")
        elif skill == "r":
            formatted.append("R")
        else:
            formatted.append(skill.title())
            
    return formatted

def get_db():
    return psycopg2.connect(**DB_CONFIG)

@app.post("/api/auth/signup")
def signup(username: str = Form(...), password: str = Form(...)):
    conn = get_db()
    cur = conn.cursor()
    try:
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cur.fetchone():
            return {"status": "error", "message": "Username already exists"}
        
        # Hash password and store
        hashed_password = get_password_hash(password)
        cur.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id",
            (username, hashed_password)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        return {"status": "success", "message": "User created successfully", "user_id": user_id}
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

@app.post("/api/auth/login")
def login(username: str = Form(...), password: str = Form(...)):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, password_hash FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        
        if not user or not verify_password(password, user[1]):
            return {"status": "error", "message": "Invalid username or password"}
        
        # Check if user already has a profile (completed calibration)
        cur.execute("SELECT id FROM user_profiles WHERE user_id = %s ORDER BY id DESC LIMIT 1", (user[0],))
        profile_row = cur.fetchone()
        has_profile = profile_row is not None
        
        # Return the profile ID if exists, otherwise the auth user ID
        effective_id = profile_row[0] if profile_row else user[0]
        return {"status": "success", "message": "Login successful", "user_id": effective_id, "is_new": not has_profile}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

@app.get("/")
def root():
    return {"status": "ok", "service": "Markhub AI Backend"}

# --- Expanded Role Catalog with metadata ---
ROLE_CATALOG = {
    "Full Stack Engineer":     {"skills": ["react", "node.js", "typescript", "python", "sql", "docker", "git", "rest apis", "html", "css", "mongodb", "aws"], "salary": "12–25 LPA", "icon": "code", "color": "from-blue-500 to-cyan-500"},
    "Frontend Developer":      {"skills": ["react", "typescript", "html", "css", "javascript", "next.js", "git", "figma", "tailwind"], "salary": "8–20 LPA", "icon": "web", "color": "from-pink-500 to-rose-500"},
    "Backend Developer":       {"skills": ["python", "java", "sql", "docker", "rest apis", "git", "postgresql", "redis", "linux"], "salary": "10–22 LPA", "icon": "dns", "color": "from-emerald-500 to-teal-500"},
    "Data Scientist":          {"skills": ["python", "machine learning", "pandas", "numpy", "sql", "tensorflow", "scikit-learn", "data science", "statistics"], "salary": "12–28 LPA", "icon": "analytics", "color": "from-violet-500 to-purple-600"},
    "ML Engineer":             {"skills": ["python", "tensorflow", "pytorch", "docker", "machine learning", "deep learning", "sql", "aws", "git"], "salary": "14–30 LPA", "icon": "model_training", "color": "from-amber-500 to-orange-500"},
    "AI Engineer":             {"skills": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "docker", "aws"], "salary": "15–35 LPA", "icon": "smart_toy", "color": "from-indigo-500 to-blue-600"},
    "DevOps Engineer":         {"skills": ["docker", "kubernetes", "terraform", "aws", "linux", "ci/cd", "git", "bash", "jenkins", "github actions"], "salary": "12–25 LPA", "icon": "cloud_sync", "color": "from-sky-500 to-blue-500"},
    "Blockchain Developer":    {"skills": ["solidity", "javascript", "hardhat", "git", "react", "node.js", "docker", "typescript", "web3"], "salary": "15–30 LPA", "icon": "token", "color": "from-yellow-500 to-amber-600"},
    "Cloud Architect":         {"skills": ["aws", "azure", "gcp", "terraform", "docker", "kubernetes", "linux", "networking", "security"], "salary": "18–35 LPA", "icon": "cloud", "color": "from-cyan-500 to-sky-500"},
    "Cybersecurity Analyst":   {"skills": ["linux", "networking", "security", "python", "bash", "docker", "git"], "salary": "10–22 LPA", "icon": "shield", "color": "from-red-500 to-rose-600"},
    "Mobile Developer":        {"skills": ["react", "typescript", "javascript", "git", "firebase", "swift", "kotlin"], "salary": "10–22 LPA", "icon": "smartphone", "color": "from-green-500 to-emerald-500"},
    "Data Analyst":            {"skills": ["python", "sql", "pandas", "numpy", "excel", "tableau", "power bi", "statistics"], "salary": "6–15 LPA", "icon": "bar_chart", "color": "from-orange-500 to-red-500"},
    "Data Engineer":           {"skills": ["python", "sql", "spark", "hadoop", "airflow", "docker", "aws", "data engineering", "kafka"], "salary": "14–28 LPA", "icon": "storage", "color": "from-teal-500 to-cyan-600"},
    "Site Reliability Engineer": {"skills": ["linux", "docker", "kubernetes", "python", "bash", "terraform", "aws", "ci/cd", "networking", "git"], "salary": "15–30 LPA", "icon": "monitoring", "color": "from-lime-500 to-green-600"},
    "QA / Test Automation":    {"skills": ["python", "javascript", "git", "docker", "selenium", "jenkins", "sql", "rest apis"], "salary": "6–16 LPA", "icon": "bug_report", "color": "from-fuchsia-500 to-pink-600"},
    "Game Developer":          {"skills": ["c++", "c#", "python", "git", "unity", "unreal engine", "3d math", "physics"], "salary": "8–20 LPA", "icon": "sports_esports", "color": "from-purple-500 to-violet-600"},
    "Solutions Architect":     {"skills": ["aws", "azure", "docker", "kubernetes", "networking", "security", "python", "sql", "terraform", "rest apis"], "salary": "20–40 LPA", "icon": "architecture", "color": "from-slate-500 to-gray-600"},
    "Technical Writer":        {"skills": ["git", "html", "css", "python", "rest apis", "markdown"], "salary": "5–12 LPA", "icon": "edit_note", "color": "from-stone-500 to-zinc-600"},
    "Product Manager":         {"skills": ["sql", "excel", "python", "agile", "scrum", "figma", "data science", "rest apis"], "salary": "15–35 LPA", "icon": "inventory_2", "color": "from-indigo-400 to-violet-500"},
    "UX Designer":             {"skills": ["figma", "html", "css", "javascript", "react", "git"], "salary": "8–22 LPA", "icon": "palette", "color": "from-pink-400 to-fuchsia-500"},
    "Platform Engineer":       {"skills": ["docker", "kubernetes", "terraform", "aws", "gcp", "linux", "python", "ci/cd", "git", "github actions", "bash"], "salary": "18–35 LPA", "icon": "layers", "color": "from-cyan-400 to-blue-500"},
    "Embedded Systems Engineer": {"skills": ["c++", "python", "linux", "git", "bash", "networking"], "salary": "10–22 LPA", "icon": "memory", "color": "from-gray-500 to-slate-600"},
    "NLP Engineer":            {"skills": ["python", "nlp", "machine learning", "deep learning", "tensorflow", "pytorch", "docker", "git", "sql"], "salary": "16–35 LPA", "icon": "chat", "color": "from-emerald-400 to-teal-500"},
    "Computer Vision Engineer": {"skills": ["python", "computer vision", "deep learning", "tensorflow", "pytorch", "docker", "linux", "git"], "salary": "16–35 LPA", "icon": "visibility", "color": "from-blue-400 to-indigo-500"},
    "Database Administrator":  {"skills": ["sql", "postgresql", "mongodb", "redis", "linux", "python", "docker", "bash"], "salary": "10–25 LPA", "icon": "database", "color": "from-amber-400 to-yellow-500"},
    "Security Engineer":       {"skills": ["python", "linux", "networking", "security", "docker", "kubernetes", "bash", "aws", "terraform"], "salary": "15–30 LPA", "icon": "vpn_lock", "color": "from-red-400 to-orange-500"},
}

# Backward-compat alias for the profile endpoint
ROLE_REQUIRED_SKILLS = {k: v["skills"] for k, v in ROLE_CATALOG.items()}

# --- Cognitive archetypes ---
COGNITIVE_ARCHETYPES = [
    {"min": 9,  "label": "Systems Thinker",     "desc": "You excel at seeing the big picture and designing complex architectures. Your analytical reasoning is exceptionally strong."},
    {"min": 7,  "label": "Analytical Mind",      "desc": "You have a sharp analytical approach and break problems down methodically. You thrive in data-driven environments."},
    {"min": 5,  "label": "Creative Innovator",   "desc": "You balance creativity with logic, finding novel solutions. You're adaptable and learn quickly in new domains."},
    {"min": 3,  "label": "Practical Builder",    "desc": "You prefer hands-on work and concrete outcomes. You're dependable and excel at executing well-defined tasks."},
    {"min": 0,  "label": "Emerging Explorer",    "desc": "You're at the start of your professional journey with lots of potential to grow. Focus on foundational skills first."},
]

@app.get("/api/careers/{user_id}")
def get_career_recommendations(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT known_skills, extracted_cv_skills, target_roles
            FROM user_profiles WHERE id = %s
        """, (user_id,))
        row = cur.fetchone()

        if not row:
            return {"status": "error", "message": "Profile not found"}

        known_skills = row[0] or []
        extracted_cv_skills = row[1] or []
        target_roles = row[2] or []
        user_skills_lower = set(s.lower() for s in known_skills + extracted_cv_skills)

        # Show ALL roles, ranked by match %. User's target_roles get a boost indicator.
        recommendations = []
        for role_name, meta in ROLE_CATALOG.items():
            required = meta["skills"]
            matched = [s for s in required if s in user_skills_lower]
            match_pct = round((len(matched) / max(len(required), 1)) * 100)
            display_skills = [s.title() if s not in ["aws", "gcp", "sql", "nlp", "ci/cd"] else s.upper() for s in matched]
            missing = [s.title() if s not in ["aws", "gcp", "sql", "nlp", "ci/cd"] else s.upper() for s in required if s not in user_skills_lower][:3]

            recommendations.append({
                "title": role_name,
                "match": match_pct,
                "salary": meta["salary"],
                "icon": meta["icon"],
                "color": meta["color"],
                "matched_skills": display_skills,
                "missing_skills": missing,
                "total_required": len(required),
                "total_matched": len(matched),
                "is_target": role_name in target_roles,
            })

        recommendations.sort(key=lambda x: (-x["match"], x["title"]))
        for i, rec in enumerate(recommendations):
            rec["rank"] = i + 1

        return {"status": "success", "careers": recommendations}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

# --- Skill gap metadata: estimated hours and weights per skill ---
SKILL_META = {
    "react": {"hours": 40, "weight": 0.90}, "node.js": {"hours": 35, "weight": 0.85},
    "typescript": {"hours": 30, "weight": 0.80}, "python": {"hours": 45, "weight": 0.95},
    "sql": {"hours": 25, "weight": 0.85}, "docker": {"hours": 30, "weight": 0.80},
    "git": {"hours": 10, "weight": 0.70}, "rest apis": {"hours": 20, "weight": 0.75},
    "html": {"hours": 15, "weight": 0.60}, "css": {"hours": 15, "weight": 0.60},
    "mongodb": {"hours": 25, "weight": 0.70}, "aws": {"hours": 50, "weight": 0.90},
    "javascript": {"hours": 35, "weight": 0.85}, "next.js": {"hours": 25, "weight": 0.75},
    "figma": {"hours": 15, "weight": 0.50}, "tailwind": {"hours": 10, "weight": 0.45},
    "java": {"hours": 50, "weight": 0.85}, "postgresql": {"hours": 25, "weight": 0.75},
    "redis": {"hours": 20, "weight": 0.65}, "linux": {"hours": 30, "weight": 0.80},
    "machine learning": {"hours": 60, "weight": 0.95}, "pandas": {"hours": 20, "weight": 0.70},
    "numpy": {"hours": 15, "weight": 0.65}, "tensorflow": {"hours": 50, "weight": 0.90},
    "scikit-learn": {"hours": 30, "weight": 0.80}, "data science": {"hours": 40, "weight": 0.85},
    "statistics": {"hours": 35, "weight": 0.80}, "pytorch": {"hours": 50, "weight": 0.88},
    "deep learning": {"hours": 55, "weight": 0.92}, "nlp": {"hours": 45, "weight": 0.85},
    "computer vision": {"hours": 50, "weight": 0.85}, "kubernetes": {"hours": 60, "weight": 0.95},
    "terraform": {"hours": 40, "weight": 0.90}, "ci/cd": {"hours": 25, "weight": 0.80},
    "bash": {"hours": 15, "weight": 0.65}, "jenkins": {"hours": 20, "weight": 0.60},
    "github actions": {"hours": 15, "weight": 0.55}, "azure": {"hours": 40, "weight": 0.85},
    "gcp": {"hours": 40, "weight": 0.85}, "networking": {"hours": 30, "weight": 0.75},
    "security": {"hours": 35, "weight": 0.80}, "solidity": {"hours": 45, "weight": 0.95},
    "hardhat": {"hours": 20, "weight": 0.75}, "web3": {"hours": 35, "weight": 0.85},
    "firebase": {"hours": 20, "weight": 0.60}, "swift": {"hours": 45, "weight": 0.80},
    "kotlin": {"hours": 45, "weight": 0.80}, "excel": {"hours": 10, "weight": 0.40},
    "tableau": {"hours": 20, "weight": 0.55}, "power bi": {"hours": 20, "weight": 0.55},
    "spark": {"hours": 45, "weight": 0.90}, "hadoop": {"hours": 40, "weight": 0.80},
    "airflow": {"hours": 30, "weight": 0.75}, "data engineering": {"hours": 40, "weight": 0.85},
    "kafka": {"hours": 35, "weight": 0.80}, "selenium": {"hours": 20, "weight": 0.65},
    "c++": {"hours": 60, "weight": 0.90}, "c#": {"hours": 50, "weight": 0.85},
    "unity": {"hours": 50, "weight": 0.85}, "unreal engine": {"hours": 60, "weight": 0.90},
    "3d math": {"hours": 40, "weight": 0.75}, "physics": {"hours": 30, "weight": 0.65},
    "markdown": {"hours": 5, "weight": 0.30},
}

@app.get("/api/gaps/{user_id}")
def get_skill_gaps(user_id: int, role: str = None):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT known_skills, extracted_cv_skills, learning_hours_per_week
            FROM user_profiles WHERE id = %s
        """, (user_id,))
        row = cur.fetchone()

        if not row:
            return {"status": "error", "message": "Profile not found"}

        known_skills = row[0] or []
        extracted_cv_skills = row[1] or []
        learning_hours = row[2] or 10
        user_skills_lower = set(s.lower() for s in known_skills + extracted_cv_skills)

        # Use selected role if provided and valid, otherwise find best match
        if role and role in ROLE_CATALOG:
            best_role = role
        else:
            best_role = None
            best_match = -1
            for role_name, meta in ROLE_CATALOG.items():
                required = meta["skills"]
                matched = sum(1 for s in required if s in user_skills_lower)
                pct = round((matched / max(len(required), 1)) * 100)
                if pct > best_match:
                    best_match = pct
                    best_role = role_name

        role_meta = ROLE_CATALOG.get(best_role, list(ROLE_CATALOG.values())[0])
        required_skills = role_meta["skills"]

        # Calculate matched and missing
        matched_skills = [s for s in required_skills if s in user_skills_lower]
        missing_skills = [s for s in required_skills if s not in user_skills_lower]

        readiness_pct = round((len(matched_skills) / max(len(required_skills), 1)) * 100)

        # Build gap items with metadata
        critical_gaps = []
        secondary_gaps = []

        for skill in missing_skills:
            meta = SKILL_META.get(skill, {"hours": 20, "weight": 0.50})
            display_name = skill.upper() if skill in ["aws", "gcp", "sql", "nlp", "ci/cd"] else skill.title()
            courses = SKILL_COURSES.get(skill, [{"title": f"Learn {display_name} (Google Search)", "url": f"https://www.google.com/search?q=learn+{skill.replace(' ', '+')}", "hours": meta["hours"]}])
            item = {"skill": display_name, "hours": meta["hours"], "weight": meta["weight"], "courses": courses}
            if meta["weight"] >= 0.75:
                critical_gaps.append(item)
            else:
                secondary_gaps.append(item)

        # Sort by weight descending
        critical_gaps.sort(key=lambda x: -x["weight"])
        secondary_gaps.sort(key=lambda x: -x["weight"])

        # Total hours and weeks
        total_hours = sum(g["hours"] for g in critical_gaps + secondary_gaps)
        weeks_estimate = max(1, round(total_hours / max(learning_hours, 1)))

        # Top 3 missing for summary
        top_missing = [g["skill"] for g in critical_gaps[:3]]
        matched_display = [s.title() if s not in ["aws", "gcp", "sql", "nlp", "ci/cd"] else s.upper() for s in matched_skills[:3]]

        summary = (
            f"Your profile shows strong skills in {', '.join(matched_display) if matched_display else 'foundational areas'}, "
            f"but you are missing {len(missing_skills)} critical {best_role} competencies. "
        )
        if top_missing:
            summary += f"The biggest gaps are in {', '.join(top_missing)} — all high-weight skills for this role. "
        summary += f"Your estimated time to close these gaps at {learning_hours} hrs/week is {weeks_estimate} weeks."

        return {
            "status": "success",
            "target_role": best_role,
            "readiness": {
                "percentage": readiness_pct,
                "matched": len(matched_skills),
                "total": len(required_skills),
            },
            "summary": summary,
            "critical_gaps": critical_gaps,
            "secondary_gaps": secondary_gaps,
            "total_hours": total_hours,
            "weeks_estimate": weeks_estimate,
            "learning_hours_per_week": learning_hours,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

# --- Course suggestions per skill ---
SKILL_COURSES = {
    "react": [
        {"title": "React – The Complete Guide (Udemy)", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "hours": 48},
        {"title": "Full Stack Open – React (Helsinki)", "url": "https://fullstackopen.com/en/", "hours": 30},
    ],
    "node.js": [
        {"title": "The Complete Node.js Developer (Udemy)", "url": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", "hours": 35},
        {"title": "Node.js Crash Course (Traversy)", "url": "https://youtu.be/fBNz5xF-Kx4", "hours": 3},
    ],
    "typescript": [
        {"title": "Understanding TypeScript (Udemy)", "url": "https://www.udemy.com/course/understanding-typescript/", "hours": 15},
        {"title": "TypeScript Handbook (Official)", "url": "https://www.typescriptlang.org/docs/handbook/", "hours": 10},
    ],
    "python": [
        {"title": "100 Days of Code – Python (Udemy)", "url": "https://www.udemy.com/course/100-days-of-code/", "hours": 60},
        {"title": "CS50P – Harvard Python (edX)", "url": "https://cs50.harvard.edu/python/", "hours": 40},
    ],
    "sql": [
        {"title": "The Complete SQL Bootcamp (Udemy)", "url": "https://www.udemy.com/course/the-complete-sql-bootcamp/", "hours": 20},
        {"title": "SQLBolt Interactive Tutorials", "url": "https://sqlbolt.com/", "hours": 8},
    ],
    "docker": [
        {"title": "Docker & Kubernetes Complete Guide (Udemy)", "url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/", "hours": 22},
        {"title": "Docker Crash Course (TechWorld with Nana)", "url": "https://youtu.be/3c-iBn73dDE", "hours": 4},
    ],
    "kubernetes": [
        {"title": "Kubernetes for Absolute Beginners (KodeKloud)", "url": "https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners/", "hours": 25},
        {"title": "CKA Certification Course (Udemy)", "url": "https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/", "hours": 40},
    ],
    "terraform": [
        {"title": "HashiCorp Terraform Associate Prep", "url": "https://www.udemy.com/course/terraform-beginner-to-advanced/", "hours": 20},
        {"title": "Terraform Tutorials (Official)", "url": "https://developer.hashicorp.com/terraform/tutorials", "hours": 15},
    ],
    "aws": [
        {"title": "AWS Solutions Architect Associate (Cantrill)", "url": "https://learn.cantrill.io/p/aws-certified-solutions-architect-associate-saa-c03", "hours": 50},
        {"title": "AWS Cloud Practitioner (freeCodeCamp)", "url": "https://youtu.be/SOTamWNgDKc", "hours": 14},
    ],
    "git": [
        {"title": "Git & GitHub Crash Course (Traversy)", "url": "https://youtu.be/SWYqp7iY_Tc", "hours": 2},
        {"title": "Pro Git Book (Free)", "url": "https://git-scm.com/book/en/v2", "hours": 8},
    ],
    "rest apis": [
        {"title": "REST API Design RESTful Web Services (Udemy)", "url": "https://www.udemy.com/course/rest-api-design/", "hours": 12},
        {"title": "FastAPI Full Course (freeCodeCamp)", "url": "https://youtu.be/0sOvCWFmrtA", "hours": 6},
    ],
    "machine learning": [
        {"title": "Machine Learning by Andrew Ng (Coursera)", "url": "https://www.coursera.org/learn/machine-learning", "hours": 60},
        {"title": "ML Crash Course (Google)", "url": "https://developers.google.com/machine-learning/crash-course", "hours": 20},
    ],
    "deep learning": [
        {"title": "Deep Learning Specialization (Coursera)", "url": "https://www.coursera.org/specializations/deep-learning", "hours": 80},
        {"title": "Fast.ai Practical Deep Learning", "url": "https://course.fast.ai/", "hours": 40},
    ],
    "tensorflow": [
        {"title": "TensorFlow Developer Certificate Prep (Udemy)", "url": "https://www.udemy.com/course/tensorflow-developer-certificate-machine-learning-zero-to-mastery/", "hours": 60},
    ],
    "pytorch": [
        {"title": "PyTorch for Deep Learning (freeCodeCamp)", "url": "https://youtu.be/V_xro1bcAuA", "hours": 26},
        {"title": "Learn PyTorch (learnpytorch.io)", "url": "https://www.learnpytorch.io/", "hours": 30},
    ],
    "solidity": [
        {"title": "Solidity & Ethereum – Complete Guide (Udemy)", "url": "https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/", "hours": 24},
        {"title": "CryptoZombies (Interactive)", "url": "https://cryptozombies.io/", "hours": 10},
    ],
    "hardhat": [
        {"title": "Hardhat Beginner Tutorial (Chainlink)", "url": "https://youtu.be/gyMwXuJrbJQ", "hours": 15},
    ],
    "web3": [
        {"title": "Web3 Developer Bootcamp (LearnWeb3)", "url": "https://learnweb3.io/", "hours": 30},
        {"title": "Blockchain Developer Full Course (freeCodeCamp)", "url": "https://youtu.be/gyMwXuJrbJQ", "hours": 32},
    ],
    "javascript": [
        {"title": "The Complete JavaScript Course (Udemy)", "url": "https://www.udemy.com/course/the-complete-javascript-course/", "hours": 69},
        {"title": "JavaScript.info (Free)", "url": "https://javascript.info/", "hours": 30},
    ],
    "mongodb": [
        {"title": "MongoDB – The Complete Developer's Guide (Udemy)", "url": "https://www.udemy.com/course/mongodb-the-complete-developers-guide/", "hours": 17},
    ],
    "linux": [
        {"title": "Linux Mastery (Udemy)", "url": "https://www.udemy.com/course/linux-mastery/", "hours": 12},
        {"title": "Linux Journey (Free)", "url": "https://linuxjourney.com/", "hours": 10},
    ],
    "networking": [
        {"title": "Computer Networking Full Course (freeCodeCamp)", "url": "https://youtu.be/qiQR5rTSshw", "hours": 10},
    ],
    "security": [
        {"title": "CompTIA Security+ Full Course (Professor Messer)", "url": "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", "hours": 25},
    ],
    "ci/cd": [
        {"title": "CI/CD with GitHub Actions (freeCodeCamp)", "url": "https://youtu.be/R8_veQiYBjI", "hours": 8},
    ],
    "bash": [
        {"title": "Bash Scripting Tutorial (Ryan's)", "url": "https://ryanstutorials.net/bash-scripting-tutorial/", "hours": 8},
    ],
    "spark": [
        {"title": "Apache Spark with Python (Udemy)", "url": "https://www.udemy.com/course/spark-and-python-for-big-data-with-pyspark/", "hours": 12},
    ],
    "next.js": [
        {"title": "Next.js 14 Complete Course (Udemy)", "url": "https://www.udemy.com/course/nextjs-react-the-complete-guide/", "hours": 25},
        {"title": "Next.js Official Tutorial", "url": "https://nextjs.org/learn", "hours": 10},
    ],
    "html": [
        {"title": "HTML & CSS Full Course (freeCodeCamp)", "url": "https://youtu.be/a_iQb1lnAEQ", "hours": 12},
        {"title": "Responsive Web Design (freeCodeCamp)", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "hours": 15},
    ],
    "css": [
        {"title": "CSS – The Complete Guide (Udemy)", "url": "https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/", "hours": 22},
        {"title": "CSS for JavaScript Developers (Josh Comeau)", "url": "https://css-for-js.dev/", "hours": 20},
    ],
    "pandas": [
        {"title": "Data Analysis with Pandas (Kaggle)", "url": "https://www.kaggle.com/learn/pandas", "hours": 6},
        {"title": "Pandas Full Course (freeCodeCamp)", "url": "https://youtu.be/gtjxAH8uaP0", "hours": 5},
    ],
    "numpy": [
        {"title": "NumPy Tutorial (freeCodeCamp)", "url": "https://youtu.be/QUT1VHiLmmI", "hours": 3},
        {"title": "NumPy for Data Science (DataCamp)", "url": "https://www.datacamp.com/courses/introduction-to-numpy", "hours": 4},
    ],
    "data science": [
        {"title": "IBM Data Science Professional Certificate (Coursera)", "url": "https://www.coursera.org/professional-certificates/ibm-data-science", "hours": 80},
        {"title": "Data Science Full Course (freeCodeCamp)", "url": "https://youtu.be/ua-CiDNNj30", "hours": 12},
    ],
    "data engineering": [
        {"title": "Data Engineering Zoomcamp (DataTalks)", "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp", "hours": 60},
        {"title": "Data Engineering on GCP (Coursera)", "url": "https://www.coursera.org/professional-certificates/gcp-data-engineering", "hours": 40},
    ],
    "hadoop": [
        {"title": "Hadoop Complete Guide (Udemy)", "url": "https://www.udemy.com/course/the-ultimate-hands-on-hadoop-tame-your-big-data/", "hours": 15},
    ],
    "airflow": [
        {"title": "Apache Airflow Fundamentals (Astronomer)", "url": "https://academy.astronomer.io/", "hours": 12},
        {"title": "Airflow Tutorial (Marc Lamberti)", "url": "https://youtu.be/AHMm1wfGuR4", "hours": 5},
    ],
    "azure": [
        {"title": "AZ-900 Azure Fundamentals (Microsoft Learn)", "url": "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/", "hours": 20},
        {"title": "Azure Full Course (freeCodeCamp)", "url": "https://youtu.be/NKEFWyqJ5XA", "hours": 11},
    ],
    "gcp": [
        {"title": "GCP Associate Cloud Engineer (A Cloud Guru)", "url": "https://acloudguru.com/course/google-certified-associate-cloud-engineer", "hours": 30},
        {"title": "GCP Fundamentals (Coursera)", "url": "https://www.coursera.org/learn/gcp-fundamentals", "hours": 15},
    ],
    "figma": [
        {"title": "Figma UI Design Tutorial (freeCodeCamp)", "url": "https://youtu.be/jwCmIBJ8Jtc", "hours": 6},
        {"title": "Figma Essentials (Designcode)", "url": "https://designcode.io/figma", "hours": 10},
    ],
    "excel": [
        {"title": "Excel Skills for Business (Coursera)", "url": "https://www.coursera.org/specializations/excel", "hours": 30},
        {"title": "Excel Full Course (freeCodeCamp)", "url": "https://youtu.be/Vl0H-qTclOg", "hours": 6},
    ],
    "graphql": [
        {"title": "GraphQL Full Course (freeCodeCamp)", "url": "https://youtu.be/ed8SzALpx1Q", "hours": 5},
        {"title": "How to GraphQL (Official Tutorial)", "url": "https://www.howtographql.com/", "hours": 8},
    ],
    "firebase": [
        {"title": "Firebase Full Course (freeCodeCamp)", "url": "https://youtu.be/fgdpvwEWJ9M", "hours": 4},
        {"title": "Firebase for Web (Google)", "url": "https://firebase.google.com/docs/web/setup", "hours": 6},
    ],
    "flutter": [
        {"title": "Flutter & Dart Complete Guide (Udemy)", "url": "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/", "hours": 30},
        {"title": "Flutter Official Codelabs", "url": "https://docs.flutter.dev/get-started/codelab", "hours": 10},
    ],
    "react native": [
        {"title": "React Native – Practical Guide (Udemy)", "url": "https://www.udemy.com/course/react-native-the-practical-guide/", "hours": 28},
        {"title": "React Native Express (Free Tutorial)", "url": "http://www.reactnativeexpress.com/", "hours": 12},
    ],
    "swift": [
        {"title": "iOS & Swift – Complete Guide (Udemy)", "url": "https://www.udemy.com/course/ios-13-app-development-bootcamp/", "hours": 55},
        {"title": "Swift Playgrounds (Apple)", "url": "https://developer.apple.com/swift-playgrounds/", "hours": 15},
    ],
    "kotlin": [
        {"title": "Android Kotlin Developer (Udemy)", "url": "https://www.udemy.com/course/android-kotlin-developer/", "hours": 40},
        {"title": "Kotlin Bootcamp (Google)", "url": "https://developer.android.com/courses/kotlin-bootcamp/overview", "hours": 12},
    ],
    "scikit-learn": [
        {"title": "Scikit-Learn Crash Course (freeCodeCamp)", "url": "https://youtu.be/0B5eIE_1vpU", "hours": 3},
        {"title": "Hands-On ML with Scikit-Learn (O'Reilly)", "url": "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/", "hours": 30},
    ],
    "nlp": [
        {"title": "NLP Specialization (Coursera – DeepLearning.AI)", "url": "https://www.coursera.org/specializations/natural-language-processing", "hours": 50},
        {"title": "Hugging Face NLP Course (Free)", "url": "https://huggingface.co/learn/nlp-course", "hours": 15},
    ],
    "computer vision": [
        {"title": "Computer Vision with OpenCV (freeCodeCamp)", "url": "https://youtu.be/oXlwWbU8l2o", "hours": 6},
        {"title": "CS231n Stanford (Free)", "url": "http://cs231n.stanford.edu/", "hours": 40},
    ],
    "redis": [
        {"title": "Redis Crash Course (Traversy Media)", "url": "https://youtu.be/jgpVdJB2sKQ", "hours": 2},
        {"title": "Redis University (Free Courses)", "url": "https://university.redis.com/", "hours": 10},
    ],
    "jenkins": [
        {"title": "Jenkins Full Course (Edureka)", "url": "https://youtu.be/FX322RVNGj4", "hours": 5},
        {"title": "Jenkins Pipeline Tutorial (Udemy)", "url": "https://www.udemy.com/course/learn-devops-ci-cd-with-jenkins-using-pipelines-and-docker/", "hours": 12},
    ],
    "github actions": [
        {"title": "GitHub Actions Tutorial (Fireship)", "url": "https://youtu.be/eB0nUzAI7M8", "hours": 1},
        {"title": "GitHub Actions Docs (Official)", "url": "https://docs.github.com/en/actions/quickstart", "hours": 5},
    ],
    "postgresql": [
        {"title": "PostgreSQL Full Course (Amigoscode)", "url": "https://youtu.be/qw--VYLpxG4", "hours": 4},
        {"title": "PostgreSQL Tutorial (Official Docs)", "url": "https://www.postgresql.org/docs/current/tutorial.html", "hours": 8},
    ],
    "mongodb": [
        {"title": "MongoDB Complete Developer's Guide (Udemy)", "url": "https://www.udemy.com/course/mongodb-the-complete-developers-guide/", "hours": 17},
        {"title": "MongoDB University (Free)", "url": "https://university.mongodb.com/", "hours": 15},
    ],
    "tableau": [
        {"title": "Tableau A-Z (Udemy)", "url": "https://www.udemy.com/course/tableau10/", "hours": 8},
        {"title": "Tableau Public Tutorials (Free)", "url": "https://public.tableau.com/app/resources/learn", "hours": 5},
    ],
    "power bi": [
        {"title": "Power BI Full Course (freeCodeCamp)", "url": "https://youtu.be/3u7MQz1EyPY", "hours": 4},
        {"title": "Microsoft Power BI Learning Path (Free)", "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", "hours": 12},
    ],
    "agile": [
        {"title": "Agile with Atlassian Jira (Coursera)", "url": "https://www.coursera.org/learn/agile-atlassian-jira", "hours": 10},
    ],
    "scrum": [
        {"title": "Scrum Master Certification Prep (Udemy)", "url": "https://www.udemy.com/course/scrum-certification/", "hours": 8},
    ],
}

# --- Forage Virtual Experience Exercises ---
FORAGE_EXERCISES = {
    "Full Stack Engineer": [
        {"title": "JPMorgan Chase Software Engineering", "company": "JPMorgan Chase", "url": "https://www.theforage.com/simulations/jpmorgan-chase/software-engineering-nyqu", "duration": "5-6 hours", "difficulty": "Intermediate", "icon": "code", "color": "from-blue-600 to-blue-800", "description": "Build a real-time stock price data feed interface, fix broken client data, and implement a live graph display."},
        {"title": "Accenture Software Engineering", "company": "Accenture", "url": "https://www.theforage.com/simulations/accenture-nam/software-engineering-hpwg", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "terminal", "color": "from-purple-500 to-purple-700", "description": "Design architecture, debug code, and implement search algorithms for a client project."},
        {"title": "Walmart USA Advanced Software Engineering", "company": "Walmart", "url": "https://www.theforage.com/simulations/walmart/software-engineering-lngd", "duration": "4-5 hours", "difficulty": "Advanced", "icon": "shopping_cart", "color": "from-yellow-500 to-amber-600", "description": "Design a novel data structure, implement a heap data structure, and create UML diagrams."},
        {"title": "Lyft Back-End Engineering", "company": "Lyft", "url": "https://www.theforage.com/simulations/lyft/back-end-engineering-zqwy", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "directions_car", "color": "from-pink-500 to-rose-600", "description": "Design, refactor, and test a system for vehicle fleet management."},
    ],
    "Frontend Developer": [
        {"title": "Skyscanner Front-End Engineering", "company": "Skyscanner", "url": "https://www.theforage.com/simulations/skyscanner/front-end-h9mi", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "flight", "color": "from-sky-500 to-blue-600", "description": "Build a travel date picker component with React and test accessibility compliance."},
        {"title": "Accenture Coding Challenge", "company": "Accenture", "url": "https://www.theforage.com/simulations/accenture-nam/coding-tzfg", "duration": "2-3 hours", "difficulty": "Beginner", "icon": "code", "color": "from-purple-500 to-purple-700", "description": "Solve algorithmic challenges and debug existing frontend code."},
        {"title": "JPMorgan Chase Software Engineering", "company": "JPMorgan Chase", "url": "https://www.theforage.com/simulations/jpmorgan-chase/software-engineering-nyqu", "duration": "5-6 hours", "difficulty": "Intermediate", "icon": "monitoring", "color": "from-blue-600 to-blue-800", "description": "Build a real-time stock price data feed interface with React components."},
    ],
    "Backend Developer": [
        {"title": "Lyft Back-End Engineering", "company": "Lyft", "url": "https://www.theforage.com/simulations/lyft/back-end-engineering-zqwy", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "directions_car", "color": "from-pink-500 to-rose-600", "description": "Design, refactor, and test a system for vehicle fleet management."},
        {"title": "Walmart USA Advanced Software Engineering", "company": "Walmart", "url": "https://www.theforage.com/simulations/walmart/software-engineering-lngd", "duration": "4-5 hours", "difficulty": "Advanced", "icon": "shopping_cart", "color": "from-yellow-500 to-amber-600", "description": "Design data structures, implement heaps, and create system diagrams."},
        {"title": "Goldman Sachs Software Engineering", "company": "Goldman Sachs", "url": "https://www.theforage.com/simulations/goldman-sachs/software-engineering-jyec", "duration": "3-4 hours", "difficulty": "Advanced", "icon": "account_balance", "color": "from-blue-800 to-indigo-900", "description": "Crack leaked password databases by identifying hashing flaws."},
    ],
    "Data Scientist": [
        {"title": "BCG Data Science & Analytics", "company": "BCG", "url": "https://www.theforage.com/simulations/bcg/data-science-ccdz", "duration": "6-8 hours", "difficulty": "Advanced", "icon": "analytics", "color": "from-green-600 to-emerald-700", "description": "Analyze customer churn data, engineer features, and build a predictive model for a PowerCo engagement."},
        {"title": "Quantium Data Analytics", "company": "Quantium", "url": "https://www.theforage.com/simulations/quantium/data-analytics-rqkb", "duration": "5-6 hours", "difficulty": "Intermediate", "icon": "bar_chart", "color": "from-blue-500 to-cyan-600", "description": "Analyze transaction and customer data to provide commercial recommendations."},
        {"title": "Accenture Data Analytics", "company": "Accenture", "url": "https://www.theforage.com/simulations/accenture-nam/data-analytics-mmlb", "duration": "4-5 hours", "difficulty": "Intermediate", "icon": "insights", "color": "from-purple-500 to-purple-700", "description": "Clean, model, analyze data and present findings to stakeholders."},
    ],
    "ML Engineer": [
        {"title": "BCG Data Science & Analytics", "company": "BCG", "url": "https://www.theforage.com/simulations/bcg/data-science-ccdz", "duration": "6-8 hours", "difficulty": "Advanced", "icon": "analytics", "color": "from-green-600 to-emerald-700", "description": "Build a random forest model to predict churn and interpret key features."},
        {"title": "Cognizant Artificial Intelligence", "company": "Cognizant", "url": "https://www.theforage.com/simulations/cognizant/artificial-intelligence-edwx", "duration": "4-5 hours", "difficulty": "Advanced", "icon": "psychology", "color": "from-blue-600 to-indigo-700", "description": "Perform EDA, build and evaluate ML models for a grocery company."},
    ],
    "AI Engineer": [
        {"title": "Cognizant Artificial Intelligence", "company": "Cognizant", "url": "https://www.theforage.com/simulations/cognizant/artificial-intelligence-edwx", "duration": "4-5 hours", "difficulty": "Advanced", "icon": "psychology", "color": "from-blue-600 to-indigo-700", "description": "Perform EDA, strategic planning, build ML models, and create a production ML pipeline."},
        {"title": "BCG Data Science & Analytics", "company": "BCG", "url": "https://www.theforage.com/simulations/bcg/data-science-ccdz", "duration": "6-8 hours", "difficulty": "Advanced", "icon": "analytics", "color": "from-green-600 to-emerald-700", "description": "Build predictive models and present AI-driven insights to executives."},
    ],
    "DevOps Engineer": [
        {"title": "Datacom Software Development", "company": "Datacom", "url": "https://www.theforage.com/simulations/datacom/software-development-qypo", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "cloud_sync", "color": "from-teal-500 to-cyan-600", "description": "Cloud infrastructure, containerization, and deployment automation."},
        {"title": "JPMorgan Chase Software Engineering", "company": "JPMorgan Chase", "url": "https://www.theforage.com/simulations/jpmorgan-chase/software-engineering-nyqu", "duration": "5-6 hours", "difficulty": "Intermediate", "icon": "code", "color": "from-blue-600 to-blue-800", "description": "Set up development environment, manage dependencies, and build CI pipeline."},
    ],
    "Cybersecurity Analyst": [
        {"title": "Mastercard Cybersecurity", "company": "Mastercard", "url": "https://www.theforage.com/simulations/mastercard/cybersecurity-t8ye", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "shield", "color": "from-red-500 to-rose-600", "description": "Identify phishing threats and improve security awareness training."},
        {"title": "AIG Shields Up: Cybersecurity", "company": "AIG", "url": "https://www.theforage.com/simulations/aig/cybersecurity-ku1i", "duration": "2-3 hours", "difficulty": "Beginner", "icon": "security", "color": "from-blue-700 to-indigo-800", "description": "Respond to a zero-day vulnerability and analyze a brute force attack."},
        {"title": "Telstra Cybersecurity", "company": "Telstra", "url": "https://www.theforage.com/simulations/telstra/cybersecurity-cyyo", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "vpn_lock", "color": "from-violet-500 to-purple-600", "description": "Respond to a malware attack, analyze firewall logs, and mitigate the incident."},
    ],
    "Cloud Architect": [
        {"title": "Datacom Software Development", "company": "Datacom", "url": "https://www.theforage.com/simulations/datacom/software-development-qypo", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "cloud", "color": "from-sky-500 to-blue-600", "description": "Cloud resource management and infrastructure planning."},
        {"title": "ANZ Australia Engineering", "company": "ANZ", "url": "https://www.theforage.com/simulations/anz/engineering-gxjn", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "architecture", "color": "from-blue-800 to-indigo-900", "description": "System design, scalability planning, and infrastructure automation."},
    ],
    "Blockchain Developer": [
        {"title": "JPMorgan Chase Software Engineering", "company": "JPMorgan Chase", "url": "https://www.theforage.com/simulations/jpmorgan-chase/software-engineering-nyqu", "duration": "5-6 hours", "difficulty": "Intermediate", "icon": "token", "color": "from-yellow-500 to-amber-600", "description": "Build data-driven interfaces relevant to fintech and blockchain applications."},
    ],
    "Mobile Developer": [
        {"title": "Skyscanner Front-End Engineering", "company": "Skyscanner", "url": "https://www.theforage.com/simulations/skyscanner/front-end-h9mi", "duration": "3-4 hours", "difficulty": "Intermediate", "icon": "smartphone", "color": "from-sky-500 to-blue-600", "description": "Build responsive UI components with accessibility — applicable to mobile."},
    ],
}

# --- Role-specific recommended projects ---
ROLE_PROJECTS = {
    "Full Stack Engineer": [
        {"title": "E-Commerce Platform", "difficulty": "Advanced", "tags": ["React", "Node.js", "PostgreSQL", "Stripe", "Docker"], "description": "Build a full e-commerce store with authentication, product catalog, cart, checkout with Stripe integration, and admin dashboard.", "github_url": "https://github.com/topics/ecommerce-website"},
        {"title": "Real-Time Chat Application", "difficulty": "Intermediate", "tags": ["React", "Socket.io", "Node.js", "MongoDB"], "description": "Create a real-time messaging app with rooms, typing indicators, and message history using WebSockets.", "github_url": "https://github.com/topics/chat-application"},
        {"title": "Project Management Tool", "difficulty": "Advanced", "tags": ["Next.js", "TypeScript", "PostgreSQL", "REST APIs"], "description": "Build a Trello-like kanban board with drag-and-drop, user auth, project collaboration, and real-time updates.", "github_url": "https://github.com/topics/project-management"},
        {"title": "Personal Blog with CMS", "difficulty": "Intermediate", "tags": ["Next.js", "MDX", "Tailwind", "Vercel"], "description": "Create a production-ready blog with markdown editor, categories, SEO, and deployment to Vercel.", "github_url": "https://github.com/topics/blog-platform"},
        {"title": "Social Media Platform", "difficulty": "Advanced", "tags": ["React", "Node.js", "MongoDB", "Redis", "AWS S3"], "description": "Build a mini social network with user profiles, posts, likes, comments, followers, image uploads, and a news feed algorithm.", "github_url": "https://github.com/topics/social-network"},
        {"title": "Job Board Application", "difficulty": "Intermediate", "tags": ["Next.js", "PostgreSQL", "Prisma", "Tailwind"], "description": "Build a job listing platform with employer/candidate roles, resume upload, job search with filters, and application tracking.", "github_url": "https://github.com/topics/job-board"},
    ],
    "Frontend Developer": [
        {"title": "Weather Dashboard", "difficulty": "Beginner", "tags": ["React", "CSS", "API", "Charts.js"], "description": "Build an interactive weather dashboard with 7-day forecasts, location search, and animated weather icons.", "github_url": "https://github.com/topics/weather-app"},
        {"title": "Portfolio Website", "difficulty": "Beginner", "tags": ["HTML", "CSS", "JavaScript", "GSAP"], "description": "Design and build a professional portfolio with animations, project showcase, and contact form.", "github_url": "https://github.com/topics/portfolio-website"},
        {"title": "Social Media Dashboard", "difficulty": "Intermediate", "tags": ["React", "TypeScript", "Tailwind", "Chart.js"], "description": "Build a metrics dashboard with real-time stats, interactive charts, dark mode, and responsive design.", "github_url": "https://github.com/topics/dashboard"},
        {"title": "Music Player UI", "difficulty": "Intermediate", "tags": ["React", "CSS Animations", "Web Audio API"], "description": "Build a Spotify-like music player with playlist management, audio visualizer, and smooth transitions.", "github_url": "https://github.com/topics/music-player"},
        {"title": "Design System Component Library", "difficulty": "Advanced", "tags": ["React", "Storybook", "TypeScript", "CSS"], "description": "Create a reusable UI component library with 20+ components, documentation in Storybook, and npm publishing.", "github_url": "https://github.com/topics/component-library"},
    ],
    "Backend Developer": [
        {"title": "REST API with Auth System", "difficulty": "Intermediate", "tags": ["Python", "FastAPI", "PostgreSQL", "JWT"], "description": "Build a production-ready REST API with JWT authentication, role-based access, rate limiting, and API documentation.", "github_url": "https://github.com/topics/rest-api"},
        {"title": "URL Shortener Service", "difficulty": "Beginner", "tags": ["Node.js", "Redis", "Docker", "Nginx"], "description": "Create a URL shortener with analytics tracking, custom slugs, and rate limiting.", "github_url": "https://github.com/topics/url-shortener"},
        {"title": "Microservices Architecture", "difficulty": "Advanced", "tags": ["Docker", "Kubernetes", "gRPC", "PostgreSQL"], "description": "Design a microservices-based system with service discovery, API gateway, and inter-service communication.", "github_url": "https://github.com/topics/microservices"},
        {"title": "GraphQL API Server", "difficulty": "Intermediate", "tags": ["Node.js", "GraphQL", "Apollo", "PostgreSQL"], "description": "Build a GraphQL API with queries, mutations, subscriptions, dataloader for N+1 prevention, and Playground documentation.", "github_url": "https://github.com/topics/graphql-api"},
        {"title": "Task Queue System", "difficulty": "Advanced", "tags": ["Python", "Celery", "Redis", "Docker"], "description": "Build an async task processing system with priority queues, retries, dead letter handling, and a monitoring dashboard.", "github_url": "https://github.com/topics/task-queue"},
    ],
    "Data Scientist": [
        {"title": "Customer Churn Prediction", "difficulty": "Intermediate", "tags": ["Python", "Pandas", "Scikit-learn", "Matplotlib"], "description": "Analyze telecom customer data, engineer features, and build a classification model to predict churn.", "github_url": "https://github.com/topics/churn-prediction"},
        {"title": "Sentiment Analysis Dashboard", "difficulty": "Intermediate", "tags": ["Python", "NLP", "Streamlit", "NLTK"], "description": "Build a dashboard that analyzes sentiment from Twitter/Reddit data with real-time visualizations.", "github_url": "https://github.com/topics/sentiment-analysis"},
        {"title": "Movie Recommendation System", "difficulty": "Intermediate", "tags": ["Python", "Scikit-learn", "Pandas", "Cosine Similarity"], "description": "Build a content-based and collaborative filtering recommendation engine on 5000+ movies.", "github_url": "https://github.com/topics/recommendation-system"},
        {"title": "A/B Testing Framework", "difficulty": "Advanced", "tags": ["Python", "Statistics", "SQL", "Streamlit"], "description": "Build a statistical A/B testing framework with power analysis, hypothesis testing, and result visualization.", "github_url": "https://github.com/topics/ab-testing"},
        {"title": "Housing Price Predictor", "difficulty": "Beginner", "tags": ["Python", "Pandas", "XGBoost", "Flask"], "description": "Predict housing prices using regression models with feature engineering, cross-validation, and a simple web app for predictions.", "github_url": "https://github.com/topics/house-price-prediction"},
        {"title": "Customer Segmentation Engine", "difficulty": "Intermediate", "tags": ["Python", "K-Means", "PCA", "Plotly"], "description": "Segment e-commerce customers using clustering algorithms, dimensionality reduction, and interactive 3D visualizations.", "github_url": "https://github.com/topics/customer-segmentation"},
    ],
    "ML Engineer": [
        {"title": "Image Classification Pipeline", "difficulty": "Advanced", "tags": ["Python", "PyTorch", "Docker", "FastAPI"], "description": "Train an image classifier, package it with Docker, and serve predictions via a REST API.", "github_url": "https://github.com/topics/image-classification"},
        {"title": "MLOps Pipeline", "difficulty": "Advanced", "tags": ["MLflow", "Docker", "Airflow", "AWS"], "description": "Build an end-to-end ML pipeline with model versioning, automated training, and deployment.", "github_url": "https://github.com/topics/mlops"},
        {"title": "Stock Price Predictor", "difficulty": "Intermediate", "tags": ["Python", "TensorFlow", "LSTM", "yfinance"], "description": "Predict stock prices using LSTM neural networks with historical data.", "github_url": "https://github.com/topics/stock-prediction"},
        {"title": "Model A/B Testing Platform", "difficulty": "Advanced", "tags": ["Python", "FastAPI", "Redis", "Prometheus"], "description": "Build a platform for A/B testing ML models in production with traffic splitting, metric tracking, and automatic rollback.", "github_url": "https://github.com/topics/model-serving"},
        {"title": "AutoML Framework", "difficulty": "Advanced", "tags": ["Python", "Scikit-learn", "Optuna", "Streamlit"], "description": "Build an automated ML pipeline that selects models, tunes hyperparameters, and generates performance reports.", "github_url": "https://github.com/topics/automl"},
    ],
    "AI Engineer": [
        {"title": "AI Chatbot with RAG", "difficulty": "Advanced", "tags": ["LangChain", "ChromaDB", "OpenAI", "FastAPI"], "description": "Build a retrieval-augmented chatbot that answers questions from uploaded documents.", "github_url": "https://github.com/topics/rag"},
        {"title": "Object Detection System", "difficulty": "Advanced", "tags": ["Python", "YOLO", "OpenCV", "Streamlit"], "description": "Build a real-time object detection system using YOLO with a web interface for image/video upload.", "github_url": "https://github.com/topics/object-detection"},
        {"title": "Text Summarizer", "difficulty": "Intermediate", "tags": ["Python", "Transformers", "Hugging Face", "FastAPI"], "description": "Build an abstractive text summarizer using pre-trained transformer models with a web API.", "github_url": "https://github.com/topics/text-summarization"},
        {"title": "AI Code Review Assistant", "difficulty": "Advanced", "tags": ["Python", "LLMs", "FastAPI", "GitHub API"], "description": "Build an AI assistant that reviews code pull requests, detects bugs, suggests improvements, and generates summaries.", "github_url": "https://github.com/topics/code-review"},
        {"title": "Voice Assistant", "difficulty": "Intermediate", "tags": ["Python", "Whisper", "TTS", "FastAPI"], "description": "Build a voice assistant that transcribes speech, processes commands with NLP, and responds with text-to-speech.", "github_url": "https://github.com/topics/voice-assistant"},
    ],
    "DevOps Engineer": [
        {"title": "CI/CD Pipeline Builder", "difficulty": "Intermediate", "tags": ["GitHub Actions", "Docker", "Terraform", "AWS"], "description": "Build automated CI/CD pipelines for a web app with testing, building, and multi-env deployment.", "github_url": "https://github.com/topics/cicd-pipeline"},
        {"title": "Infrastructure as Code", "difficulty": "Advanced", "tags": ["Terraform", "AWS", "Ansible", "Monitoring"], "description": "Provision cloud infrastructure with Terraform, configure with Ansible, and set up monitoring.", "github_url": "https://github.com/topics/infrastructure-as-code"},
        {"title": "Kubernetes Cluster Setup", "difficulty": "Advanced", "tags": ["Kubernetes", "Helm", "Prometheus", "Grafana"], "description": "Deploy a multi-service application on Kubernetes with monitoring, auto-scaling, and logging.", "github_url": "https://github.com/topics/kubernetes-deployment"},
        {"title": "Log Aggregation Platform", "difficulty": "Intermediate", "tags": ["ELK Stack", "Docker", "Filebeat", "Kibana"], "description": "Set up centralized logging with Elasticsearch, Logstash, Kibana, and automated alerting for error patterns.", "github_url": "https://github.com/topics/elk-stack"},
        {"title": "GitOps Workflow", "difficulty": "Advanced", "tags": ["ArgoCD", "Kubernetes", "Helm", "Git"], "description": "Implement GitOps with ArgoCD for automated Kubernetes deployments triggered by Git commits.", "github_url": "https://github.com/topics/gitops"},
    ],
    "Cybersecurity Analyst": [
        {"title": "Network Security Scanner", "difficulty": "Intermediate", "tags": ["Python", "Scapy", "Nmap", "Linux"], "description": "Build a Python-based network scanner that detects open ports, services, and vulnerabilities.", "github_url": "https://github.com/topics/network-scanner"},
        {"title": "Password Manager", "difficulty": "Intermediate", "tags": ["Python", "Encryption", "SQLite", "CLI"], "description": "Build a secure password manager with AES encryption, master password auth, and password generation.", "github_url": "https://github.com/topics/password-manager"},
        {"title": "Log Analyzer & SIEM Dashboard", "difficulty": "Advanced", "tags": ["Python", "ELK Stack", "Linux", "Docker"], "description": "Build a security log analyzer with pattern detection, alerting, and visualization dashboard.", "github_url": "https://github.com/topics/siem"},
        {"title": "Web App Vulnerability Scanner", "difficulty": "Advanced", "tags": ["Python", "Requests", "BeautifulSoup", "OWASP"], "description": "Build an automated scanner that detects XSS, SQL injection, CSRF, and other OWASP Top 10 vulnerabilities.", "github_url": "https://github.com/topics/vulnerability-scanner"},
    ],
    "Cloud Architect": [
        {"title": "Serverless Web App", "difficulty": "Intermediate", "tags": ["AWS Lambda", "API Gateway", "DynamoDB", "S3"], "description": "Build a serverless web application using AWS services with authentication and file storage.", "github_url": "https://github.com/topics/serverless"},
        {"title": "Multi-Cloud Deployment", "difficulty": "Advanced", "tags": ["Terraform", "AWS", "GCP", "Docker"], "description": "Deploy the same application across AWS and GCP using Terraform with load balancing.", "github_url": "https://github.com/topics/multi-cloud"},
        {"title": "Cloud Cost Optimization Tool", "difficulty": "Advanced", "tags": ["Python", "AWS SDK", "React", "PostgreSQL"], "description": "Build a dashboard that analyzes cloud spending, identifies waste, and recommends cost-saving measures.", "github_url": "https://github.com/topics/cloud-cost"},
        {"title": "Disaster Recovery Setup", "difficulty": "Advanced", "tags": ["AWS", "Terraform", "S3", "RDS"], "description": "Design and implement a disaster recovery architecture with automated failover, backup, and recovery testing.", "github_url": "https://github.com/topics/disaster-recovery"},
    ],
    "Blockchain Developer": [
        {"title": "DeFi Token & Exchange", "difficulty": "Advanced", "tags": ["Solidity", "Hardhat", "React", "Ethers.js"], "description": "Create an ERC-20 token and build a decentralized exchange with liquidity pools.", "github_url": "https://github.com/topics/defi"},
        {"title": "NFT Marketplace", "difficulty": "Advanced", "tags": ["Solidity", "IPFS", "React", "Web3.js"], "description": "Build an NFT marketplace where users can mint, list, and trade NFTs.", "github_url": "https://github.com/topics/nft-marketplace"},
        {"title": "Smart Contract Wallet", "difficulty": "Intermediate", "tags": ["Solidity", "Hardhat", "TypeScript"], "description": "Build a multi-sig smart contract wallet with approval workflows.", "github_url": "https://github.com/topics/smart-contracts"},
        {"title": "DAO Governance Platform", "difficulty": "Advanced", "tags": ["Solidity", "React", "The Graph", "IPFS"], "description": "Build a decentralized governance platform with proposal creation, voting, and on-chain execution.", "github_url": "https://github.com/topics/dao"},
    ],
    "Mobile Developer": [
        {"title": "Fitness Tracker App", "difficulty": "Intermediate", "tags": ["React Native", "Firebase", "Charts", "AsyncStorage"], "description": "Build a fitness tracking app with workout logging, progress charts, and goal setting.", "github_url": "https://github.com/topics/fitness-app"},
        {"title": "Food Delivery UI Clone", "difficulty": "Intermediate", "tags": ["React Native", "Maps API", "Firebase"], "description": "Clone a food delivery app UI with restaurant listings, maps, cart, and order tracking.", "github_url": "https://github.com/topics/food-delivery"},
        {"title": "Expense Tracker", "difficulty": "Beginner", "tags": ["React Native", "SQLite", "Charts", "Notifications"], "description": "Build an expense tracking app with categories, budgets, monthly reports, and daily spending alerts.", "github_url": "https://github.com/topics/expense-tracker"},
        {"title": "Social Photo App", "difficulty": "Advanced", "tags": ["React Native", "Firebase", "Camera API", "Cloud Functions"], "description": "Build an Instagram-like photo sharing app with filters, stories, likes, comments, and push notifications.", "github_url": "https://github.com/topics/photo-sharing"},
    ],
    "Data Analyst": [
        {"title": "Sales Analytics Dashboard", "difficulty": "Beginner", "tags": ["Python", "Pandas", "Plotly", "Streamlit"], "description": "Build an interactive sales dashboard analyzing revenue trends, top products, regional performance, and seasonal patterns.", "github_url": "https://github.com/topics/sales-dashboard"},
        {"title": "COVID-19 Data Tracker", "difficulty": "Beginner", "tags": ["Python", "Pandas", "Matplotlib", "Folium"], "description": "Analyze and visualize COVID-19 data with time-series charts, geographic heat maps, and vaccination progress.", "github_url": "https://github.com/topics/covid-19-data"},
        {"title": "Survey Analysis Tool", "difficulty": "Intermediate", "tags": ["Python", "Pandas", "Seaborn", "Excel"], "description": "Build an automated survey analysis pipeline that cleans data, generates cross-tabulations, and creates a PDF report.", "github_url": "https://github.com/topics/survey-analysis"},
        {"title": "Web Scraping & Analysis Pipeline", "difficulty": "Intermediate", "tags": ["Python", "BeautifulSoup", "SQL", "Tableau"], "description": "Scrape job listing data from multiple sources, clean and store in SQL, then build a Tableau dashboard.", "github_url": "https://github.com/topics/web-scraping"},
        {"title": "Financial Report Generator", "difficulty": "Intermediate", "tags": ["Python", "Pandas", "Excel", "Power BI"], "description": "Automate quarterly financial report generation with data aggregation, KPI calculations, and formatted Excel output.", "github_url": "https://github.com/topics/financial-analysis"},
    ],
    "Data Engineer": [
        {"title": "ETL Pipeline with Airflow", "difficulty": "Advanced", "tags": ["Python", "Airflow", "PostgreSQL", "Docker"], "description": "Build an automated ETL pipeline that extracts data from APIs, transforms it, and loads into a data warehouse.", "github_url": "https://github.com/topics/etl-pipeline"},
        {"title": "Real-Time Streaming Pipeline", "difficulty": "Advanced", "tags": ["Kafka", "Spark Streaming", "PostgreSQL", "Docker"], "description": "Build a real-time data streaming pipeline processing 10K+ events/sec with Kafka and Spark.", "github_url": "https://github.com/topics/data-streaming"},
        {"title": "Data Lake on AWS", "difficulty": "Advanced", "tags": ["AWS S3", "Glue", "Athena", "Terraform"], "description": "Design and deploy a data lake architecture on AWS with partitioned storage, schema management, and SQL querying.", "github_url": "https://github.com/topics/data-lake"},
        {"title": "CDC Pipeline", "difficulty": "Intermediate", "tags": ["Debezium", "Kafka", "PostgreSQL", "Docker"], "description": "Implement Change Data Capture to sync database changes in real-time across multiple downstream systems.", "github_url": "https://github.com/topics/change-data-capture"},
        {"title": "Data Quality Framework", "difficulty": "Intermediate", "tags": ["Python", "Great Expectations", "Airflow", "SQL"], "description": "Build a data quality monitoring system with automated validation rules, alerting, and data lineage tracking.", "github_url": "https://github.com/topics/data-quality"},
    ],
    "Site Reliability Engineer": [
        {"title": "Service Health Dashboard", "difficulty": "Intermediate", "tags": ["Go", "Prometheus", "Grafana", "Docker"], "description": "Build a real-time service health monitoring dashboard with SLO tracking, incident alerts, and error budget calculations.", "github_url": "https://github.com/topics/monitoring-dashboard"},
        {"title": "Chaos Engineering Toolkit", "difficulty": "Advanced", "tags": ["Python", "Kubernetes", "Litmus", "Docker"], "description": "Build a chaos engineering framework that injects failures (network, disk, CPU) and measures system resilience.", "github_url": "https://github.com/topics/chaos-engineering"},
        {"title": "Automated Incident Response", "difficulty": "Advanced", "tags": ["Python", "PagerDuty", "Slack API", "Terraform"], "description": "Build an automated incident response system with runbook automation, escalation, and post-mortem generation.", "github_url": "https://github.com/topics/incident-response"},
        {"title": "Load Testing Framework", "difficulty": "Intermediate", "tags": ["Python", "Locust", "Docker", "Grafana"], "description": "Build a load testing framework that simulates thousands of users and generates performance reports.", "github_url": "https://github.com/topics/load-testing"},
    ],
    "QA / Test Automation": [
        {"title": "E2E Test Framework", "difficulty": "Intermediate", "tags": ["Cypress", "JavaScript", "GitHub Actions", "Docker"], "description": "Build a comprehensive end-to-end testing framework with page objects, visual regression, and CI integration.", "github_url": "https://github.com/topics/e2e-testing"},
        {"title": "API Test Suite", "difficulty": "Beginner", "tags": ["Python", "Pytest", "Requests", "Docker"], "description": "Build an automated API test suite with data-driven tests, schema validation, and HTML reports.", "github_url": "https://github.com/topics/api-testing"},
        {"title": "Performance Testing Pipeline", "difficulty": "Intermediate", "tags": ["JMeter", "Grafana", "Docker", "Jenkins"], "description": "Build automated performance tests with JMeter, real-time monitoring in Grafana, and CI/CD integration.", "github_url": "https://github.com/topics/performance-testing"},
        {"title": "Mobile Test Automation", "difficulty": "Advanced", "tags": ["Appium", "Python", "Jenkins", "BrowserStack"], "description": "Build a mobile testing framework for iOS/Android with Appium, parallel execution, and cloud device farms.", "github_url": "https://github.com/topics/appium"},
    ],
    "Game Developer": [
        {"title": "2D Platformer Game", "difficulty": "Intermediate", "tags": ["Unity", "C#", "Sprite Animation", "Physics"], "description": "Build a Mario-style platformer with level design, enemy AI, power-ups, and a scoring system.", "github_url": "https://github.com/topics/platformer-game"},
        {"title": "Multiplayer Card Game", "difficulty": "Advanced", "tags": ["Unity", "C#", "Photon", "UI Design"], "description": "Build an online multiplayer card game (like UNO) with matchmaking, real-time sync, and animations.", "github_url": "https://github.com/topics/card-game"},
        {"title": "3D FPS Shooter", "difficulty": "Advanced", "tags": ["Unreal Engine", "C++", "Blueprints", "Networking"], "description": "Build a first-person shooter with AI enemies, weapon systems, destructible environments, and multiplayer.", "github_url": "https://github.com/topics/fps-game"},
        {"title": "Puzzle Game", "difficulty": "Beginner", "tags": ["Python", "Pygame", "UI Design", "Algorithms"], "description": "Build a puzzle game (Sudoku, 2048, or match-3) with procedural generation and local leaderboard.", "github_url": "https://github.com/topics/puzzle-game"},
    ],
    "Solutions Architect": [
        {"title": "Architecture Decision Records", "difficulty": "Intermediate", "tags": ["Markdown", "Git", "Diagrams", "Documentation"], "description": "Create a comprehensive ADR system with templates, decision tracking, and automated diagram generation.", "github_url": "https://github.com/topics/architecture-decision-records"},
        {"title": "Cloud Migration Planner", "difficulty": "Advanced", "tags": ["Python", "AWS", "Terraform", "React"], "description": "Build a tool that analyzes on-prem infrastructure and generates a cloud migration plan with cost estimates.", "github_url": "https://github.com/topics/cloud-migration"},
        {"title": "System Design Documentation Tool", "difficulty": "Intermediate", "tags": ["React", "Mermaid.js", "Markdown", "Docker"], "description": "Build a visual system design tool with drag-and-drop architecture diagrams and auto-generated documentation.", "github_url": "https://github.com/topics/system-design"},
        {"title": "API Gateway & Service Mesh", "difficulty": "Advanced", "tags": ["Kong", "Istio", "Kubernetes", "Docker"], "description": "Design and implement an API gateway with rate limiting, auth, and a service mesh for microservices communication.", "github_url": "https://github.com/topics/api-gateway"},
    ],
    "Technical Writer": [
        {"title": "Developer Documentation Site", "difficulty": "Beginner", "tags": ["Docusaurus", "Markdown", "React", "Git"], "description": "Build a professional developer documentation site with search, versioning, and API reference pages.", "github_url": "https://github.com/topics/documentation"},
        {"title": "API Documentation Generator", "difficulty": "Intermediate", "tags": ["OpenAPI", "Swagger", "Python", "Redoc"], "description": "Build an automated API documentation system from OpenAPI specs with interactive try-it-out functionality.", "github_url": "https://github.com/topics/api-documentation"},
        {"title": "Technical Blog Platform", "difficulty": "Intermediate", "tags": ["Next.js", "MDX", "Tailwind", "Vercel"], "description": "Build a technical blog with code syntax highlighting, LaTeX rendering, diagram support, and RSS feed.", "github_url": "https://github.com/topics/technical-blog"},
        {"title": "Knowledge Base System", "difficulty": "Intermediate", "tags": ["React", "Algolia", "Markdown", "Node.js"], "description": "Build a searchable knowledge base with categories, full-text search, analytics, and user feedback.", "github_url": "https://github.com/topics/knowledge-base"},
    ],
    "Product Manager": [
        {"title": "Feature Prioritization Tool", "difficulty": "Intermediate", "tags": ["React", "Node.js", "PostgreSQL", "D3.js"], "description": "Build a RICE/MoSCoW prioritization tool with scoring matrices, stakeholder voting, and roadmap visualization.", "github_url": "https://github.com/topics/product-management"},
        {"title": "User Feedback Analytics", "difficulty": "Intermediate", "tags": ["Python", "NLP", "Streamlit", "SQL"], "description": "Build a tool that collects user feedback, categorizes it with NLP, and generates actionable insights.", "github_url": "https://github.com/topics/user-feedback"},
        {"title": "OKR Tracking Dashboard", "difficulty": "Intermediate", "tags": ["React", "Node.js", "PostgreSQL", "Chart.js"], "description": "Build an OKR tracking tool with goal setting, progress visualization, team alignment, and weekly check-ins.", "github_url": "https://github.com/topics/okr"},
        {"title": "Competitive Analysis Dashboard", "difficulty": "Beginner", "tags": ["Python", "BeautifulSoup", "Pandas", "Streamlit"], "description": "Build a competitive intelligence dashboard that tracks competitor features, pricing, and market positioning.", "github_url": "https://github.com/topics/competitive-analysis"},
    ],
    "UX Designer": [
        {"title": "Design System in Figma + Code", "difficulty": "Intermediate", "tags": ["Figma", "React", "CSS", "Storybook"], "description": "Design a complete design system in Figma, then implement it as a React component library with Storybook docs.", "github_url": "https://github.com/topics/design-system"},
        {"title": "Usability Testing Platform", "difficulty": "Intermediate", "tags": ["React", "Node.js", "Recording API", "Firebase"], "description": "Build a usability testing platform with task recording, heat maps, and automated UX metric calculations.", "github_url": "https://github.com/topics/usability-testing"},
        {"title": "Accessibility Audit Tool", "difficulty": "Intermediate", "tags": ["JavaScript", "Axe-core", "React", "Node.js"], "description": "Build an accessibility checker that scans web pages for WCAG compliance and generates fix recommendations.", "github_url": "https://github.com/topics/accessibility"},
        {"title": "Interactive Prototype Builder", "difficulty": "Advanced", "tags": ["React", "Canvas API", "TypeScript", "IndexedDB"], "description": "Build a browser-based prototype builder with clickable hotspots, screen transitions, and sharing.", "github_url": "https://github.com/topics/prototype"},
    ],
    "Platform Engineer": [
        {"title": "Internal Developer Platform", "difficulty": "Advanced", "tags": ["Backstage", "Kubernetes", "Terraform", "React"], "description": "Build an IDP with service catalog, environment provisioning, and developer self-service workflows.", "github_url": "https://github.com/topics/developer-platform"},
        {"title": "Self-Service CI/CD", "difficulty": "Advanced", "tags": ["ArgoCD", "Kubernetes", "GitHub Actions", "Helm"], "description": "Build a self-service CI/CD platform where teams can deploy apps without DevOps help, with guardrails.", "github_url": "https://github.com/topics/platform-engineering"},
        {"title": "Container Registry", "difficulty": "Intermediate", "tags": ["Docker", "Harbor", "Terraform", "Kubernetes"], "description": "Deploy and manage a private container registry with vulnerability scanning and image signing.", "github_url": "https://github.com/topics/container-registry"},
        {"title": "Secrets Management System", "difficulty": "Intermediate", "tags": ["HashiCorp Vault", "Kubernetes", "Terraform", "Python"], "description": "Deploy and integrate a secrets management system with automatic rotation and audit logging.", "github_url": "https://github.com/topics/secrets-management"},
    ],
    "Embedded Systems Engineer": [
        {"title": "IoT Weather Station", "difficulty": "Beginner", "tags": ["Arduino", "C++", "MQTT", "Node.js"], "description": "Build a weather station with temperature, humidity, and pressure sensors that publishes data to a web dashboard.", "github_url": "https://github.com/topics/iot-weather"},
        {"title": "Smart Home Controller", "difficulty": "Intermediate", "tags": ["Raspberry Pi", "Python", "MQTT", "React"], "description": "Build a smart home system controlling lights, fans, and sensors with a mobile-friendly web interface.", "github_url": "https://github.com/topics/smart-home"},
        {"title": "RTOS Task Scheduler", "difficulty": "Advanced", "tags": ["C", "FreeRTOS", "ARM", "Debugging"], "description": "Implement a real-time task scheduler on an ARM microcontroller with priority-based scheduling and interrupt handling.", "github_url": "https://github.com/topics/rtos"},
        {"title": "GPS Tracker Device", "difficulty": "Intermediate", "tags": ["Arduino", "GPS Module", "GSM", "Google Maps"], "description": "Build a GPS tracker that logs location data and displays routes on Google Maps via a web interface.", "github_url": "https://github.com/topics/gps-tracker"},
    ],
    "NLP Engineer": [
        {"title": "Named Entity Recognition System", "difficulty": "Intermediate", "tags": ["Python", "spaCy", "Transformers", "FastAPI"], "description": "Build a custom NER system that extracts entities from text with a web API and confidence scores.", "github_url": "https://github.com/topics/named-entity-recognition"},
        {"title": "Document Q&A System", "difficulty": "Advanced", "tags": ["LangChain", "FAISS", "Transformers", "Streamlit"], "description": "Build a document question-answering system that indexes PDFs and answers questions using semantic search.", "github_url": "https://github.com/topics/question-answering"},
        {"title": "Language Translation API", "difficulty": "Intermediate", "tags": ["Python", "MarianMT", "FastAPI", "Docker"], "description": "Build a multi-language translation service using open-source transformer models with batch processing.", "github_url": "https://github.com/topics/machine-translation"},
        {"title": "Text Classification Pipeline", "difficulty": "Beginner", "tags": ["Python", "Scikit-learn", "BERT", "Flask"], "description": "Build a text classification system for spam detection, topic categorization, and intent recognition.", "github_url": "https://github.com/topics/text-classification"},
        {"title": "Chatbot with Intent Recognition", "difficulty": "Intermediate", "tags": ["Rasa", "Python", "NLU", "Docker"], "description": "Build an intelligent chatbot with intent recognition, entity extraction, and multi-turn conversation management.", "github_url": "https://github.com/topics/chatbot"},
    ],
    "Computer Vision Engineer": [
        {"title": "Face Recognition System", "difficulty": "Intermediate", "tags": ["Python", "OpenCV", "dlib", "Flask"], "description": "Build a face recognition system with enrollment, verification, and real-time webcam detection.", "github_url": "https://github.com/topics/face-recognition"},
        {"title": "Autonomous Lane Detection", "difficulty": "Advanced", "tags": ["Python", "OpenCV", "Deep Learning", "CARLA"], "description": "Build a lane detection system for autonomous driving using computer vision and deep learning on the CARLA simulator.", "github_url": "https://github.com/topics/lane-detection"},
        {"title": "Medical Image Segmentation", "difficulty": "Advanced", "tags": ["Python", "PyTorch", "U-Net", "DICOM"], "description": "Build a medical image segmentation model (X-ray/CT) using U-Net architecture with evaluation metrics.", "github_url": "https://github.com/topics/medical-imaging"},
        {"title": "Document OCR Pipeline", "difficulty": "Intermediate", "tags": ["Python", "Tesseract", "OpenCV", "FastAPI"], "description": "Build an OCR pipeline that extracts text from scanned documents with pre-processing and layout analysis.", "github_url": "https://github.com/topics/ocr"},
        {"title": "Pose Estimation App", "difficulty": "Intermediate", "tags": ["Python", "MediaPipe", "OpenCV", "Streamlit"], "description": "Build a real-time human pose estimation app for fitness tracking with rep counting and form correction.", "github_url": "https://github.com/topics/pose-estimation"},
    ],
    "Database Administrator": [
        {"title": "Database Performance Monitor", "difficulty": "Intermediate", "tags": ["Python", "PostgreSQL", "Grafana", "Docker"], "description": "Build a monitoring tool that tracks query performance, identifies slow queries, and suggests index optimizations.", "github_url": "https://github.com/topics/database-monitoring"},
        {"title": "Automated Backup System", "difficulty": "Intermediate", "tags": ["Bash", "PostgreSQL", "AWS S3", "Cron"], "description": "Build an automated database backup system with encryption, compression, S3 upload, and restoration testing.", "github_url": "https://github.com/topics/database-backup"},
        {"title": "Schema Migration Tool", "difficulty": "Advanced", "tags": ["Python", "Alembic", "PostgreSQL", "Docker"], "description": "Build a database schema migration tool with rollback support, dry-run mode, and migration dependency tracking.", "github_url": "https://github.com/topics/database-migration"},
        {"title": "Database Comparison Tool", "difficulty": "Intermediate", "tags": ["Python", "SQL", "React", "PostgreSQL"], "description": "Build a tool that compares schemas across environments, detects drift, and generates sync scripts.", "github_url": "https://github.com/topics/database-tools"},
    ],
    "Security Engineer": [
        {"title": "SAST/DAST Scanner", "difficulty": "Advanced", "tags": ["Python", "Docker", "OWASP", "GitHub Actions"], "description": "Build a security scanning pipeline that performs static and dynamic analysis of code and running applications.", "github_url": "https://github.com/topics/security-scanning"},
        {"title": "Identity & Access Management", "difficulty": "Advanced", "tags": ["Keycloak", "OAuth2", "Docker", "React"], "description": "Deploy and customize an IAM solution with SSO, MFA, role-based access, and audit logging.", "github_url": "https://github.com/topics/iam"},
        {"title": "Container Security Platform", "difficulty": "Advanced", "tags": ["Trivy", "Docker", "Kubernetes", "Python"], "description": "Build a container security platform that scans images for vulnerabilities and enforces security policies.", "github_url": "https://github.com/topics/container-security"},
        {"title": "Encryption Key Management", "difficulty": "Intermediate", "tags": ["Python", "Cryptography", "REST API", "Docker"], "description": "Build a key management service with key rotation, envelope encryption, and audit trails.", "github_url": "https://github.com/topics/key-management"},
        {"title": "Phishing Detection System", "difficulty": "Intermediate", "tags": ["Python", "ML", "Flask", "Email Parsing"], "description": "Build a system that analyzes emails for phishing indicators using ML classification and URL analysis.", "github_url": "https://github.com/topics/phishing-detection"},
    ],
}

@app.get("/api/simulation/{user_id}")
def get_simulation_exercises(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT known_skills, extracted_cv_skills FROM user_profiles WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            return {"status": "error", "message": "Profile not found"}

        # Get the selected role from localStorage (passed as query param)
        selected_role = None

        # Find best matching role based on skills
        known_skills = row[0] or []
        extracted_cv_skills = row[1] or []
        user_skills_lower = set(s.lower() for s in known_skills + extracted_cv_skills)

        best_role = None
        best_match = -1
        for role_name, meta in ROLE_CATALOG.items():
            matched = sum(1 for s in meta["skills"] if s in user_skills_lower)
            if matched > best_match:
                best_match = matched
                best_role = role_name

        exercises = FORAGE_EXERCISES.get(best_role, FORAGE_EXERCISES.get("Full Stack Engineer", []))

        return {"status": "success", "target_role": best_role, "exercises": exercises}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

@app.get("/api/projects/{user_id}")
def get_project_recommendations(user_id: int, role: str = None):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT known_skills, extracted_cv_skills FROM user_profiles WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            return {"status": "error", "message": "Profile not found"}

        known_skills = row[0] or []
        extracted_cv_skills = row[1] or []
        user_skills_lower = set(s.lower() for s in known_skills + extracted_cv_skills)

        # Use selected role if valid, otherwise find best match
        if role and role in ROLE_CATALOG:
            best_role = role
        else:
            best_role = None
            best_match = -1
            for role_name, meta in ROLE_CATALOG.items():
                matched = sum(1 for s in meta["skills"] if s in user_skills_lower)
                if matched > best_match:
                    best_match = matched
                    best_role = role_name

        projects = ROLE_PROJECTS.get(best_role, ROLE_PROJECTS.get("Full Stack Engineer", []))

        return {"status": "success", "target_role": best_role, "projects": projects}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

# --- Project Upload & Verification ---
import zipfile
import io
import os

LANGUAGE_EXTENSIONS = {
    ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript", ".tsx": "TypeScript (React)",
    ".jsx": "JavaScript (React)", ".java": "Java", ".cpp": "C++", ".c": "C", ".cs": "C#",
    ".go": "Go", ".rs": "Rust", ".rb": "Ruby", ".php": "PHP", ".swift": "Swift",
    ".kt": "Kotlin", ".sol": "Solidity", ".html": "HTML", ".css": "CSS", ".scss": "SCSS",
    ".sql": "SQL", ".sh": "Shell", ".yml": "YAML", ".yaml": "YAML", ".json": "JSON",
    ".md": "Markdown", ".r": "R", ".ipynb": "Jupyter Notebook",
}

@app.post("/api/projects/upload/{user_id}")
async def upload_project(user_id: int, file: UploadFile = File(...)):
    try:
        contents = await file.read()

        if not file.filename.endswith(".zip"):
            return {"status": "error", "message": "Please upload a .zip file"}

        if len(contents) > 50 * 1024 * 1024:  # 50 MB limit
            return {"status": "error", "message": "File too large. Max 50 MB."}

        zf = zipfile.ZipFile(io.BytesIO(contents))
        file_list = zf.namelist()

        # Analyze project structure
        total_files = len([f for f in file_list if not f.endswith("/")])
        total_dirs = len([f for f in file_list if f.endswith("/")])

        # Detect languages
        detected_languages = set()
        file_type_counts = {}
        for f in file_list:
            ext = os.path.splitext(f)[1].lower()
            if ext in LANGUAGE_EXTENSIONS:
                lang = LANGUAGE_EXTENSIONS[ext]
                detected_languages.add(lang)
                file_type_counts[lang] = file_type_counts.get(lang, 0) + 1

        # Quality checklist
        has_readme = any(f.lower().endswith("readme.md") or f.lower() == "readme" for f in file_list)
        has_gitignore = any(f.endswith(".gitignore") for f in file_list)
        has_package_json = any(f.endswith("package.json") for f in file_list)
        has_requirements = any(f.endswith("requirements.txt") or f.endswith("Pipfile") or f.endswith("pyproject.toml") for f in file_list)
        has_dockerfile = any(f.lower().endswith("dockerfile") or f.lower().endswith("docker-compose.yml") for f in file_list)
        has_tests = any("test" in f.lower() or "spec" in f.lower() for f in file_list)
        has_ci = any(".github/workflows" in f or "Jenkinsfile" in f or ".gitlab-ci.yml" in f for f in file_list)
        has_license = any(f.lower() == "license" or f.lower() == "license.md" or f.lower() == "license.txt" for f in file_list)
        has_env_example = any(f.endswith(".env.example") or f.endswith(".env.sample") for f in file_list)

        # Calculate quality score
        checklist = [
            {"name": "README.md", "passed": has_readme, "weight": 20, "tip": "Add a README.md with project overview, setup instructions, and screenshots."},
            {"name": "Dependency Management", "passed": has_package_json or has_requirements, "weight": 15, "tip": "Include package.json or requirements.txt for reproducible builds."},
            {"name": "Tests", "passed": has_tests, "weight": 20, "tip": "Add unit/integration tests to demonstrate code quality."},
            {"name": ".gitignore", "passed": has_gitignore, "weight": 5, "tip": "Add a .gitignore to exclude node_modules, __pycache__, etc."},
            {"name": "Docker Support", "passed": has_dockerfile, "weight": 10, "tip": "Add Dockerfile for containerized deployment."},
            {"name": "CI/CD Pipeline", "passed": has_ci, "weight": 10, "tip": "Add GitHub Actions or CI config for automated testing."},
            {"name": "License", "passed": has_license, "weight": 5, "tip": "Add a LICENSE file (MIT, Apache 2.0, etc.)."},
            {"name": "Environment Config", "passed": has_env_example, "weight": 5, "tip": "Add .env.example to document required environment variables."},
            {"name": "File Organization", "passed": total_dirs >= 2, "weight": 10, "tip": "Organize code into directories (src/, tests/, docs/, etc.)."},
        ]

        quality_score = sum(c["weight"] for c in checklist if c["passed"])

        # Grade
        if quality_score >= 85:
            grade = "A"
        elif quality_score >= 70:
            grade = "B"
        elif quality_score >= 55:
            grade = "C"
        elif quality_score >= 40:
            grade = "D"
        else:
            grade = "F"

        return {
            "status": "success",
            "filename": file.filename,
            "total_files": total_files,
            "total_dirs": total_dirs,
            "detected_languages": sorted(detected_languages),
            "file_type_counts": file_type_counts,
            "quality_score": quality_score,
            "grade": grade,
            "checklist": checklist,
        }
    except zipfile.BadZipFile:
        return {"status": "error", "message": "Invalid ZIP file. Please upload a valid .zip archive."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- Job Matching with Platform Links ---
JOB_PLATFORMS = [
    {
        "platform": "LinkedIn Jobs",
        "logo": "🔗",
        "base_url": "https://www.linkedin.com/jobs/search/",
        "color": "from-blue-600 to-blue-800",
        "description": "World's largest professional network with millions of job postings.",
    },
    {
        "platform": "Indeed",
        "logo": "📋",
        "base_url": "https://www.indeed.com/jobs",
        "color": "from-indigo-500 to-blue-600",
        "description": "Largest job search engine with aggregated listings worldwide.",
    },
    {
        "platform": "Glassdoor",
        "logo": "🏢",
        "base_url": "https://www.glassdoor.co.in/Job/",
        "color": "from-green-500 to-emerald-600",
        "description": "Job listings with company reviews, salaries, and interview insights.",
    },
    {
        "platform": "Naukri.com",
        "logo": "💼",
        "base_url": "https://www.naukri.com/",
        "color": "from-blue-500 to-cyan-600",
        "description": "India's #1 job portal with lakhs of tech job listings.",
    },
    {
        "platform": "Internshala",
        "logo": "🎓",
        "base_url": "https://internshala.com/internships/",
        "color": "from-sky-400 to-blue-500",
        "description": "India's largest internship platform. Great for freshers and students.",
    },
    {
        "platform": "Wellfound (AngelList)",
        "logo": "🚀",
        "base_url": "https://wellfound.com/role/l/",
        "color": "from-slate-600 to-gray-700",
        "description": "Startup jobs — apply directly to founders. Equity and remote roles available.",
    },
]

@app.get("/api/jobs/{user_id}")
def get_job_matches(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT known_skills, extracted_cv_skills FROM user_profiles WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            return {"status": "error", "message": "Profile not found"}

        known_skills = row[0] or []
        extracted_cv_skills = row[1] or []
        user_skills_lower = set(s.lower() for s in known_skills + extracted_cv_skills)

        # Find best matching role
        best_role = "Software Engineer"
        best_match = -1
        for role_name, meta in ROLE_CATALOG.items():
            matched = sum(1 for s in meta["skills"] if s in user_skills_lower)
            if matched > best_match:
                best_match = matched
                best_role = role_name

        # Build search URLs for each platform
        role_query = best_role.replace(" ", "+").replace("/", "%2F")
        skills_query = "+".join(list(user_skills_lower)[:5])

        job_links = []
        for platform in JOB_PLATFORMS:
            if platform["platform"] == "LinkedIn Jobs":
                url = f"{platform['base_url']}?keywords={role_query}&location=India&f_TPR=r604800"
            elif platform["platform"] == "Indeed":
                url = f"{platform['base_url']}?q={role_query}&l=India&fromage=7"
            elif platform["platform"] == "Glassdoor":
                url = f"{platform['base_url']}?sc.keyword={role_query}"
            elif platform["platform"] == "Naukri.com":
                url = f"{platform['base_url']}{role_query.replace('+', '-').lower()}-jobs"
            elif platform["platform"] == "Internshala":
                url = f"{platform['base_url']}{role_query.replace('+', '-').lower()}-internship"
            elif platform["platform"] == "Wellfound (AngelList)":
                url = f"{platform['base_url']}{role_query.replace('+', '-').lower()}/india"
            else:
                url = platform["base_url"]

            job_links.append({
                "platform": platform["platform"],
                "logo": platform["logo"],
                "url": url,
                "color": platform["color"],
                "description": platform["description"],
                "search_query": best_role,
            })

        return {
            "status": "success",
            "target_role": best_role,
            "user_skills": sorted([s.title() if s not in ["aws", "gcp", "sql", "nlp", "ci/cd"] else s.upper() for s in list(user_skills_lower)[:10]]),
            "job_links": job_links,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

# --- Role-specific master certifications ---
ROLE_CERTIFICATIONS = {
    "Full Stack Engineer": [
        {"name": "Meta Front-End Developer Professional Certificate", "provider": "Coursera / Meta", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer"},
        {"name": "Meta Back-End Developer Professional Certificate", "provider": "Coursera / Meta", "url": "https://www.coursera.org/professional-certificates/meta-back-end-developer"},
        {"name": "AWS Certified Developer – Associate", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-developer-associate/"},
    ],
    "Frontend Developer": [
        {"name": "Meta Front-End Developer Professional Certificate", "provider": "Coursera / Meta", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer"},
        {"name": "Google UX Design Professional Certificate", "provider": "Coursera / Google", "url": "https://www.coursera.org/professional-certificates/google-ux-design"},
    ],
    "Backend Developer": [
        {"name": "Meta Back-End Developer Professional Certificate", "provider": "Coursera / Meta", "url": "https://www.coursera.org/professional-certificates/meta-back-end-developer"},
        {"name": "AWS Certified Developer – Associate", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-developer-associate/"},
    ],
    "Data Scientist": [
        {"name": "IBM Data Science Professional Certificate", "provider": "Coursera / IBM", "url": "https://www.coursera.org/professional-certificates/ibm-data-science"},
        {"name": "Google Data Analytics Professional Certificate", "provider": "Coursera / Google", "url": "https://www.coursera.org/professional-certificates/google-data-analytics"},
        {"name": "TensorFlow Developer Certificate", "provider": "Google / TensorFlow", "url": "https://www.tensorflow.org/certificate"},
    ],
    "ML Engineer": [
        {"name": "Google Machine Learning Engineer Certificate", "provider": "Google Cloud", "url": "https://cloud.google.com/learn/certification/machine-learning-engineer"},
        {"name": "TensorFlow Developer Certificate", "provider": "Google / TensorFlow", "url": "https://www.tensorflow.org/certificate"},
        {"name": "AWS Machine Learning Specialty", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-machine-learning-specialty/"},
    ],
    "AI Engineer": [
        {"name": "Google Machine Learning Engineer Certificate", "provider": "Google Cloud", "url": "https://cloud.google.com/learn/certification/machine-learning-engineer"},
        {"name": "Deep Learning Specialization Certificate", "provider": "Coursera / DeepLearning.AI", "url": "https://www.coursera.org/specializations/deep-learning"},
    ],
    "DevOps Engineer": [
        {"name": "AWS Certified DevOps Engineer – Professional", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-devops-engineer-professional/"},
        {"name": "CKA: Certified Kubernetes Administrator", "provider": "CNCF", "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/"},
        {"name": "HashiCorp Terraform Associate", "provider": "HashiCorp", "url": "https://www.hashicorp.com/certification/terraform-associate"},
    ],
    "Blockchain Developer": [
        {"name": "Certified Blockchain Developer (CBD)", "provider": "Blockchain Council", "url": "https://www.blockchain-council.org/certifications/certified-blockchain-developer/"},
        {"name": "Ethereum Developer Certification", "provider": "ConsenSys Academy", "url": "https://consensys.net/academy/"},
        {"name": "Chainlink Developer Expert", "provider": "Chainlink", "url": "https://chain.link/education/developer-expert"},
    ],
    "Cloud Architect": [
        {"name": "AWS Certified Solutions Architect – Professional", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-solutions-architect-professional/"},
        {"name": "Google Cloud Professional Cloud Architect", "provider": "Google Cloud", "url": "https://cloud.google.com/learn/certification/cloud-architect"},
        {"name": "CKA: Certified Kubernetes Administrator", "provider": "CNCF", "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/"},
    ],
    "Cybersecurity Analyst": [
        {"name": "CompTIA Security+", "provider": "CompTIA", "url": "https://www.comptia.org/certifications/security"},
        {"name": "CEH: Certified Ethical Hacker", "provider": "EC-Council", "url": "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/"},
        {"name": "Google Cybersecurity Professional Certificate", "provider": "Coursera / Google", "url": "https://www.coursera.org/professional-certificates/google-cybersecurity"},
    ],
}

@app.get("/api/roadmap/{user_id}")
def get_roadmap(user_id: int, role: str = None):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT known_skills, extracted_cv_skills, learning_hours_per_week, target_salary
            FROM user_profiles WHERE id = %s
        """, (user_id,))
        row = cur.fetchone()

        if not row:
            return {"status": "error", "message": "Profile not found"}

        known_skills = row[0] or []
        extracted_cv_skills = row[1] or []
        learning_hours = row[2] or 10
        target_salary = row[3] or 0
        user_skills_lower = set(s.lower() for s in known_skills + extracted_cv_skills)

        # Use selected role if provided and valid, otherwise find best match
        if role and role in ROLE_CATALOG:
            best_role = role
        else:
            best_role = None
            best_match = -1
            for role_name, meta in ROLE_CATALOG.items():
                required = meta["skills"]
                matched = sum(1 for s in required if s in user_skills_lower)
                pct = round((matched / max(len(required), 1)) * 100)
                if pct > best_match:
                    best_match = pct
                    best_role = role_name

        role_meta = ROLE_CATALOG[best_role]
        required_skills = role_meta["skills"]
        missing_skills = [s for s in required_skills if s not in user_skills_lower]

        # Build learning phases from missing skills
        phases = []
        phase_names = ["Foundations", "Core Competencies", "Advanced Skills", "Specialization", "Mastery"]
        skills_per_phase = max(1, len(missing_skills) // min(len(phase_names), max(1, len(missing_skills))))

        for i in range(0, len(missing_skills), skills_per_phase):
            phase_idx = min(len(phases), len(phase_names) - 1)
            chunk = missing_skills[i:i + skills_per_phase]
            phase_hours = sum(SKILL_META.get(s, {"hours": 20})["hours"] for s in chunk)
            phase_weeks = max(1, round(phase_hours / max(learning_hours, 1)))

            skill_items = []
            for s in chunk:
                display = s.upper() if s in ["aws", "gcp", "sql", "nlp", "ci/cd"] else s.title()
                meta = SKILL_META.get(s, {"hours": 20, "weight": 0.50})
                courses = SKILL_COURSES.get(s, [{"title": f"Learn {display} (Google Search)", "url": f"https://www.google.com/search?q=learn+{s.replace(' ', '+')}", "hours": meta["hours"]}])
                skill_items.append({
                    "name": display,
                    "hours": meta["hours"],
                    "courses": courses,
                })

            phases.append({
                "phase": phase_idx + 1,
                "title": phase_names[phase_idx],
                "skills": skill_items,
                "total_hours": phase_hours,
                "weeks": phase_weeks,
                "status": "locked",
            })

        # Mark first phase as active
        if phases:
            phases[0]["status"] = "active"

        # Total timeline before padding
        total_hours = sum(p["total_hours"] for p in phases)
        total_weeks = max(1, round(total_hours / max(learning_hours, 1)))

        # --- Ensure minimum 52 weeks by adding supplementary learning phases ---
        SUPPLEMENTARY_PHASES = [
            {
                "title": "Soft Skills & Communication",
                "skills": [
                    {"name": "Technical Communication", "hours": 30, "courses": [
                        {"title": "Business Writing (Coursera)", "url": "https://www.coursera.org/learn/writing-for-business", "hours": 10},
                        {"title": "Technical Writing (Google)", "url": "https://developers.google.com/tech-writing", "hours": 8},
                        {"title": "Presentation Skills (Udemy)", "url": "https://www.udemy.com/course/the-complete-presentation-and-public-speaking-course/", "hours": 12},
                    ]},
                    {"name": "Leadership & Collaboration", "hours": 25, "courses": [
                        {"title": "Teamwork Skills (Coursera)", "url": "https://www.coursera.org/learn/teamwork-skills", "hours": 10},
                        {"title": "Emotional Intelligence (LinkedIn Learning)", "url": "https://www.linkedin.com/learning/developing-your-emotional-intelligence", "hours": 5},
                        {"title": "Conflict Resolution (Coursera)", "url": "https://www.coursera.org/learn/conflict-resolution", "hours": 10},
                    ]},
                ],
            },
            {
                "title": "Portfolio & Personal Branding",
                "skills": [
                    {"name": "Portfolio Website", "hours": 30, "courses": [
                        {"title": "Build a Dev Portfolio (freeCodeCamp)", "url": "https://youtu.be/oC81zZ4lR_M", "hours": 3},
                        {"title": "GitHub Profile README Guide", "url": "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme", "hours": 2},
                        {"title": "Personal Branding for Developers (Udemy)", "url": "https://www.udemy.com/course/personal-branding-for-developers/", "hours": 8},
                        {"title": "Technical Blog Writing (dev.to)", "url": "https://dev.to/about", "hours": 10},
                    ]},
                    {"name": "LinkedIn Optimization", "hours": 15, "courses": [
                        {"title": "LinkedIn for Job Seekers (LinkedIn Learning)", "url": "https://www.linkedin.com/learning/learning-linkedin-for-students", "hours": 5},
                        {"title": "Resume Writing Masterclass (Udemy)", "url": "https://www.udemy.com/course/the-complete-resume-masterclass/", "hours": 10},
                    ]},
                ],
            },
            {
                "title": "Interview Preparation",
                "skills": [
                    {"name": "Data Structures & Algorithms", "hours": 60, "courses": [
                        {"title": "Neetcode 150 (Free)", "url": "https://neetcode.io/practice", "hours": 30},
                        {"title": "LeetCode Top Interview Questions", "url": "https://leetcode.com/studyplan/top-interview-150/", "hours": 30},
                        {"title": "DSA Full Course (Abdul Bari)", "url": "https://youtu.be/0IAPZzGSbME", "hours": 20},
                    ]},
                    {"name": "System Design", "hours": 40, "courses": [
                        {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer", "hours": 20},
                        {"title": "Grokking System Design (Educative)", "url": "https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers", "hours": 20},
                    ]},
                    {"name": "Behavioral Interview Prep", "hours": 20, "courses": [
                        {"title": "STAR Method Guide (Indeed)", "url": "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique", "hours": 5},
                        {"title": "Mock Interview Practice (Pramp)", "url": "https://www.pramp.com/", "hours": 15},
                    ]},
                ],
            },
            {
                "title": "Industry Deep-Dive",
                "skills": [
                    {"name": "Industry Case Studies", "hours": 30, "courses": [
                        {"title": "Engineering Blogs Collection", "url": "https://github.com/kilimchoi/engineering-blogs", "hours": 15},
                        {"title": "Tech Conference Talks (InfoQ)", "url": "https://www.infoq.com/presentations/", "hours": 10},
                        {"title": "Podcast: Software Engineering Daily", "url": "https://softwareengineeringdaily.com/", "hours": 5},
                    ]},
                    {"name": "Trending Technologies", "hours": 25, "courses": [
                        {"title": "State of JS/CSS Survey", "url": "https://stateofjs.com/", "hours": 5},
                        {"title": "ThoughtWorks Tech Radar", "url": "https://www.thoughtworks.com/radar", "hours": 5},
                        {"title": "Hacker News Top Projects", "url": "https://news.ycombinator.com/best", "hours": 15},
                    ]},
                ],
            },
            {
                "title": "Open Source Contribution",
                "skills": [
                    {"name": "Open Source Workflow", "hours": 30, "courses": [
                        {"title": "How to Contribute to Open Source (GitHub Guide)", "url": "https://opensource.guide/how-to-contribute/", "hours": 5},
                        {"title": "First Contributions (Interactive)", "url": "https://github.com/firstcontributions/first-contributions", "hours": 3},
                        {"title": "Good First Issues Finder", "url": "https://goodfirstissues.com/", "hours": 22},
                    ]},
                    {"name": "Community Building", "hours": 20, "courses": [
                        {"title": "Building Developer Communities", "url": "https://www.developermarketing.io/", "hours": 10},
                        {"title": "Speaking at Meetups & Conferences", "url": "https://speaking.io/", "hours": 10},
                    ]},
                ],
            },
        ]

        supp_idx = 0
        while total_weeks < 52 and supp_idx < len(SUPPLEMENTARY_PHASES):
            sp = SUPPLEMENTARY_PHASES[supp_idx]
            phase_hours = sum(sk["hours"] for sk in sp["skills"])
            phase_weeks = max(1, round(phase_hours / max(learning_hours, 1)))

            phases.append({
                "phase": len(phases) + 1,
                "title": sp["title"],
                "skills": sp["skills"],
                "total_hours": phase_hours,
                "weeks": phase_weeks,
                "status": "locked",
            })

            total_hours += phase_hours
            total_weeks = max(1, round(total_hours / max(learning_hours, 1)))
            supp_idx += 1

        # If still under 52 weeks, stretch final phase
        if total_weeks < 52:
            deficit_weeks = 52 - total_weeks
            total_weeks = 52
            if phases:
                phases[-1]["weeks"] += deficit_weeks

        # Get certifications
        certs = ROLE_CERTIFICATIONS.get(best_role, ROLE_CERTIFICATIONS.get("Full Stack Engineer", []))

        return {
            "status": "success",
            "target_role": best_role,
            "salary_range": role_meta["salary"],
            "target_salary": target_salary,
            "total_weeks": total_weeks,
            "total_hours": total_hours,
            "learning_hours_per_week": learning_hours,
            "phases": phases,
            "certifications": certs,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

@app.get("/api/readiness/{user_id}")
def get_readiness(user_id: int, role: str = None):
    """
    Returns the user's overall job readiness score.
    Calculates dynamic scores based on:
    - Skills (matched vs required)
    - AI Mock Interview history
    """
    conn = get_db()
    cursor = conn.cursor()
    try:
        # 1. Calculate Skill Completion Score
        cursor.execute("SELECT known_skills, extracted_cv_skills FROM user_profiles WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        
        skills_score = 0
        target_role = "Software Engineer"
        
        if row:
            known_skills = row[0] or []
            extracted_cv_skills = row[1] or []
            user_skills_lower = set(s.lower() for s in known_skills + extracted_cv_skills)
            
            # Use selected role if provided
            if role and role in ROLE_CATALOG:
                target_role = role
            else:
                best_match = -1
                for role_name, meta in ROLE_CATALOG.items():
                    req = meta["skills"]
                    match = sum(1 for s in req if s in user_skills_lower)
                    pct = round((match / max(len(req), 1)) * 100)
                    if pct > best_match:
                        best_match = pct
                        target_role = role_name
            
            required_skills = ROLE_CATALOG.get(target_role, list(ROLE_CATALOG.values())[0])["skills"]
            matched_skills = [s for s in required_skills if s in user_skills_lower]
            skills_score = round((len(matched_skills) / max(len(required_skills), 1)) * 100)
            
        # 2. Fetch Latest Interview Score
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                target_role VARCHAR(100),
                technical_score INTEGER,
                communication_score INTEGER,
                confidence_score INTEGER,
                overall_grade VARCHAR(5),
                strengths TEXT[],
                weaknesses TEXT[],
                study_topics TEXT[],
                verdict TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute('''
            SELECT technical_score, communication_score, confidence_score 
            FROM interview_history 
            WHERE user_id = %s 
            ORDER BY created_at DESC LIMIT 1
        ''', (user_id,))
        interview_row = cursor.fetchone()
        
        interview_score = 40  # default baseline
        if interview_row:
            # Average out of 10, convert to percentage
            avg_score = sum(interview_row) / 3
            interview_score = round(avg_score * 10)
            
        # 3. Compile dimensions
        dimensions = [
            {"name": "Skills Completion", "score": skills_score, "weight_val": 0.30, "weight": "30%", "icon": "school", "color": "text-primary"},
            {"name": "Projects Built", "score": 60, "weight_val": 0.25, "weight": "25%", "icon": "code", "color": "text-emerald-500"},
            {"name": "Simulations Passed", "score": 80, "weight_val": 0.20, "weight": "20%", "icon": "science", "color": "text-violet-500"},
            {"name": "Portfolio Quality", "score": 75, "weight_val": 0.15, "weight": "15%", "icon": "folder", "color": "text-amber-500"},
            {"name": "Mock Interviews", "score": interview_score, "weight_val": 0.10, "weight": "10%", "icon": "mic", "color": "text-rose-500"},
        ]
        
        final_score = sum(d["score"] * d["weight_val"] for d in dimensions)
        final_score = round(final_score)
        
        return {
            "status": "success",
            "target_role": target_role,
            "final_score": final_score,
            "dimensions": dimensions
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()

@app.get("/api/profile/{user_id}")
def get_profile_dna(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT target_roles, known_skills, extracted_cv_skills,
                   learning_hours_per_week, target_salary,
                   soft_communication, soft_leadership, soft_teamwork,
                   soft_problem_solving, soft_adaptability, soft_time_management,
                   soft_presentation, cv_text, resume_filename
            FROM user_profiles WHERE id = %s
        """, (user_id,))
        row = cur.fetchone()

        if not row:
            return {"status": "error", "message": "Profile not found"}

        target_roles = row[0] or []
        known_skills = row[1] or []
        extracted_cv_skills = row[2] or []
        learning_hours = row[3] or 0
        target_salary = row[4] or 0
        soft = {
            "communication": row[5] or 3,
            "leadership": row[6] or 3,
            "teamwork": row[7] or 3,
            "problem_solving": row[8] or 3,
            "adaptability": row[9] or 3,
            "time_management": row[10] or 3,
            "presentation": row[11] or 3,
        }
        cv_text = row[12] or ""
        resume_filename = row[13] or ""

        # --- Skills Matrix (deduplicated merge) ---
        all_skills = list(set([s for s in known_skills] + [s for s in extracted_cv_skills]))

        # --- Cognitive Profile ---
        cognitive_score = soft["problem_solving"] + soft["adaptability"]
        cognitive = next(a for a in COGNITIVE_ARCHETYPES if cognitive_score >= a["min"])

        # --- Career Trajectory ---
        primary_role = target_roles[0] if target_roles else "Software Engineer"

        # --- Readiness Score ---
        required = ROLE_REQUIRED_SKILLS.get(primary_role, ROLE_REQUIRED_SKILLS.get("Full Stack Engineer", []))
        user_skills_lower = set(s.lower() for s in all_skills)
        matched = sum(1 for s in required if s in user_skills_lower)
        readiness_pct = round((matched / max(len(required), 1)) * 100)
        if readiness_pct < 40:
            readiness_label = "Foundational — significant skill gaps remain. Your personalized roadmap will identify exactly where to focus."
        elif readiness_pct < 70:
            readiness_label = "Progressing — you have a solid base but need targeted upskilling in key areas."
        else:
            readiness_label = "Strong alignment — you're well-positioned for this career path with minor gaps to address."

        # --- Big-5 Personality from soft skills ---
        openness = round(((soft["problem_solving"] + soft["adaptability"]) / 2) * 20)
        conscientiousness = round(((soft["leadership"] + soft["time_management"]) / 2) * 20)
        extraversion = round(((soft["communication"] + soft["presentation"]) / 2) * 20)
        agreeableness = round(((soft["teamwork"] + soft["communication"]) / 2) * 20)
        neuroticism = round(100 - ((soft["adaptability"] + soft["time_management"]) / 2) * 20)

        # --- DNA Summary ---
        top_skills = all_skills[:5] if all_skills else ["N/A"]
        missing_skills = [s.title() for s in required if s not in user_skills_lower][:4]

        summary = (
            f"You demonstrate strong {cognitive['label'].lower()} capabilities "
            f"with proficiency in {', '.join(top_skills[:3])}. "
            f"Your target trajectory as a {primary_role} aligns well with your profile. "
        )
        if missing_skills:
            summary += f"However, your {', '.join(missing_skills)} knowledge needs development before you are fully industry-ready."
        else:
            summary += "Your skill coverage is excellent for this role."

        return {
            "status": "success",
            "profile": {
                "target_roles": target_roles,
                "primary_role": primary_role,
                "target_salary": target_salary,
                "learning_hours": learning_hours,
                "resume_filename": resume_filename,
            },
            "dna": {
                "cognitive_profile": {
                    "label": cognitive["label"],
                    "description": cognitive["desc"],
                    "score": cognitive_score,
                },
                "career_trajectory": {
                    "role": primary_role,
                    "description": f"Based on your skills, interests, and market demand, {primary_role} is your highest-potential career path.",
                },
                "readiness": {
                    "percentage": readiness_pct,
                    "label": readiness_label,
                    "matched_skills": matched,
                    "total_required": len(required),
                },
                "skills_matrix": all_skills,
                "big5": {
                    "openness": openness,
                    "conscientiousness": conscientiousness,
                    "extraversion": extraversion,
                    "agreeableness": agreeableness,
                    "neuroticism": neuroticism,
                },
                "summary": summary,
            },
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()

@app.post("/api/calibration")
async def submit_calibration(
    resume: Optional[UploadFile] = File(None),
    target_roles: str = Form("[]"),
    known_skills: str = Form("[]"),
    target_salary: int = Form(0),
    github_url: str = Form(""),
    learning_hours: int = Form(15),
    soft_communication: int = Form(3),
    soft_leadership: int = Form(3),
    soft_teamwork: int = Form(3),
    soft_problem_solving: int = Form(3),
    soft_adaptability: int = Form(3),
    soft_time_management: int = Form(3),
    soft_presentation: int = Form(3),
    auth_user_id: int = Form(0),
):
    # Save resume file and extract text
    resume_filename = None
    cv_text = ""
    extracted_skills = []

    if resume and resume.filename:
        resume_filename = f"{resume.filename}"
        file_path = os.path.join(UPLOAD_DIR, resume_filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(resume.file, f)
            
        # Extract text if PDF
        if resume_filename.lower().endswith('.pdf'):
            try:
                with open(file_path, 'rb') as pdf_file:
                    reader = PyPDF2.PdfReader(pdf_file)
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            cv_text += extracted + "\n"
                
                # Run the AI model to extract skills
                extracted_skills = extract_skills_from_text(cv_text)
                print(f"Extracted {len(extracted_skills)} skills from '{resume_filename}'")
                
            except Exception as e:
                print(f"Error parsing PDF {resume_filename}: {e}")
                cv_text = f"Error extracting text: {e}"

    # Parse JSON arrays
    roles_list = json.loads(target_roles)
    skills_list = json.loads(known_skills)

    # Insert into PostgreSQL
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO user_profiles (
            resume_filename, target_roles, known_skills, target_salary,
            github_url, learning_hours_per_week,
            soft_communication, soft_leadership, soft_teamwork,
            soft_problem_solving, soft_adaptability, soft_time_management,
            soft_presentation, cv_text, extracted_cv_skills, user_id
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            resume_filename, roles_list, skills_list, target_salary,
            github_url, learning_hours,
            soft_communication, soft_leadership, soft_teamwork,
            soft_problem_solving, soft_adaptability, soft_time_management,
            soft_presentation, cv_text, extracted_skills,
            auth_user_id if auth_user_id > 0 else None
        ),
    )
    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "status": "success",
        "user_id": user_id,
        "message": "Profile saved. Generating your Career OS...",
        "profile": {
            "resume": resume_filename,
            "extracted_skills": extracted_skills,
            "target_roles": roles_list,
            "known_skills": skills_list,
            "target_salary": target_salary,
            "soft_skills": {
                "communication": soft_communication,
                "leadership": soft_leadership,
                "teamwork": soft_teamwork,
                "problem_solving": soft_problem_solving,
                "adaptability": soft_adaptability,
                "time_management": soft_time_management,
                "presentation": soft_presentation,
            },
        },
    }


@app.get("/api/profiles")
def list_profiles():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT 20")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"profiles": rows}


@app.get("/api/profiles/{user_id}")
def get_profile(user_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM user_profiles WHERE id = %s", (user_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row:
        return {"profile": row}
    return {"error": "Profile not found"}, 404


# ==========================================
# MOCK INTERVIEW — WebSocket + Groq AI
# ==========================================

def get_interview_system_prompt(role: str, skills: list) -> str:
    """Generate a role-specific interview system prompt."""
    skill_str = ", ".join(skills[:8]) if skills else "general software engineering"
    return f"""You are a senior technical hiring manager interviewing a candidate for a {role} position.
The role requires expertise in: {skill_str}.

Rules:
- Ask ONE technical interview question at a time, specific to {role}.
- Keep responses under 2 sentences.
- If the candidate's answer lacks depth, ask a challenging follow-up. Do not sugarcoat.
- Start with a brief greeting and your first question.
- Vary question difficulty: start medium, then adapt based on answers.
- Cover: technical knowledge, problem-solving, system design concepts relevant to {role}."""


@app.websocket("/ws/interview/{user_id}")
async def interview_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()

    # Fetch user's target role and skills for personalized interview
    target_role = "Full Stack Engineer"
    role_skills = []
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT target_roles, known_skills, extracted_cv_skills FROM user_profiles WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if row:
            target_roles = row[0] or []
            known_skills = row[1] or []
            cv_skills = row[2] or []
            all_skills = list(set(known_skills + cv_skills))

            if target_roles:
                target_role = target_roles[0]
            else:
                # Find best matching role
                user_skills_lower = set(s.lower() for s in all_skills)
                best_role = None
                best_match = -1
                for role_name, meta in ROLE_CATALOG.items():
                    matched = sum(1 for s in meta["skills"] if s in user_skills_lower)
                    if matched > best_match:
                        best_match = matched
                        best_role = role_name
                if best_role:
                    target_role = best_role

            role_skills = ROLE_CATALOG.get(target_role, {}).get("skills", [])
        cur.close()
        conn.close()
    except Exception:
        pass

    system_prompt = get_interview_system_prompt(target_role, role_skills)
    chat_history = [{"role": "system", "content": system_prompt}]
    turn_count = 0

    # Send initial info to frontend
    await websocket.send_text(json.dumps({
        "type": "init",
        "role": target_role,
        "skills": role_skills[:6],
        "max_turns": INTERVIEW_MAX_TURNS
    }))

    try:
        while True:
            audio_bytes = await websocket.receive_bytes()

            if len(audio_bytes) < 100:
                continue

            turn_count += 1
            await websocket.send_text(json.dumps({
                "type": "status",
                "text": f"Processing answer {turn_count}/{INTERVIEW_MAX_TURNS}..."
            }))

            temp_audio_path = ""
            try:
                # 1. Transcribe audio with Whisper
                with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
                    temp_audio.write(audio_bytes)
                    temp_audio_path = temp_audio.name

                with open(temp_audio_path, "rb") as file:
                    transcription = groq_client.audio.transcriptions.create(
                        file=(temp_audio_path, file.read()),
                        model="whisper-large-v3-turbo"
                    )
                user_text = transcription.text
                os.remove(temp_audio_path)
                temp_audio_path = ""

                if not user_text.strip():
                    turn_count -= 1
                    continue

                # Send candidate transcript
                await websocket.send_text(json.dumps({
                    "type": "transcript",
                    "speaker": "Candidate",
                    "text": user_text,
                    "turn": turn_count
                }))
                chat_history.append({"role": "user", "content": user_text})

                # Force conclusion on last turn
                if turn_count >= INTERVIEW_MAX_TURNS:
                    chat_history.append({
                        "role": "system",
                        "content": "This is the final turn. Thank the candidate briefly and conclude. DO NOT ask any more questions."
                    })

                # 2. Generate AI interviewer response
                completion = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=chat_history,
                    temperature=0.6,
                    max_tokens=150
                )
                ai_text = completion.choices[0].message.content
                chat_history.append({"role": "assistant", "content": ai_text})

                await websocket.send_text(json.dumps({
                    "type": "transcript",
                    "speaker": "Interviewer",
                    "text": ai_text,
                    "turn": turn_count
                }))

                # 3. Generate TTS audio
                tts_audio_path = tempfile.mktemp(suffix=".mp3")
                communicate = edge_tts.Communicate(ai_text, "en-US-AndrewMultilingualNeural")
                await communicate.save(tts_audio_path)

                with open(tts_audio_path, "rb") as audio_file:
                    await websocket.send_bytes(audio_file.read())
                os.remove(tts_audio_path)

                # 4. Generate analysis on final turn
                if turn_count >= INTERVIEW_MAX_TURNS:
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "text": "Interview complete. Generating performance analysis..."
                    }))

                    analysis_prompt = f"""You are a brutally honest senior {target_role} interviewer.
Analyze this interview transcript. Do not sugarcoat.
Output ONLY a strict JSON object with these exact keys:
"technical_score" (int 1-10),
"communication_score" (int 1-10),
"confidence_score" (int 1-10),
"overall_grade" (string: "A+", "A", "B+", "B", "C+", "C", "D", or "F"),
"strengths" (list of 2-4 specific strings),
"critical_weaknesses" (list of 2-4 specific strings — highlight missing knowledge),
"study_topics" (list of 3-5 specific technical topics to study),
"verdict" (one sentence overall assessment)"""

                    analysis_messages = [{"role": "system", "content": analysis_prompt}] + [
                        m for m in chat_history if m["role"] != "system"
                    ]

                    analysis_completion = groq_client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=analysis_messages,
                        response_format={"type": "json_object"}
                    )

                    try:
                        analysis_data = json.loads(analysis_completion.choices[0].message.content)
                    except json.JSONDecodeError:
                        analysis_data = {
                            "technical_score": 5,
                            "communication_score": 5,
                            "confidence_score": 5,
                            "overall_grade": "C",
                            "strengths": ["Completed the interview"],
                            "critical_weaknesses": ["Could not parse analysis"],
                            "study_topics": ["Practice more technical interviews"],
                            "verdict": "Analysis could not be generated. Please try again."
                        }

                    # Store interview result in database
                    try:
                        conn = get_db()
                        cur = conn.cursor()
                        cur.execute("""
                            CREATE TABLE IF NOT EXISTS interview_history (
                                id SERIAL PRIMARY KEY,
                                user_id INTEGER NOT NULL,
                                target_role VARCHAR(100),
                                technical_score INTEGER,
                                communication_score INTEGER,
                                confidence_score INTEGER,
                                overall_grade VARCHAR(5),
                                strengths TEXT[],
                                weaknesses TEXT[],
                                study_topics TEXT[],
                                verdict TEXT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                            )
                        """)
                        cur.execute("""
                            INSERT INTO interview_history
                            (user_id, target_role, technical_score, communication_score, confidence_score,
                             overall_grade, strengths, weaknesses, study_topics, verdict)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            user_id, target_role,
                            analysis_data.get("technical_score", 5),
                            analysis_data.get("communication_score", 5),
                            analysis_data.get("confidence_score", 5),
                            analysis_data.get("overall_grade", "C"),
                            analysis_data.get("strengths", []),
                            analysis_data.get("critical_weaknesses", []),
                            analysis_data.get("study_topics", []),
                            analysis_data.get("verdict", "")
                        ))
                        conn.commit()
                        cur.close()
                        conn.close()
                    except Exception as db_err:
                        print(f"DB save error: {db_err}")

                    # Send analysis to frontend
                    await websocket.send_text(json.dumps({
                        "type": "analysis",
                        "payload": analysis_data,
                        "role": target_role
                    }))

                    await websocket.close()
                    break

            except Exception as inner_e:
                print(f"Interview error: {str(inner_e)}")
                traceback.print_exc()
                if temp_audio_path and os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)

    except WebSocketDisconnect:
        print(f"Interview WebSocket disconnected for user {user_id}")


@app.get("/api/interview/history/{user_id}")
def get_interview_history(user_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Ensure table exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS interview_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                target_role VARCHAR(100),
                technical_score INTEGER,
                communication_score INTEGER,
                confidence_score INTEGER,
                overall_grade VARCHAR(5),
                strengths TEXT[],
                weaknesses TEXT[],
                study_topics TEXT[],
                verdict TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

        cur.execute("""
            SELECT * FROM interview_history
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 10
        """, (user_id,))
        rows = cur.fetchall()

        # Convert datetime objects to strings
        history = []
        for row in rows:
            entry = dict(row)
            if entry.get("created_at"):
                entry["created_at"] = entry["created_at"].isoformat()
            history.append(entry)

        return {"status": "success", "history": history, "total": len(history)}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        cur.close()
        conn.close()
