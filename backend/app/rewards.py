from datetime import datetime, timezone, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models import User, Submission, XPTransaction, Badge, UserBadge

LEVEL_THRESHOLDS = [(1,0),(2,200),(3,600),(4,1200),(5,2000),(6,3000)]
XP_BY_DIFFICULTY = {"easy":30,"medium":50,"hard":70}

def level_for_xp(xp: int) -> int:
    level = 1
    for candidate, threshold in LEVEL_THRESHOLDS:
        if xp >= threshold:
            level = candidate
    return level

def seed_badges(db: Session):
    data = [
        ("first_quest","First Quest","Get your first quest approved.",0),
        ("explorer","Explorer","Complete 10 approved quests.",0),
        ("weekly_adventurer","Weekly Adventurer","Complete 5 quests in one UTC week.",0),
        ("nature_spotter","Nature Spotter","Complete a quest in the nature category.",0),
    ]
    for code, name, desc, threshold in data:
        if not db.scalar(select(Badge).where(Badge.code == code)):
            db.add(Badge(code=code,name=name,description=desc,xp_threshold=threshold))
    db.commit()

def update_streak(user: User, today: date | None = None):
    today = today or datetime.now(timezone.utc).date()
    if user.last_quest_date == today:
        return
    if user.last_quest_date == today - timedelta(days=1):
        user.current_streak += 1
    else:
        user.current_streak = 1
    user.longest_streak = max(user.longest_streak, user.current_streak)
    user.last_quest_date = today

def approve_submission(db: Session, submission: Submission) -> int:
    """Idempotent transaction: only explicitly pending submissions can be approved automatically."""
    db.refresh(submission)
    if submission.status == "approved" or db.scalar(select(XPTransaction.id).where(XPTransaction.submission_id == submission.id)):
        return 0
    if submission.status != "pending":
        return 0
    amount = XP_BY_DIFFICULTY[submission.quest.difficulty]
    submission.status = "approved"
    submission.xp_awarded = amount
    submission.reviewed_at = datetime.now(timezone.utc)
    db.add(XPTransaction(user_id=submission.user_id, submission_id=submission.id, amount=amount, reason=f"Approved quest: {submission.quest.title}"))
    user = db.scalar(select(User).where(User.id == submission.user_id))
    user.total_xp += amount
    update_streak(user)
    db.flush()
    approved_count = db.scalar(select(func.count(Submission.id)).where(Submission.user_id == user.id, Submission.status == "approved"))
    week_start = datetime.now(timezone.utc).date() - timedelta(days=datetime.now(timezone.utc).weekday())
    week_count = db.scalar(select(func.count(Submission.id)).where(Submission.user_id == user.id, Submission.status == "approved", Submission.reviewed_at >= datetime.combine(week_start, datetime.min.time(), tzinfo=timezone.utc))) or 0
    codes = []
    if approved_count >= 1: codes.append("first_quest")
    if approved_count >= 10: codes.append("explorer")
    if week_count >= 5: codes.append("weekly_adventurer")
    if submission.quest.category == "nature": codes.append("nature_spotter")
    for code in codes:
        badge = db.scalar(select(Badge).where(Badge.code == code))
        if badge and not db.scalar(select(UserBadge.id).where(UserBadge.user_id == user.id, UserBadge.badge_id == badge.id)):
            db.add(UserBadge(user_id=user.id, badge_id=badge.id))
    db.commit()
    return amount
