# 🤝 Contributing to MARKHUB

Thank you for considering contributing to MARKHUB! This document outlines guidelines and best practices.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/MARKHUB.git
   cd MARKHUB
   ```
3. **Set up** the development environment — see [SETUP.md](SETUP.md)
4. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Project Structure

| Directory          | Description                           | Language           |
|--------------------|---------------------------------------|--------------------|
| `frontend/`        | Next.js React application             | TypeScript, TSX    |
| `backend/`         | FastAPI server                        | Python             |
| `docs/`            | Documentation                         | Markdown           |
| `html-prototypes/` | Original static mockups (read-only)   | HTML               |

---

## Development Guidelines

### Frontend (Next.js)

- Use **TypeScript** for all new components
- Follow the existing component structure in `src/components/`
- Use **Tailwind CSS v4** utility classes — avoid inline styles
- All dashboard pages go in `src/app/(dashboard)/`
- Use `"use client"` directive for interactive components

### Backend (FastAPI)

- Keep endpoints consistent with the existing pattern in `main.py`
- All API routes should return `{ "status": "success" | "error", ... }`
- Use parameterized SQL queries (never string concatenation)
- Add new skills to `MASTER_SKILLS_LIST` and `SKILL_META` as needed
- Document new endpoints in [API.md](API.md)

### General

- Write clear commit messages (see below)
- Test your changes locally before submitting a PR
- Keep PRs focused — one feature or fix per PR

---

## Commit Message Convention

```
<type>: <short description>

<optional body>
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code formatting (no logic changes)
- `refactor:` — Code restructuring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

**Examples:**
```
feat: add resume parsing support for DOCX files
fix: correct skill matching for multi-word skills
docs: update API reference with new simulation endpoint
```

---

## Pull Request Process

1. Ensure your code runs without errors locally
2. Update documentation if you've added new endpoints or features
3. Fill out the PR template with a clear description
4. Request a review from a maintainer
5. Address any feedback promptly

---

## Adding a New Career Role

To add a new career role to the platform:

1. Add the role to `ROLE_CATALOG` in `backend/main.py` with:
   - Required skills list
   - Salary range
   - Material icon name
   - Gradient color classes
2. Add entries to `FORAGE_EXERCISES` (if applicable)
3. Add entries to `ROLE_PROJECTS`
4. Add entries to `ROLE_CERTIFICATIONS`
5. Update `docs/ARCHITECTURE.md` role table

---

## Adding a New Skill

1. Add to `MASTER_SKILLS_LIST` in `backend/main.py`
2. Add learning metadata to `SKILL_META` (hours, weight)
3. Add course recommendations to `SKILL_COURSES`
4. Optionally add keyword inferences to `CV_KEYWORD_INFERENCES`

---

## Code of Conduct

- Be respectful and constructive in all interactions
- Welcome newcomers and help them get started
- Focus on the code, not the person
- Accept constructive criticism gracefully

---

## Questions?

Open an issue on GitHub or reach out to the maintainers.
