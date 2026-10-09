from datetime import datetime, timezone, date
from sqlalchemy import String, Integer, Boolean, DateTime, Date, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    country: Mapped[str] = mapped_column(String(80), default="India")
    state: Mapped[str] = mapped_column(String(80), default="")
    city: Mapped[str] = mapped_column(String(80), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_quest_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    submissions: Mapped[list["Submission"]] = relationship(back_populates="user")
    xp_transactions: Mapped[list["XPTransaction"]] = relationship(back_populates="user")

class Quest(Base):
    __tablename__ = "quests"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(140))
    description: Mapped[str] = mapped_column(Text)
    time_slot: Mapped[str] = mapped_column(String(10), index=True)
    difficulty: Mapped[str] = mapped_column(String(10))
    estimated_minutes: Mapped[int] = mapped_column(Integer)
    proof_instructions: Mapped[str] = mapped_column(Text)
    base_xp: Mapped[int] = mapped_column(Integer)
    category: Mapped[str] = mapped_column(String(40))
    safety_notes: Mapped[str] = mapped_column(Text, default="Stay in a safe, public place.")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (UniqueConstraint("user_id", "idempotency_key", name="uq_submission_user_idempotency"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    quest_id: Mapped[int] = mapped_column(ForeignKey("quests.id"))
    image_path: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    verification_reason: Mapped[str] = mapped_column(Text, default="")
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(100))
    user: Mapped["User"] = relationship(back_populates="submissions")
    quest: Mapped["Quest"] = relationship()

class XPTransaction(Base):
    __tablename__ = "xp_transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    submission_id: Mapped[int | None] = mapped_column(ForeignKey("submissions.id"), unique=True, nullable=True)
    amount: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    user: Mapped["User"] = relationship(back_populates="xp_transactions")

class Badge(Base):
    __tablename__ = "badges"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)
    xp_threshold: Mapped[int] = mapped_column(Integer, default=0)

class UserBadge(Base):
    __tablename__ = "user_badges"
    __table_args__ = (UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    badge_id: Mapped[int] = mapped_column(ForeignKey("badges.id"))
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
