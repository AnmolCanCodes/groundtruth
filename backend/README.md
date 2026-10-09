# GroundTruth Backend

FastAPI MVP for an outdoor quest game. Users browse curated quests, upload image evidence, and earn XP only when a submission is approved.

## Features
- JWT authentication; Argon2 password hashing
- SQLite local development; PostgreSQL supported through `DATABASE_URL`
- 30 seeded quests across morning, evening, and optional safe night activities
- Image format/content/size validation with randomized server-side filenames
- Hugging Face text personalization with curated-quest fallback
- Vision-model assessment is advisory; valid photo uploads are auto-approved unless the image is clearly irrelevant
- XP ledger, levels, badges, streak tracking, and weekly regional leaderboard
- pytest suite using an isolated in-memory SQLite database

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit JWT_SECRET before any non-local deployment.
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs`.

## Environment variables

| Variable | Purpose |
|---|---|
| `APP_NAME` | API title |
| `DATABASE_URL` | SQLite URL locally or PostgreSQL SQLAlchemy URL |
| `HF_TOKEN` | Optional Hugging Face token |
| `HF_TEXT_MODEL` | Hosted text model supporting chat completion |
| `HF_VISION_MODEL` | Optional vision-capable model supported by configured inference provider |
| `JWT_SECRET` | Secret used to sign JWTs; use a long random value |
| `JWT_EXPIRE_MINUTES` | Access-token lifetime |
| `FRONTEND_ORIGIN` | Single allowed frontend origin |
| `UPLOAD_DIR` | Private local upload directory |
| `MAX_UPLOAD_MB` | Maximum upload size |

## Main endpoints

- `GET /health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/quests`, `GET /api/quests/{quest_id}`, `GET /api/quests/daily`
- `POST /api/quests/{quest_id}/personalize` (authenticated)
- `POST /api/submissions` (authenticated; multipart `quest_id` and `image`, plus `Idempotency-Key` header)
- `GET /api/submissions/me`, `GET /api/submissions/{submission_id}` (owner-only)
- `GET /api/leaderboard/weekly?region_type=country&region=India`
- `GET /api/rewards/me`

## Tests

```bash
pytest -q
```

## Architecture
`main.py` registers HTTP routes; `config.py` loads environment settings; `database.py` owns SQLAlchemy setup; `models.py` defines persistence; `schemas.py` validates request/response shapes; `quests.py` seeds the curated library; `ai_service.py` isolates hosted inference; `verification.py` validates and stores uploads; `rewards.py` calculates levels and handles approval rewards.

## Important limitations
- This is an MVP, not production-hardened. Add Alembic migrations, rate limiting, account verification, structured logging, backup/retention policy, and deployment secrets management before launch.
- Vision model interfaces vary by provider/model. The configured endpoint must support the Hugging Face `InferenceClient` vision method. In this demo flow, the model is advisory: valid image uploads are auto-approved unless the model clearly marks them as unrelated.
- The backend enforces file validation, quest checks, and XP rewards in Python; the model does not act as the only source of truth.
- Uploads are stored locally and are not exposed through a static route. Use private object storage for multi-instance deployments.
- Weekly boundaries use UTC. Streak calendar days currently use UTC, not each user's local timezone.
- Database tables are created automatically for development. Use migrations for schema changes in production.
- For robust concurrent idempotency, keep the database uniqueness constraint and handle unique-constraint races at the API boundary before production deployment.
