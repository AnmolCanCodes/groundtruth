# GroundTruth 🌍

### Touch Grass. Complete Quests. Earn XP.

GroundTruth is an AI-powered outdoor adventure game that turns everyday exploration into real-world quests.

Choose a challenge, step outside, capture photo proof, earn experience points, unlock achievements, and compete on weekly regional leaderboards.

## ✨ Features

* **Daily outdoor quests:** Explore Morning, Evening, and Night challenges.
* **AI-powered personalization:** Use an open-weight Gemma model to personalize quest titles, instructions, and creative twists.
* **Photo proof:** Submit an image for a basic relevance check.
* **XP and levels:** Earn experience points for approved quests.
* **Achievements:** Collect badges and build streaks.
* **Weekly leaderboards:** Compare approved quest activity by country, state, and city.
* **Responsible AI:** Keep reward calculations deterministic and communicate the limitations of image verification.

## 🎮 How It Works

1. Choose a time slot and browse available quests.
2. Select a quest and read its instructions.
3. Complete the activity outdoors.
4. Upload a photo as evidence.
5. The backend validates the submission and checks whether the image appears relevant.
6. Approved submissions earn XP and update the user's progress.
7. Weekly XP determines leaderboard rankings.

## 🧠 Why Gemma?

GroundTruth uses an open-weight language model to personalize outdoor challenges instead of relying entirely on static descriptions.

The model operates within a curated quest library and predefined safety constraints. Backend validation determines which quests are permitted and how much XP they award.

A compatible vision-capable model is required for AI-based image relevance checks. Model availability depends on the selected inference provider.

## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* Tailwind CSS

**Backend**

* Python
* FastAPI
* Pydantic
* SQLAlchemy

**AI**

* Gemma through a compatible inference provider
* Hugging Face Hub client

**Storage**

* SQLite for local development
* PostgreSQL for a multi-user deployment
* Image storage appropriate to the deployment environment

## 🏗️ Architecture

React frontend → FastAPI backend → Quest selection and validation → Gemma inference when needed → Photo verification → Reward engine → Database and leaderboard.

The AI provides personalization and relevance assessments. Python controls validation, XP awards, duplicate-claim prevention, and ranking calculations.

## 🚀 Getting Started

### Prerequisites

* Python 3.11 or later
* Node.js and npm
* A Hugging Face account and access to a compatible Gemma inference model

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd groundtruth
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On Windows, activate the environment with:

```bash
.venv\Scripts\activate
```

Create a `.env` file based on `.env.example`, then configure the database and model credentials.

Start the API:

```bash
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` to explore the API.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure the backend API URL in the frontend environment file if necessary.

### 4. Configure AI inference

Set your Hugging Face token and the identifiers of compatible text and vision models in the backend environment.

Never expose inference credentials in frontend code or commit secrets to Git.

## 🏆 Reward System

* XP is awarded only by the backend after approval.
* Lifetime XP determines user levels.
* Weekly XP determines leaderboard position.
* Badges recognize specific achievements.
* Daily caps and duplicate-claim checks discourage reward farming.

Initial quest rewards are configurable and should be tuned using actual usage.

## 🔐 Safety and Privacy

* Use a curated library of permitted outdoor activities.
* Avoid dangerous, inaccessible, or trespassing-related challenges.
* Do not require nighttime activity.
* Validate uploaded files and enforce upload limits.
* Do not publish user photos by default.
* Treat AI image assessments as estimates, not proof of time or location.
* Keep secrets and sensitive user information out of source control.

## 🌱 Why Open-Source AI?

GroundTruth explores how open-weight AI can encourage real-world participation rather than increase screen time. It combines creative AI personalization with deterministic software rules, making the system easier to inspect, evaluate, and improve.

## 🗺️ Roadmap

* [ ] Curated quest library
* [ ] Gemma-powered quest personalization
* [ ] User accounts and persistent progress
* [ ] Photo uploads and image relevance checks
* [ ] XP, levels, badges, and streaks
* [ ] Weekly regional leaderboards
* [ ] Responsive interface and deployed demo

## 📄 License

Choose and add an appropriate open-source license before publishing the repository.
