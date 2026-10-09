from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=30,)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    country: str = Field(default="", max_length=80)
    state: str = Field(default="", max_length=80)
    city: str = Field(default="", max_length=80)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    country: str
    state: str
    city: str
    total_xp: int
    current_streak: int
    longest_streak: int

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class QuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    time_slot: str
    difficulty: str
    estimated_minutes: int
    proof_instructions: str
    base_xp: int
    category: str
    safety_notes: str

class SubmissionOut(BaseModel):
    id: int
    quest_id: int
    status: str
    verification_reason: str
    xp_awarded: int
    submitted_at: datetime
    reviewed_at: datetime | None

class PersonalizedQuest(BaseModel):
    title: str
    description: str
    creative_twist: str | None = None
