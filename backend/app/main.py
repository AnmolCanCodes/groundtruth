from datetime import datetime, timezone, timedelta
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from app.config import settings
from app.database import get_db, init_db
from app.models import User, Quest, Submission, XPTransaction, Badge, UserBadge
from app.schemas import RegisterIn, LoginIn, UserOut, TokenOut, QuestOut, SubmissionOut
from app.quests import seed_quests
from app.rewards import seed_badges, level_for_xp
from app.verification import save_valid_image, create_submission
from app.ai_service import personalize_quest

app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_origin], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
password_hash = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)

@app.on_event("startup")
def startup():
    init_db()
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_quests(db)
        seed_badges(db)
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required.", headers={"WWW-Authenticate":"Bearer"})
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (InvalidTokenError, KeyError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired access token.")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists.")
    return user

def make_token(user: User):
    expiry = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub": str(user.id), "exp": expiry}, settings.jwt_secret, algorithm="HS256")

@app.get("/health")
def health():
    return {"status":"ok", "app":settings.app_name}

@app.post("/api/auth/register", response_model=TokenOut, status_code=201)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.scalar(select(User.id).where((User.email == data.email.lower()) | (User.username == data.username))):
        raise HTTPException(status_code=409, detail="Username or email is already registered.")
    user = User(username=data.username, email=data.email.lower(), hashed_password=password_hash.hash(data.password),
                country=data.country.strip() or "India", state=data.state.strip(), city=data.city.strip())
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token":make_token(user), "user":user}

@app.post("/api/auth/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not password_hash.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"access_token":make_token(user), "user":user}

@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

@app.get("/api/quests", response_model=list[QuestOut])
def list_quests(time_slot: str | None = Query(default=None, pattern="^(morning|evening|night)$"),
                db: Session = Depends(get_db)):
    query = select(Quest).where(Quest.is_active.is_(True))
    if time_slot:
        query = query.where(Quest.time_slot == time_slot)
    return list(db.scalars(query.order_by(Quest.id)).all())

@app.get("/api/quests/daily", response_model=list[QuestOut])
def daily_quests(time_slot: str | None = Query(default=None, pattern="^(morning|evening|night)$"), db: Session = Depends(get_db)):
    query = select(Quest).where(Quest.is_active.is_(True))
    if time_slot:
        query = query.where(Quest.time_slot == time_slot)
    # Stable daily rotation based on UTC day; no external weather/location dependency.
    quests = list(db.scalars(query.order_by(Quest.id)).all())
    if not quests:
        return []
    offset = datetime.now(timezone.utc).timetuple().tm_yday % len(quests)
    return (quests[offset:] + quests[:offset])[:5]

@app.get("/api/quests/{quest_id}", response_model=QuestOut)
def get_quest(quest_id: int, db: Session = Depends(get_db)):
    quest = db.scalar(select(Quest).where(Quest.id == quest_id, Quest.is_active.is_(True)))
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found.")
    return quest

@app.post("/api/quests/{quest_id}/personalize")
def personalize(quest_id: int, preferences: str = Form(default=""), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quest = db.scalar(select(Quest).where(Quest.id == quest_id, Quest.is_active.is_(True)))
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found.")
    return personalize_quest(quest, preferences)

@app.post("/api/submissions", response_model=SubmissionOut, status_code=201)
async def submit(quest_id: int = Form(...), image: UploadFile = File(...),
                 idempotency_key: str = Header(..., alias="Idempotency-Key"),
                 user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not idempotency_key.strip() or len(idempotency_key) > 100:
        raise HTTPException(status_code=400, detail="Idempotency-Key must be 1-100 characters.")
    existing = db.scalar(select(Submission).where(Submission.user_id == user.id, Submission.idempotency_key == idempotency_key))
    if existing:
        return existing
    image_path = await save_valid_image(image)
    try:
        return create_submission(db, user, quest_id, image_path, idempotency_key)
    except Exception:
        Path(image_path).unlink(missing_ok=True)
        raise

@app.get("/api/submissions/me", response_model=list[SubmissionOut])
def my_submissions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(Submission).where(Submission.user_id == user.id).order_by(desc(Submission.submitted_at))).all())

@app.get("/api/submissions/{submission_id}", response_model=SubmissionOut)
def submission_detail(submission_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    submission = db.scalar(select(Submission).where(Submission.id == submission_id, Submission.user_id == user.id))
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")
    return submission

@app.get("/api/leaderboard/weekly")
def weekly_leaderboard(region_type: str = Query(..., pattern="^(country|state|city)$"), region: str = Query(..., min_length=1, max_length=80),
                       db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    region_column = {"country":User.country, "state":User.state, "city":User.city}[region_type]
    xp_expr = func.coalesce(func.sum(XPTransaction.amount), 0).label("weekly_xp")
    rows = db.execute(select(User, xp_expr).join(XPTransaction, XPTransaction.user_id == User.id)
        .where(region_column == region, XPTransaction.created_at >= week_start)
        .group_by(User.id).order_by(desc("weekly_xp"), User.username).limit(100)).all()
    return [{"rank":i, "username":u.username, "weekly_xp":int(xp), "level":level_for_xp(u.total_xp)} for i,(u,xp) in enumerate(rows, start=1)]

@app.get("/api/rewards/me")
def my_rewards(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Badge, UserBadge.earned_at).join(UserBadge, UserBadge.badge_id == Badge.id).where(UserBadge.user_id == user.id)).all()
    return {"total_xp":user.total_xp, "level":level_for_xp(user.total_xp), "current_streak":user.current_streak,
            "longest_streak":user.longest_streak, "badges":[{"code":b.code,"name":b.name,"description":b.description,"earned_at":earned} for b,earned in rows]}

# Admin/manual-review endpoint intentionally disabled unless a deployment adds an admin auth policy.
@app.get("/api/admin/review-queue")
def review_queue():
    raise HTTPException(status_code=501, detail="Add an administrator authorization policy before enabling manual review.")
