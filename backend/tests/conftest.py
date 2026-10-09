import os
os.environ["DATABASE_URL"] = "sqlite:///./test_groundtruth.db"
os.environ["JWT_SECRET"] = "test-secret-that-is-long-enough-for-tests"
os.environ["HF_TOKEN"] = ""
os.environ["UPLOAD_DIR"] = "test_uploads"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import app
from app.models import Quest
from app.quests import QUEST_DATA
from app.rewards import seed_badges

@pytest.fixture()
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread":False}, poolclass=StaticPool)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(engine)
    def override_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = override_db
    db = TestingSession()
    for title, desc, slot, diff, mins, proof, category in QUEST_DATA:
        db.add(Quest(title=title, description=desc, time_slot=slot, difficulty=diff, estimated_minutes=mins,
                     proof_instructions=proof, base_xp={"easy":30,"medium":50,"hard":70}[diff], category=category,
                     safety_notes="Be safe.", is_active=True))
    seed_badges(db)
    db.close()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
