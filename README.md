# GroundTruth

Turn everyday exploration into structured goals, measurable progress, and real-world rewards.

GroundTruth is a local-first outdoor quest platform that blends movement, photography, game mechanics, and AI-assisted personalization. Users complete approved outdoor tasks, submit photo evidence, earn experience points, unlock badges, and track progress through a weekly regional leaderboard.

This project is designed to show how an open, self-hostable system can make real-world participation more engaging without forcing users to hand their data to a proprietary platform.

## What this project does

GroundTruth helps people:

- discover safe, outdoor challenges across different time slots
- complete real-world tasks with simple proof requirements
- upload photo evidence for validation
- earn XP, levels, and badges
- compare progress with others in their region
- self-host the app locally with full control over its data and model choices

## Why it exists

Many productivity, fitness, and learning apps keep users inside a screen. GroundTruth is built around a different idea: use digital motivation to get people outside, move through the world, and build healthy habits through small, repeatable actions.

The project also demonstrates a practical open-innovation approach:

- you can run it on your own machine
- your data can stay local instead of sitting on a third-party server
- you can swap, inspect, or fine-tune the model behind the experience
- you are not locked into one vendor or API contract

## How it works

1. A user signs up and selects a time slot such as morning, evening, or night.
2. They browse curated quests with clear instructions, difficulty, and proof requirements.
3. They complete the challenge in the real world.
4. They upload a photo as evidence.
5. The backend validates the upload and checks whether the image appears relevant to the task.
6. Approved submissions award XP and update the user’s streak, progress, and leaderboard position.
7. Weekly XP is aggregated by region such as country, state, or city.

The reward logic is deterministic and controlled in Python, while AI is used as an assistant layer, not as the only authority.

## Core features

- Daily and time-based quest browsing
- AI-assisted quest personalization using an open or hosted language model
- Photo upload validation and relevance checks
- XP and level progression
- Badge generation and streak tracking
- Weekly regional leaderboards
- JWT-based user authentication
- SQLite local database support for development or personal self-hosting
- FastAPI backend with structured API endpoints
- React frontend with protected routes and user dashboard flow

## AI and open-model strategy

GroundTruth is intentionally designed around open, inspectable AI instead of a black-box closed service.

The backend exposes model settings in a clean configuration layer and uses an inference layer that can be replaced with:

- a hosted Hugging Face model
- a locally running open model
- a different provider
- a custom prompt or fine-tuned model

This makes the system more flexible and transparent than a typical closed application that depends on one private API for all behavior.

## Technical stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT authentication

### Data and storage

- SQLite for local development
- local upload directory for evidence files
- structured server-side reward logic

### AI layer

- Hugging Face InferenceClient
- configurable text generation model
- optional vision model for relevance checks

## System architecture

The app follows a straightforward flow:

Frontend → FastAPI API → SQL database → quest logic + requirements → AI personalization/relevance checks → XP rewards + leaderboard updates

Important design principle: AI is advisory. The backend still decides whether the user gets credit.

## Project structure

```text
GroundTruth/
├── README.md
├── LICENSE
├── .gitignore
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── README.md
│   ├── requirements.txt
│   ├── groundtruth.db
│   ├── uploads/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── ai_service.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── quests.py
│   │   ├── rewards.py
│   │   ├── schemas.py
│   │   ├── verification.py
│   │   └── __pycache__/
│   └── tests/
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_leaderboard.py
│       ├── test_quests.py
│       └── test_submissions.py
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── index.html
│   ├── eslint.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── api.js
│   ├── README.md
│   ├── public/
│   ├── components/
│   ├── pages/
│   └── src/
```

## How it works in practice

### Quest flow

- quest is selected by time slot and difficulty
- user reads task instructions and proof requirements
- user completes the real-world action
- proof image is uploaded
- backend checks file validity and submission uniqueness
- model may assist with personalization or image relevance
- reward is applied only after backend validation

### Reward flow

- XP is tied to approved submissions
- level is derived from cumulative XP
- streaks are tracked on a date-based model
- badges unlock through specific accomplishments
- leaderboard rankings are computed by weekly XP in a region

## Setup for another computer

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/AnmolCanCodes/groundtruth.git
cd groundtruth
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Then edit the `.env` file:

```env
APP_NAME=GroundTruth API
DATABASE_URL=sqlite:///./groundtruth.db
HF_TOKEN=
HF_TEXT_MODEL=google/gemma-2-2b-it
HF_VISION_MODEL=
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE_MINUTES=60
FRONTEND_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=5
```

### 3. Run the API

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

The API will be available at:

- http://127.0.0.1:8000
- API docs: http://127.0.0.1:8000/docs

### 4. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite app in the browser, usually at:

- http://localhost:5173

### 5. Optional: enable AI in the app

If you want personalized quests and model-based image checks:

- add a valid Hugging Face token
- set `HF_TEXT_MODEL` and optionally `HF_VISION_MODEL`
- keep your `.env` file local and never commit secrets

## Open innovation: why this matters

This project is a good example of why open-based systems matter for real-world software.

### Does it run on a laptop with no internet?

- Yes, the frontend and backend can run on a laptop without external internet access.
- The database can remain local as SQLite.
- The upload directory can remain local.
- AI features work only if you connect to a local model or a reachable model server.
- If you use remote Hugging Face APIs, internet is required for that inference path.

### Can someone keep their data off a server they do not control?

Yes, by design.

This app is structured so the core workflow can run self-hosted:

- local SQLite database
- local upload storage
- local secrets in `.env`
- no mandatory cloud dependency for the main game loop

That gives users a better privacy posture than a closed SaaS application that stores everything on a vendor-controlled server.

### Can you fine-tune, swap models, or change behavior?

Yes, this is one of the strongest advantages of the open approach.

The project isolates AI logic in:

- `backend/app/ai_service.py`
- `backend/app/config.py`
- `backend/app/main.py`

That means you can:

- replace the text model
- swap the vision model
- change the prompt logic
- add a local model endpoint
- fine-tune stronger or lighter models for your use case
- adjust reward and validation logic without depending on a proprietary backend team

### Does it cost nothing to run?

The software itself is free and open to run locally. The real cost depends on deployment choices:

- local laptop/self-hosted: near-zero running cost beyond electricity
- remote hosted LLM: actual API cost
- cloud deployment: ongoing hosting and bandwidth costs

That makes the open approach appealing for prototypes, personal projects, learning environments, and privacy-sensitive deployments.

## Where open-based design works better than a closed model

Open-based design gives GroundTruth several advantages over a closed or proprietary system:

- better transparency: the logic is inspectable and editable
- stronger privacy: local data stays under your control
- easier customization: replace prompts, models, and validation logic
- lower dependency risk: no single vendor lock-in
- easier experimentation: test local models, edge cases, and behavior changes quickly
- better trust: users can understand and audit how the system works

A closed system may be simpler in the short term, but it often reduces control, flexibility, and ownership. This app was intentionally built to keep those controls in the hands of the operator.

## Testing

```bash
cd backend
source .venv/bin/activate
pytest -q
```

## License

This project is distributed under the repository license in [LICENSE](LICENSE).


## Summary

GroundTruth is a practical example of using open, local-first systems to create an engaging real-world challenge app. It combines game mechanics, community competition, and AI personalization without depending on a closed SaaS model. That makes it a strong example of what open innovation can do when applied to everyday digital experiences.

