# ⚙️ Setup Guide

Complete installation and environment setup for MARKHUB.

---

## Prerequisites

| Tool         | Version   | Installation                           |
|--------------|-----------|----------------------------------------|
| **Node.js**  | ≥ 18.x    | [nodejs.org](https://nodejs.org/)      |
| **npm**      | ≥ 9.x     | Comes with Node.js                     |
| **Python**   | ≥ 3.10    | [python.org](https://python.org/)      |
| **PostgreSQL** | ≥ 15    | [postgresql.org](https://postgresql.org/) |
| **Git**      | ≥ 2.x     | [git-scm.com](https://git-scm.com/)   |

---

## 1. Clone the Repository

```bash
git clone https://github.com/technophille/MARKHUB.git
cd MARKHUB
```

---

## 2. Database Setup (PostgreSQL)

### Create the database

```bash
# Open PostgreSQL shell
psql postgres

# Create the database
CREATE DATABASE markhub;

# Connect to it
\c markhub
```

### Create required tables

```sql
-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table (career calibration data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    resume_filename TEXT,
    target_roles TEXT[],
    known_skills TEXT[],
    extracted_cv_skills TEXT[],
    target_salary INTEGER DEFAULT 0,
    github_url TEXT DEFAULT '',
    learning_hours_per_week INTEGER DEFAULT 15,
    soft_communication INTEGER DEFAULT 3,
    soft_leadership INTEGER DEFAULT 3,
    soft_teamwork INTEGER DEFAULT 3,
    soft_problem_solving INTEGER DEFAULT 3,
    soft_adaptability INTEGER DEFAULT 3,
    soft_time_management INTEGER DEFAULT 3,
    soft_presentation INTEGER DEFAULT 3,
    cv_text TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Verify

```bash
\dt   # Should show: users, user_profiles
\q    # Exit psql
```

---

## 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate    # macOS/Linux
# .venv\Scripts\activate     # Windows

# Install dependencies
pip install fastapi uvicorn psycopg2-binary PyPDF2 passlib[bcrypt]

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.

### Verify the backend is running

```bash
curl http://localhost:8000/
# → {"status":"ok","service":"Markhub AI Backend"}
```

### Environment Configuration

By default, the backend connects to PostgreSQL with:

| Setting    | Default Value                |
|------------|------------------------------|
| `dbname`   | `markhub`                    |
| `user`     | Current OS username (`$USER`)|
| `host`     | `localhost`                  |
| `port`     | `5432`                       |

To change these, edit the `DB_CONFIG` dictionary in `backend/main.py`.

---

## 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Available Scripts

| Command          | Description                     |
|------------------|---------------------------------|
| `npm run dev`    | Start development server        |
| `npm run build`  | Build for production             |
| `npm run start`  | Start production server          |
| `npm run lint`   | Run ESLint                       |

---

## 5. Running Both Servers

You'll need **two terminals** running simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then navigate to **http://localhost:3000** in your browser.

---

## Troubleshooting

### PostgreSQL connection errors

- Ensure PostgreSQL is running: `brew services start postgresql` (macOS) or `sudo systemctl start postgresql` (Linux)
- Verify the `markhub` database exists: `psql -l | grep markhub`
- Check your username matches `DB_CONFIG.user` in `backend/main.py`

### Port conflicts

- Backend default: `8000` — change with `uvicorn main:app --port <PORT>`
- Frontend default: `3000` — change with `npm run dev -- -p <PORT>`

### Python dependency issues

```bash
pip install --upgrade pip
pip install fastapi uvicorn psycopg2-binary PyPDF2 "passlib[bcrypt]"
```

### Node.js version errors

Ensure Node.js ≥ 18. Check with `node -v`. Use [nvm](https://github.com/nvm-sh/nvm) to manage versions if needed.
